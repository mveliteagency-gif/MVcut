// Complete Pro Presets, LUTs, Visual Effects, Transitions, Speed Curves & Audio FX for KrakenCut Pro

export const aspectRatios = [
  { id: '16:9', name: '16:9 (YouTube/Desktop)', width: 1920, height: 1080 },
  { id: '9:16', name: '9:16 (TikTok/Reels/Shorts)', width: 1080, height: 1920 },
  { id: '1:1', name: '1:1 (Instagram Feed)', width: 1080, height: 1080 },
  { id: '4:5', name: '4:5 (Instagram Retrato)', width: 1080, height: 1350 },
  { id: '21:9', name: '21:9 (Cinema Ultrawide)', width: 2560, height: 1080 }
];

// All Pro Filters categorized like CapCut Pro
export const filterCategories = [
  { id: 'all', name: 'Todos' },
  { id: 'cinema', name: 'Cinema & Filmes' },
  { id: 'retro', name: 'Vintage & Retrô' },
  { id: 'moody', name: 'Moody & Dark' },
  { id: 'portrait', name: 'Retrato & Pele' },
  { id: 'nature', name: 'Natureza & Viagem' }
];

export const filterPresets = [
  // Cinema & Filmes
  {
    id: 'teal-orange',
    name: 'Teal & Orange Hollywood',
    category: 'cinema',
    tag: 'PRO',
    filters: { brightness: 104, contrast: 130, saturation: 140, hue: 15, warmth: 25, vignette: 28, blur: 0 }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077 Neon',
    category: 'cinema',
    tag: 'PRO',
    filters: { brightness: 110, contrast: 145, saturation: 160, hue: 195, warmth: -25, vignette: 35, blur: 0 }
  },
  {
    id: 'oppenheimer',
    name: 'Oppenheimer 70mm',
    category: 'cinema',
    tag: 'PRO',
    filters: { brightness: 98, contrast: 135, saturation: 85, hue: 355, warmth: 18, vignette: 22, blur: 0 }
  },
  {
    id: 'blade-runner',
    name: 'Blade Runner Dystopia',
    category: 'cinema',
    tag: 'PRO',
    filters: { brightness: 92, contrast: 150, saturation: 125, hue: 28, warmth: 40, vignette: 45, blur: 0 }
  },
  {
    id: 'film-noir',
    name: 'Film Noir 1940 P&B',
    category: 'cinema',
    tag: 'PRO',
    filters: { brightness: 105, contrast: 165, saturation: 0, hue: 0, warmth: 0, vignette: 40, blur: 0 }
  },

  // Vintage & Retrô
  {
    id: 'retro-vhs',
    name: 'VHS Camcorder 1995',
    category: 'retro',
    tag: 'PRO',
    filters: { brightness: 112, contrast: 118, saturation: 80, hue: 345, warmth: 20, vignette: 25, blur: 0.6 }
  },
  {
    id: 'kodak-portra',
    name: 'Kodak Portra 400',
    category: 'retro',
    tag: 'PRO',
    filters: { brightness: 106, contrast: 112, saturation: 115, hue: 8, warmth: 30, vignette: 15, blur: 0 }
  },
  {
    id: 'super-8mm',
    name: 'Super 8mm Vintage',
    category: 'retro',
    tag: 'PRO',
    filters: { brightness: 115, contrast: 125, saturation: 90, hue: 25, warmth: 35, vignette: 38, blur: 0.4 }
  },
  {
    id: 'polaroid-warm',
    name: 'Polaroid Instantânea',
    category: 'retro',
    tag: 'PRO',
    filters: { brightness: 118, contrast: 95, saturation: 105, hue: 12, warmth: 40, vignette: 20, blur: 0.2 }
  },

  // Moody & Dark
  {
    id: 'gothic-shadow',
    name: 'Gothic Dark Shadow',
    category: 'moody',
    tag: 'PRO',
    filters: { brightness: 88, contrast: 160, saturation: 70, hue: 210, warmth: -30, vignette: 50, blur: 0 }
  },
  {
    id: 'nordic-cold',
    name: 'Frio Nórdico (Ice Blue)',
    category: 'moody',
    tag: 'PRO',
    filters: { brightness: 96, contrast: 120, saturation: 90, hue: 190, warmth: -45, vignette: 25, blur: 0 }
  },
  {
    id: 'midnight-city',
    name: 'Meia-Noite Urbana',
    category: 'moody',
    tag: 'PRO',
    filters: { brightness: 90, contrast: 140, saturation: 110, hue: 220, warmth: -15, vignette: 40, blur: 0 }
  },

  // Retrato & Pele
  {
    id: 'soft-glow',
    name: 'Glow Suave Pele Perfeita',
    category: 'portrait',
    tag: 'PRO',
    filters: { brightness: 112, contrast: 92, saturation: 108, hue: 5, warmth: 15, vignette: 10, blur: 0.8 }
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour (Luz Dourada)',
    category: 'portrait',
    tag: 'PRO',
    filters: { brightness: 110, contrast: 115, saturation: 130, hue: 18, warmth: 50, vignette: 18, blur: 0 }
  },
  {
    id: 'bronze-tan',
    name: 'Bronze Tropical',
    category: 'portrait',
    tag: 'PRO',
    filters: { brightness: 105, contrast: 122, saturation: 135, hue: 22, warmth: 35, vignette: 20, blur: 0 }
  },

  // Natureza & Viagem
  {
    id: 'deep-ocean',
    name: 'Oceano Profundo',
    category: 'nature',
    tag: 'PRO',
    filters: { brightness: 102, contrast: 128, saturation: 145, hue: 180, warmth: -20, vignette: 25, blur: 0 }
  },
  {
    id: 'lush-forest',
    name: 'Floresta Esmeralda',
    category: 'nature',
    tag: 'PRO',
    filters: { brightness: 100, contrast: 135, saturation: 150, hue: 95, warmth: 10, vignette: 22, blur: 0 }
  }
];

