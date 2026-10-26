// Preview Monitor Component for MVcut Pro
import { icons } from './icons.js';
import { store } from '../core/state.js';
import { aspectRatios } from '../core/presets.js';
import { VideoRenderer } from '../core/renderer.js';

export function initPreview(previewElement) {
  let renderer = null;

  function formatTimecode(seconds) {
    const s = Math.max(0, seconds || 0);
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const frames = Math.floor((s % 1) * 30);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  }

  function setupDOM() {
    const state = store.getState();
    const ratioConfig = aspectRatios.find(r => r.id === state.aspectRatio) || aspectRatios[0];

    previewElement.innerHTML = `
      <!-- Top info bar -->
      <div class="preview-top-bar">
        <div class="preview-top-left">
          <span style="font-weight: 700; color: #fff;">Monitor de Visualização</span>
          <span class="badge-pro" id="preview-ratio-badge">${ratioConfig.id} PRO</span>
        </div>
        <div class="preview-top-right">
          <span style="color: var(--text-muted); font-size: 11px;" id="preview-res-label">${ratioConfig.width}x${ratioConfig.height}</span>
        </div>
      </div>

      <!-- Viewport & Canvas Container -->
      <div class="preview-viewport-container" id="preview-container">
        <div class="canvas-wrapper" id="canvas-wrapper">
          <canvas id="main-canvas" width="${ratioConfig.width}" height="${ratioConfig.height}"></canvas>
        </div>
      </div>

      <!-- Bottom Playback Controls Bar -->
      <div class="preview-bottom-bar">
        <!-- Timecode -->
        <div class="timecode-display">
          <span class="timecode-current" id="tc-current">${formatTimecode(state.currentTime)}</span>
          <span class="timecode-total">/</span>
          <span class="timecode-total" id="tc-total">${formatTimecode(state.duration)}</span>
        </div>

        <!-- Center Controls -->
        <div class="playback-controls">
          <button class="btn btn-icon btn-ghost" id="btn-skip-back" title="Voltar 1s">
            ${icons.skipBack}
          </button>
          
          <button class="btn-play-large" id="btn-play-pause" title="Reproduzir / Pausar (Espaço)">
            ${state.isPlaying ? icons.pause : icons.play}
          </button>

          <button class="btn-icon btn-ghost" id="btn-skip-fwd" title="Avançar 1s">
            ${icons.skipForward}
          </button>
        </div>

        <!-- Right Controls -->
        <div class="preview-top-right">
          <button class="btn btn-icon btn-ghost" id="btn-toggle-loop" title="Repetir (Loop)">
            <span style="font-size: 10px; font-weight: bold; color: ${state.loop ? 'var(--accent-cyan)' : 'var(--text-muted)'};">LOOP</span>
          </button>
          <button class="btn btn-icon btn-ghost" id="btn-fullscreen" title="Tela Cheia">
            ${icons.fullscreen}
          </button>
        </div>
      </div>
    `;

    const canvas = previewElement.querySelector('#main-canvas');
    if (canvas) {
      renderer = new VideoRenderer(canvas);
    }

    adjustCanvasAspect();
    attachEvents();
  }

  function adjustCanvasAspect() {
    const container = previewElement.querySelector('#preview-container');
    const wrapper = previewElement.querySelector('#canvas-wrapper');
    if (!container || !wrapper) return;

    const state = store.getState();
    const ratioConfig = aspectRatios.find(r => r.id === state.aspectRatio) || aspectRatios[0];

    const pad = window.innerWidth < 880 ? 8 : 24;
    const cWidth = Math.max(50, container.clientWidth - pad);
    const cHeight = Math.max(50, container.clientHeight - pad);

    const targetRatio = ratioConfig.width / ratioConfig.height;
    let w, h;

    if (cWidth / cHeight > targetRatio) {
      h = cHeight;
      w = h * targetRatio;
    } else {
      w = cWidth;
      h = w / targetRatio;
    }

    wrapper.style.width = `${Math.round(w)}px`;
    wrapper.style.height = `${Math.round(h)}px`;
  }

  function attachEvents() {
    const playBtn = previewElement.querySelector('#btn-play-pause');
    playBtn?.addEventListener('click', () => store.togglePlay());

    const skipBackBtn = previewElement.querySelector('#btn-skip-back');
    skipBackBtn?.addEventListener('click', () => {
      store.setCurrentTime(store.getState().currentTime - 1);
    });

    const skipFwdBtn = previewElement.querySelector('#btn-skip-fwd');
    skipFwdBtn?.addEventListener('click', () => {
      store.setCurrentTime(store.getState().currentTime + 1);
    });

    const loopBtn = previewElement.querySelector('#btn-toggle-loop');
    loopBtn?.addEventListener('click', () => {
      store.state.loop = !store.state.loop;
      const span = loopBtn.querySelector('span');
      if (span) span.style.color = store.state.loop ? 'var(--accent-cyan)' : 'var(--text-muted)';
    });

    const fsBtn = previewElement.querySelector('#btn-fullscreen');
    fsBtn?.addEventListener('click', () => {
      const container = previewElement.querySelector('#preview-container');
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container?.requestFullscreen().catch(() => {});
      }
    });

    window.addEventListener('resize', () => adjustCanvasAspect());
  }

  // Update dynamic timecode and play/pause icon
  store.subscribe('time:changed', (t) => {
    const tcCurrent = previewElement.querySelector('#tc-current');
    if (tcCurrent) tcCurrent.textContent = formatTimecode(t);
  });

  store.subscribe('timeline:updated', () => {
    const tcTotal = previewElement.querySelector('#tc-total');
    if (tcTotal) tcTotal.textContent = formatTimecode(store.getState().duration);
  });

  store.subscribe('playback:changed', (playing) => {
    const playBtn = previewElement.querySelector('#btn-play-pause');
    if (playBtn) {
      playBtn.innerHTML = playing ? icons.pause : icons.play;
    }
  });

  store.subscribe('aspectRatio:changed', (newRatio) => {
    const ratioConfig = aspectRatios.find(r => r.id === newRatio) || aspectRatios[0];
    const badge = previewElement.querySelector('#preview-ratio-badge');
    if (badge) badge.textContent = `${ratioConfig.id} PRO`;
    const resLabel = previewElement.querySelector('#preview-res-label');
    if (resLabel) resLabel.textContent = `${ratioConfig.width}x${ratioConfig.height}`;
    adjustCanvasAspect();
  });

  setupDOM();
  return { getRenderer: () => renderer };
}
