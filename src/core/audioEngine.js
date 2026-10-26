// Audio engine: routes every video/audio element through Web Audio so that
// volume, voice effects, audio enhancement and export mixing actually work.
let ctx = null;
let master = null;
let monitor = null;
let exportDest = null;
let workletReady = null;
let workletLoaded = false;

const chains = new Map(); // media element -> chain

const PITCH_WORKLET = `
class PitchShifter extends AudioWorkletProcessor {
  static get parameterDescriptors() { return [{ name: 'pitch', defaultValue: 1, minValue: 0.25, maxValue: 4 }]; }
  constructor() {
    super();
    this.size = 2048;
    this.bufs = [new Float32Array(this.size), new Float32Array(this.size)];
    this.w = 0;
    this.phase = 0;
  }
  read(buf, pos) {
    const n = this.size;
    pos = ((pos % n) + n) % n;
    const i = Math.floor(pos), f = pos - i;
    return buf[i] * (1 - f) + buf[(i + 1) % n] * f;
  }
  process(inputs, outputs, params) {
    const input = inputs[0], output = outputs[0];
    if (!input || input.length === 0) return true;
    const pitch = params.pitch[0];
    const n = this.size;
    const frames = output[0].length;
    for (let s = 0; s < frames; s++) {
      const p1 = this.phase, p2 = (this.phase + 0.5) % 1;
      const g1 = Math.sin(Math.PI * p1), g2 = Math.sin(Math.PI * p2);
      for (let c = 0; c < output.length; c++) {
        const inCh = input[Math.min(c, input.length - 1)];
        const buf = this.bufs[Math.min(c, 1)];
        buf[this.w] = inCh[s];
        output[c][s] = this.read(buf, this.w - p1 * n) * g1 + this.read(buf, this.w - p2 * n) * g2;
      }
      this.w = (this.w + 1) % n;
      this.phase += (1 - pitch) / n;
      this.phase -= Math.floor(this.phase);
    }
    return true;
  }
}
registerProcessor('pitch-shifter', PitchShifter);
`;

export function getAudioContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    monitor = ctx.createGain();
    master.connect(monitor);
    monitor.connect(ctx.destination);
    if (ctx.createMediaStreamDestination) {
      exportDest = ctx.createMediaStreamDestination();
      master.connect(exportDest);
    }
    if (ctx.audioWorklet) {
      const url = URL.createObjectURL(new Blob([PITCH_WORKLET], { type: 'application/javascript' }));
      workletReady = ctx.audioWorklet.addModule(url).then(() => {
        workletLoaded = true;
        // Rebuild chains that were waiting for the pitch shifter
        chains.forEach((chain) => {
          if (chain.effect === 'deep' || chain.effect === 'chipmunk') buildChain(chain, true);
        });
      }).catch(() => {});
    }
  }
  return ctx;
}

export function resumeAudio() {
  getAudioContext();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function getExportAudioTracks() {
  getAudioContext();
  return exportDest ? exportDest.stream.getAudioTracks() : [];
}

export function setMonitorMuted(muted) {
  getAudioContext();
  monitor.gain.value = muted ? 0 : 1;
}

function isMediaElement(el) {
  return el instanceof HTMLMediaElement;
}

function ensureChain(media) {
  if (chains.has(media)) return chains.get(media);
  const c = getAudioContext();
  let source;
  try {
    source = c.createMediaElementSource(media);
  } catch (e) {
    return null;
  }
  const volume = c.createGain();
  volume.connect(master);
  const chain = { source, volume, nodes: [], effect: null, enhance: null };
  chains.set(media, chain);
  buildChain(chain, true, 'none', false);
  return chain;
}

function disconnectAll(chain) {
  try { chain.source.disconnect(); } catch (e) {}
  chain.nodes.forEach((n) => {
    try { n.disconnect(); } catch (e) {}
    if (n instanceof OscillatorNode) { try { n.stop(); } catch (e) {} }
  });
  chain.nodes = [];
}

function buildChain(chain, force, effect = chain.effect, enhance = chain.enhance) {
  if (!force && chain.effect === effect && chain.enhance === enhance) return;
  const c = ctx;
  disconnectAll(chain);
  chain.effect = effect;
  chain.enhance = enhance;

  let last = chain.source;
  const add = (node) => { chain.nodes.push(node); last.connect(node); last = node; return node; };

  // 1. Audio enhancement: rumble cut, presence boost, compression
  if (enhance) {
    const hp = add(c.createBiquadFilter()); hp.type = 'highpass'; hp.frequency.value = 85;
    const lp = add(c.createBiquadFilter()); lp.type = 'lowpass'; lp.frequency.value = 12000;
    const presence = add(c.createBiquadFilter()); presence.type = 'peaking'; presence.frequency.value = 3000; presence.gain.value = 3; presence.Q.value = 0.8;
    const comp = add(c.createDynamicsCompressor());
    comp.threshold.value = -24; comp.knee.value = 20; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
    const makeup = add(c.createGain()); makeup.gain.value = 1.4;
  }

  // 2. Voice effect
  if ((effect === 'deep' || effect === 'chipmunk') && workletLoaded) {
    const node = new AudioWorkletNode(c, 'pitch-shifter', { outputChannelCount: [2] });
    node.parameters.get('pitch').value = effect === 'deep' ? 0.7 : 1.6;
    add(node);
  } else if (effect === 'robot') {
    const ring = c.createGain();
    ring.gain.value = 0;
    const osc = c.createOscillator();
    osc.frequency.value = 55;
    osc.connect(ring.gain);
    osc.start();
    chain.nodes.push(osc);
    add(ring);
  } else if (effect === 'radio') {
    const hp = add(c.createBiquadFilter()); hp.type = 'highpass'; hp.frequency.value = 500;
    const lp = add(c.createBiquadFilter()); lp.type = 'lowpass'; lp.frequency.value = 3200;
    const shaper = add(c.createWaveShaper());
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(2.5 * x); }
    shaper.curve = curve;
  } else if (effect === 'echo') {
    const dry = c.createGain();
    const delay = c.createDelay(1.0); delay.delayTime.value = 0.28;
    const feedback = c.createGain(); feedback.gain.value = 0.38;
    const wet = c.createGain(); wet.gain.value = 0.5;
    const out = c.createGain();
    last.connect(dry); dry.connect(out);
    last.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(out);
    chain.nodes.push(dry, delay, feedback, wet, out);
    last = out;
  }

  last.connect(chain.volume);
}

// Called every frame/seek by the renderer for the clip currently using `media`.
export function updateMediaAudio(media, { volume = 1, muted = false, effect = 'none', enhance = false }) {
  if (!isMediaElement(media)) return;
  getAudioContext();
  const chain = ensureChain(media);
  if (!chain) {
    media.volume = muted ? 0 : Math.max(0, Math.min(1, volume));
    return;
  }
  // Element volume stays at 1; loudness is controlled by the gain node (allows up to 200%)
  media.muted = false;
  media.volume = 1;
  buildChain(chain, false, effect || 'none', !!enhance);
  chain.volume.gain.value = muted ? 0 : Math.max(0, Math.min(2, volume));
}

export function silenceMedia(media) {
  const chain = chains.get(media);
  if (chain) chain.volume.gain.value = 0;
}

export { workletReady };