// All Pro Visual Effects
export const effectCategories = [
  { id: 'all', name: 'Todos' },
  { id: 'glitch', name: 'Glitch & Distorção' },
  { id: 'light', name: 'Luz & Atmosfera' },
  { id: 'retro', name: 'Filme & CRT' },
  { id: 'motion', name: 'Movimento & Câmera' }
];

export const effectPresets = [
  { id: 'none', name: 'Sem Efeito', category: 'all' },
  { id: 'glitch-rgb', name: 'RGB Split Chromatic (Pro)', category: 'glitch', tag: 'PRO' },
  { id: 'digital-datamosh', name: 'Datamosh Glitch (Pro)', category: 'glitch', tag: 'PRO' },
  { id: 'crt-scanlines', name: 'TV Tubo CRT Scanlines', category: 'retro', tag: 'PRO' },
  { id: 'film-dust', name: 'Poeira & Arranhões de Filme', category: 'retro', tag: 'PRO' },
  { id: 'anamorphic-flare', name: 'Lens Flare Anamórfico Azul', category: 'light', tag: 'PRO' },
  { id: 'light-leak', name: 'Vazamento de Luz Dourada', category: 'light', tag: 'PRO' },
  { id: 'neon-aura', name: 'Aura Neon Brilhante', category: 'light', tag: 'PRO' },
  { id: 'flash-strobe', name: 'Strobe Flash Branco', category: 'light', tag: 'PRO' },
  { id: 'camera-shake', name: 'Tremor de Câmera Handheld', category: 'motion', tag: 'PRO' },
  { id: 'zoom-pulse', name: 'Zoom Pulse na Batida', category: 'motion', tag: 'PRO' },
  { id: 'prism-kaleido', name: 'Prisma Óptico Refração', category: 'motion', tag: 'PRO' }
];

