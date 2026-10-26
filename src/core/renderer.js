// Real-time Canvas Rendering Engine with All CapCut Pro Features for KrakenCut Pro
import { store } from './state.js';
import { aspectRatios } from './presets.js';
import { sourceTimeAt, speedAt } from './timeMap.js';
import { updateMediaAudio, silenceMedia, resumeAudio } from './audioEngine.js';

export class VideoRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d', { alpha: false });
    this.isPlaying = false;
    this.lastFrameTime = 0;
    this.animationFrameId = null;

    this.init();
  }

  init() {
    this.updateCanvasResolution();

    store.subscribe('render:needed', () => this.renderFrame());
    store.subscribe('aspectRatio:changed', () => {
      this.updateCanvasResolution();
      this.renderFrame();
    });
    store.subscribe('time:changed', () => {
      this.syncMediaElements();
      this.renderFrame();
    });
    store.subscribe('playback:changed', (playing) => {
      if (playing) this.startPlayback();
      else this.stopPlayback();
    });

    this.renderFrame();
  }

  updateCanvasResolution() {
    const ratioId = store.getState().aspectRatio;
    const config = aspectRatios.find(r => r.id === ratioId) || aspectRatios[0];
    this.canvas.width = config.width;
    this.canvas.height = config.height;
  }

  startPlayback() {
    this.isPlaying = true;
    resumeAudio();
    this.lastFrameTime = performance.now();
    this.playbackLoop();
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    const state = store.getState();
    for (const clip of state.clips) {
      if ((clip.type === 'video' || clip.type === 'audio') && clip.sourceElement) {
        if (!clip.sourceElement.paused) clip.sourceElement.pause();
        silenceMedia(clip.sourceElement);
      }
    }
  }

  playbackLoop() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    const state = store.getState();
    const newTime = state.currentTime + dt;

    if (newTime >= state.duration) {
      if (state.loop) {
        store.setCurrentTime(0);
      } else {
        store.setCurrentTime(state.duration);
        store.pause();
        return;
      }
    } else {
      store.setCurrentTime(newTime);
    }

    this.animationFrameId = requestAnimationFrame(() => this.playbackLoop());
  }

  syncMediaElements() {
    const state = store.getState();
    const t = state.currentTime;

    for (const clip of state.clips) {
      const track = state.tracks.find(tr => tr.id === clip.trackId);
      const isMuted = (track?.muted || track?.hidden) || false;

      if ((clip.type === 'video' || clip.type === 'audio') && clip.sourceElement) {
        const media = clip.sourceElement;
        const clipStart = clip.startTime;
        const clipEnd = clip.startTime + clip.duration;
        const vol = clip.properties?.volume ?? 1;

        if (t >= clipStart && t <= clipEnd) {
          const mediaTime = sourceTimeAt(clip, t);
          const currentSpeed = speedAt(clip, t - clipStart);

          if (Math.abs(media.currentTime - mediaTime) > 0.15) {
            media.currentTime = mediaTime;
          }
          if (media.playbackRate !== currentSpeed) {
            try { media.playbackRate = Math.max(0.0625, Math.min(16, currentSpeed)); } catch (e) {}
          }

          updateMediaAudio(media, {
            volume: vol,
            muted: isMuted,
            effect: clip.properties?.voiceEffect || 'none',
            enhance: clip.properties?.enhanceAudio ?? false
          });

          if (this.isPlaying && media.paused) {
            media.play().catch(() => {});
          }
        } else {
          silenceMedia(media);
          if (!media.paused) media.pause();
        }
      }
    }
  }

  renderFrame() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const state = store.getState();
    const t = state.currentTime;

    // Solid or dynamic canvas background (CapCut & OpenCut Canvas Backgrounds)
    const bg = state.canvasBackground || { type: 'color', value: '#050608' };
    if (bg.type === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#151827');
      grad.addColorStop(0.5, '#0a0d18');
      grad.addColorStop(1, '#050608');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else if (bg.type === 'blur') {
      const activeClipsNow = state.clips.filter(c => t >= c.startTime && t <= c.startTime + c.duration);
      const mainVideo = activeClipsNow.find(c => c.type === 'video');
      if (mainVideo && mainVideo.sourceElement) {
        ctx.save();
        ctx.filter = 'blur(35px) brightness(60%)';
        ctx.drawImage(mainVideo.sourceElement, -w * 0.1, -h * 0.1, w * 1.2, h * 1.2);
        ctx.restore();
      } else {
        ctx.fillStyle = '#050608';
        ctx.fillRect(0, 0, w, h);
      }
    } else {
      ctx.fillStyle = bg.value || '#050608';
      ctx.fillRect(0, 0, w, h);
    }

    const trackOrder = { 't-video': 1, 't-overlay': 2, 't-text': 3, 't-audio': 0 };
    const activeClips = state.clips
      .filter(c => t >= c.startTime && t <= c.startTime + c.duration)
      .sort((a, b) => (trackOrder[a.trackId] || 0) - (trackOrder[b.trackId] || 0));

    for (const clip of activeClips) {
      const track = state.tracks.find(tr => tr.id === clip.trackId);
      if (track && track.hidden) continue;

      ctx.save();

      const props = clip.properties || {};
      const scale = props.scale ?? 1;
      const posX = (props.x || 0) + (w / 2);
      const posY = (props.y || 0) + (h / 2);
      const rot = ((props.rotation || 0) * Math.PI) / 180;
      const opacity = props.opacity ?? 1;

      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
      ctx.globalCompositeOperation = props.blendMode || 'source-over';

      // Build CSS Filter string
      const f = props.filters || {};
      const filterParts = [];
      if (f.brightness !== undefined && f.brightness !== 100) filterParts.push(`brightness(${f.brightness}%)`);
      if (f.contrast !== undefined && f.contrast !== 100) filterParts.push(`contrast(${f.contrast}%)`);
      if (f.saturation !== undefined && f.saturation !== 100) filterParts.push(`saturate(${f.saturation}%)`);
      if (f.hue) filterParts.push(`hue-rotate(${f.hue}deg)`);
      if (f.blur) filterParts.push(`blur(${f.blur}px)`);

      ctx.filter = filterParts.length ? filterParts.join(' ') : 'none';

      // Clip mask clipping path
      if (props.mask && props.mask !== 'none') {
        this.applyMaskPath(ctx, props.mask, w, h);
      }

      // Transform coordinate system
      ctx.translate(posX, posY);
      ctx.rotate(rot);
      ctx.scale(scale, scale);

      // Render clip content
      if (clip.type === 'video' || clip.type === 'image') {
        this.renderVisualClip(ctx, clip, w, h);
      } else if (clip.type === 'text') {
        this.renderTextClip(ctx, clip);
      } else if (clip.type === 'sticker') {
        this.renderStickerClip(ctx, clip);
      }

      ctx.restore();

      // Pro Visual Effects Overlay
      if (props.effect && props.effect !== 'none') {
        this.renderProEffect(ctx, props.effect, w, h, t);
      }

      // Vignette effect
      if (f.vignette > 0) {
        this.renderVignette(ctx, w, h, f.vignette);
      }
    }
  }

  renderVisualClip(ctx, clip, w, h) {
    const elem = clip.sourceElement;
    if (!elem) {
      ctx.fillStyle = '#14161f';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      return;
    }

    const sw = elem.videoWidth || elem.width || w;
    const sh = elem.videoHeight || elem.height || h;
    const scale = Math.max(w / sw, h / sh);
    const dw = sw * scale;
    const dh = sh * scale;

    try {
      ctx.drawImage(elem, -dw / 2, -dh / 2, dw, dh);
    } catch (e) {}
  }

  applyMaskPath(ctx, maskType, w, h) {
    ctx.beginPath();
    if (maskType === 'circle') {
      const radius = Math.min(w, h) * 0.35;
      ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
    } else if (maskType === 'filmstrip') {
      const barH = h * 0.12;
      ctx.rect(0, barH, w, h - barH * 2);
    } else if (maskType === 'linear') {
      ctx.rect(0, 0, w / 2, h);
    } else if (maskType === 'rectangle') {
      ctx.roundRect(w * 0.15, h * 0.15, w * 0.7, h * 0.7, 40);
    } else if (maskType === 'heart') {
      // Stylized heart mask
      const cx = w / 2;
      const cy = h / 2 - 20;
      const d = Math.min(w, h) * 0.35;
      ctx.moveTo(cx, cy);
      ctx.bezierCurveTo(cx - d / 2, cy - d / 2, cx - d, cy + d / 3, cx, cy + d);
      ctx.bezierCurveTo(cx + d, cy + d / 3, cx + d / 2, cy - d / 2, cx, cy);
    }
    ctx.clip();
  }

  renderTextClip(ctx, clip) {
    const textConfig = clip.properties?.text || {};
    const content = textConfig.content || 'Texto';
    const font = textConfig.font || 'Inter';
    const size = textConfig.size || 40;
    const color = textConfig.color || '#ffffff';
    const strokeColor = textConfig.strokeColor || '#000000';
    const strokeWidth = textConfig.strokeWidth || 0;
    const bgColor = textConfig.bgColor || 'transparent';

    ctx.font = `bold ${size}px "${font}", Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const metrics = ctx.measureText(content);
    const textWidth = metrics.width;
    const textHeight = size * 1.2;

    if (bgColor && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      const padX = 20;
      const padY = 10;
      ctx.beginPath();
      ctx.roundRect(-textWidth / 2 - padX, -textHeight / 2 - padY, textWidth + padX * 2, textHeight + padY * 2, 8);
      ctx.fill();
    }

    if (strokeWidth > 0 && strokeColor !== 'transparent') {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      ctx.lineJoin = 'round';
      ctx.strokeText(content, 0, 0);
    }

    ctx.fillStyle = color;
    ctx.fillText(content, 0, 0);
  }

  renderStickerClip(ctx, clip) {
    const s = clip.properties?.sticker || {};
    ctx.fillStyle = s.color || '#00f2fe';
    const pad = 24;
    ctx.beginPath();
    ctx.roundRect(-160, -35, 320, 70, 35);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.text || 'STICKER', 0, 0);
  }

  renderProEffect(ctx, effect, w, h, time) {
    ctx.save();

    if (effect === 'glitch-rgb') {
      const shift = Math.sin(time * 35) > 0.35 ? (Math.random() * 18 - 9) : 0;
      if (Math.abs(shift) > 1) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 0, 85, 0.25)';
        ctx.fillRect(shift, 0, w, h);
        ctx.fillStyle = 'rgba(0, 242, 254, 0.25)';
        ctx.fillRect(-shift, 0, w, h);
      }
    } else if (effect === 'crt-scanlines') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 2);
      }
      const scanbeamY = ((time * 200) % h);
      const beamGrad = ctx.createLinearGradient(0, scanbeamY - 40, 0, scanbeamY + 40);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, scanbeamY - 40, w, 80);
    } else if (effect === 'anamorphic-flare') {
      const cy = h / 2 + Math.sin(time * 2) * 40;
      const flareGrad = ctx.createLinearGradient(0, cy - 6, w, cy + 6);
      flareGrad.addColorStop(0, 'rgba(0, 150, 255, 0)');
      flareGrad.addColorStop(0.5, 'rgba(0, 242, 254, 0.7)');
      flareGrad.addColorStop(1, 'rgba(0, 150, 255, 0)');
      ctx.fillStyle = flareGrad;
      ctx.fillRect(0, cy - 4, w, 8);
    } else if (effect === 'light-leak') {
      const leakGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, w * 0.6);
      leakGrad.addColorStop(0, 'rgba(255, 120, 40, 0.55)');
      leakGrad.addColorStop(0.6, 'rgba(255, 60, 120, 0.25)');
      leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = leakGrad;
      ctx.fillRect(0, 0, w, h);
    } else if (effect === 'neon-aura') {
      ctx.strokeStyle = `hsl(${(time * 60) % 360}, 100%, 55%)`;
      ctx.lineWidth = 12;
      ctx.shadowColor = `hsl(${(time * 60) % 360}, 100%, 55%)`;
      ctx.shadowBlur = 30;
      ctx.strokeRect(20, 20, w - 40, h - 40);
    } else if (effect === 'flash-strobe') {
      if (Math.sin(time * 20) > 0.85) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(0, 0, w, h);
      }
    } else if (effect === 'film-dust') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let i = 0; i < 15; i++) {
        const px = Math.random() * w;
        const py = Math.random() * h;
        const pr = Math.random() * 2 + 1;
        ctx.fillRect(px, py, pr, pr);
      }
    } else if (effect === 'camera-shake') {
      const sx = (Math.random() - 0.5) * 8;
      const sy = (Math.random() - 0.5) * 8;
      ctx.drawImage(this.canvas, sx, sy);
    } else if (effect === 'zoom-pulse') {
      const pulse = 1 + Math.sin(time * 8) * 0.04;
      ctx.translate(w / 2, h / 2);
      ctx.scale(pulse, pulse);
      ctx.translate(-w / 2, -h / 2);
    } else if (effect === 'prism-kaleido') {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(this.canvas, 10, 10);
      ctx.drawImage(this.canvas, -10, -10);
    }

    ctx.restore();
  }

  renderVignette(ctx, w, h, amount) {
    ctx.save();
    const radius = Math.max(w, h) * 0.7;
    const radial = ctx.createRadialGradient(w / 2, h / 2, radius * 0.35, w / 2, h / 2, radius);
    radial.addColorStop(0, 'rgba(0, 0, 0, 0)');
    radial.addColorStop(1, `rgba(0, 0, 0, ${Math.min(1, amount / 50)})`);
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