// Speed Curves (Curvas de Rampa de Velocidade CapCut Pro)
export const speedCurves = [
  { id: 'standard', name: 'Constante (1.0x)', points: [1, 1, 1, 1, 1] },
  { id: 'montage', name: 'Montagem (Rápido-Lento-Rápido)', points: [2.5, 0.4, 0.3, 1.8, 2.5] },
  { id: 'hero', name: 'Heroic Slow-Mo', points: [1.8, 0.2, 0.2, 1.5, 2.0] },
  { id: 'bullet-time', name: 'Bullet Time Matrix', points: [1.2, 0.1, 0.1, 0.2, 1.5] },
  { id: 'flash-in', name: 'Flash In & Out', points: [3.5, 1.0, 0.5, 1.0, 3.5] },
  { id: 'jump-cut', name: 'Jump Pace', points: [0.5, 3.0, 0.4, 3.0, 0.5] }
];

// Masking Types (Máscaras de Recorte Pro)
export const maskTypes = [
  { id: 'none', name: 'Sem Máscara' },
  { id: 'linear', name: 'Dividir Linear (Split)' },
  { id: 'filmstrip', name: 'Cinema Bars (Letterbox)' },
  { id: 'circle', name: 'Círculo / Spotlight' },
  { id: 'rectangle', name: 'Retângulo Arredondado' },
  { id: 'heart', name: 'Coração Romântico' }
];

// Transitions Pro
export const transitionPresets = [
  { id: 'dissolve', name: 'Dissolvência Suave', icon: 'fade' },
  { id: 'zoom-in', name: 'Zoom In Rápido', icon: 'zoom' },
  { id: 'zoom-out', name: 'Zoom Out', icon: 'zoom' },
  { id: 'whip-left', name: 'Whip Pan Esquerda', icon: 'slide' },
  { id: 'whip-right', name: 'Whip Pan Direita', icon: 'slide' },
  { id: 'glitch-cut', name: 'Corte Glitch Pro', icon: 'glitch' },
  { id: 'flash-white', name: 'Flash Branco', icon: 'flash' }
];

// Animated Stickers & Overlays
export const stickerPresets = [
  { id: 'sub-bell', name: 'Inscreva-se + Sino', type: 'badge', color: '#ff0000', text: '🔔 INSCREVA-SE' },
  { id: 'like-btn', name: 'Botão de Like', type: 'badge', color: '#00f2fe', text: '👍 CURTIR' },
  { id: 'viral-fire', name: 'Fogo Viral', type: 'emoji', icon: '🔥', text: 'EM ALTA' },
  { id: 'arrow-down', name: 'Seta Indicadora', type: 'arrow', color: '#ffe600', text: '⬇️ VEJA AQUI' },
  { id: 'star-vip', name: 'Selo VIP Pro', type: 'badge', color: '#f59e0b', text: '⭐ TOP 1' },
  { id: 'warning-alert', name: 'Alerta Importante', type: 'badge', color: '#ef4444', text: '⚠️ ATENÇÃO' }
];

// Text & Subtitles Presets
export const textPresets = [
  {
    id: 'tiktok-viral',
    name: 'TikTok Viral Captions',
    style: {
      content: 'SEU TEXTO AQUI',
      font: 'Inter',
      size: 46,
      color: '#ffe600',
      strokeColor: '#000000',
      strokeWidth: 7,
      bgColor: 'transparent',
      align: 'center'
    }
  },
  {
    id: 'cinematic-title',
    name: 'Título Cinema 4K',
    style: {
      content: 'MVCUT PRO',
      font: 'Outfit',
      size: 58,
      color: '#ffffff',
      strokeColor: 'transparent',
      strokeWidth: 0,
      bgColor: 'rgba(0, 0, 0, 0.65)',
      align: 'center'
    }
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyberpunk 80s',
    style: {
      content: 'NEON LIGHTS',
      font: 'Outfit',
      size: 50,
      color: '#00f2fe',
      strokeColor: '#ff007f',
      strokeWidth: 4,
      bgColor: 'transparent',
      align: 'center'
    }
  },
  {
    id: 'podcast-captions',
    name: 'Podcast Auto-Legenda',
    style: {
      content: 'Palavra por palavra falada',
      font: 'Inter',
      size: 38,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      bgColor: '#2563eb',
      align: 'center'
    }
  },
  {
    id: 'subtitles-clean',
    name: 'Legenda Minimalista',
    style: {
      content: 'Legendas limpas com fundo translúcido',
      font: 'Inter',
      size: 32,
      color: '#f8fafc',
      strokeColor: 'transparent',
      strokeWidth: 0,
      bgColor: 'rgba(0, 0, 0, 0.7)',
      align: 'center'
    }
  }
];

// Real-time canvas procedural stock video generator
export function createStockVideoSource(title, type = 'cyber') {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  let startTime = Date.now();

  function draw() {
    const time = (Date.now() - startTime) / 1000;
    const w = canvas.width;
    const h = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    if (type === 'cyber') {
      grad.addColorStop(0, `hsl(${(time * 40) % 360}, 85%, 18%)`);
      grad.addColorStop(0.5, `hsl(${(time * 40 + 60) % 360}, 95%, 12%)`);
      grad.addColorStop(1, `hsl(${(time * 40 + 120) % 360}, 90%, 8%)`);
    } else if (type === 'sunset') {
      grad.addColorStop(0, '#ff416c');
      grad.addColorStop(0.5, '#ff4b2b');
      grad.addColorStop(1, '#1b091f');
    } else {
      grad.addColorStop(0, '#00c6ff');
      grad.addColorStop(0.5, '#0072ff');
      grad.addColorStop(1, '#081735');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Orbs
    for (let i = 0; i < 5; i++) {
      const x = (w * 0.5) + Math.cos(time + i * 1.5) * (w * 0.32);
      const y = (h * 0.5) + Math.sin(time * 1.2 + i * 2.0) * (h * 0.28);
      const r = 90 + Math.sin(time * 2 + i) * 35;
      
      const radial = ctx.createRadialGradient(x, y, 10, x, y, r);
      radial.addColorStop(0, 'rgba(0, 242, 254, 0.45)');
      radial.addColorStop(1, 'rgba(0, 242, 254, 0)');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Centered label
    ctx.font = '800 48px Outfit, Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, w / 2, h / 2);

    ctx.font = '600 20px JetBrains Mono, monospace';
    ctx.fillStyle = '#00f2fe';
    ctx.fillText(`MVCUT PRO • AO VIVO [${time.toFixed(1)}s]`, w / 2, h / 2 + 55);

    requestAnimationFrame(draw);
  }

  draw();
  return canvas;
}

// Complete Pro Audio Synthesizer (Sound FX, Voice Effects, Beat Generator)
export function createAudioSynth() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let ctx = null;

  function init() {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  return {
    playWhoosh() {
      const ac = init();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ac.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3200, ac.currentTime + 0.15);
      filter.frequency.exponentialRampToValueAtTime(100, ac.currentTime + 0.35);

      gain.gain.setValueAtTime(0.01, ac.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, ac.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, ac.currentTime + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + 0.4);
    },

    playBoom() {
      const ac = init();
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, ac.currentTime + 0.9);

      gain.gain.setValueAtTime(0.6, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + 0.9);
    },

    playClick() {
      const ac = init();
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ac.currentTime);

      gain.gain.setValueAtTime(0.12, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + 0.05);
    },

    playGlitchSound() {
      const ac = init();
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ac.currentTime);
      osc.frequency.setValueAtTime(1200, ac.currentTime + 0.05);
      osc.frequency.setValueAtTime(400, ac.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + 0.2);
    },

    playLofiBeat() {
      const ac = init();
      // Synth simple 2-bar lofi kick & snare loop
      const now = ac.currentTime;
      for (let i = 0; i < 4; i++) {
        const kickOsc = ac.createOscillator();
        const kickGain = ac.createGain();
        kickOsc.frequency.setValueAtTime(120, now + i * 0.6);
        kickOsc.frequency.exponentialRampToValueAtTime(40, now + i * 0.6 + 0.2);
        kickGain.gain.setValueAtTime(0.4, now + i * 0.6);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.6 + 0.25);
        kickOsc.connect(kickGain);
        kickGain.connect(ac.destination);
        kickOsc.start(now + i * 0.6);
        kickOsc.stop(now + i * 0.6 + 0.25);
      }
    }
  };
}
