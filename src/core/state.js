// Central Reactive State Store for KrakenCut Pro Video Editor
import { aspectRatios, createStockVideoSource } from './presets.js';

class StateStore {
  constructor() {
    this.listeners = new Map();
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 30;

    this.state = {
      projectTitle: 'Projeto MVcut Pro 01',
      aspectRatio: '16:9',
      duration: 15.0, // seconds
      currentTime: 0.0, // seconds
      isPlaying: false,
      zoom: 60, // pixels per second on timeline
      isSnapping: true,
      selectedClipId: null,
      loop: false,
      tracks: [
        { id: 't-overlay', name: 'Sobreposição B-Roll', type: 'video', muted: false, locked: false, hidden: false },
        { id: 't-text', name: 'Textos & Legendas', type: 'text', muted: false, locked: false, hidden: false },
        { id: 't-video', name: 'Faixa Principal', type: 'video', muted: false, locked: false, hidden: false },
        { id: 't-audio', name: 'Trilha Sonora', type: 'audio', muted: false, locked: false, hidden: false }
      ],
      clips: []
    };

    // Initialize with a cool starter project so user sees immediate results!
    this.initDefaultClips();
    this.saveSnapshot();
  }

  initDefaultClips() {
    const demoCanvas1 = createStockVideoSource('CYBERPUNK NEON', 'cyber');
    const demoCanvas2 = createStockVideoSource('SUNSET CITY', 'sunset');

    this.state.clips = [
      {
        id: 'clip-demo-1',
        trackId: 't-video',
        name: 'Cyberpunk Neon.mp4',
        type: 'video',
        startTime: 0,
        duration: 7.0,
        sourceDuration: 7.0,
        sourceOffset: 0,
        sourceElement: demoCanvas1,
        properties: {
          scale: 1,
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          speed: 1,
          volume: 1,
          blendMode: 'source-over',
          filters: { brightness: 100, contrast: 110, saturation: 130, hue: 0, warmth: 0, vignette: 20, blur: 0 },
          effect: 'none'
        }
      },
      {
        id: 'clip-demo-2',
        trackId: 't-video',
        name: 'Sunset City.mp4',
        type: 'video',
        startTime: 7.0,
        duration: 8.0,
        sourceDuration: 8.0,
        sourceOffset: 0,
        sourceElement: demoCanvas2,
        properties: {
          scale: 1,
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          speed: 1,
          volume: 1,
          blendMode: 'source-over',
          filters: { brightness: 105, contrast: 120, saturation: 120, hue: 15, warmth: 25, vignette: 15, blur: 0 },
          effect: 'none'
        }
      },
      {
        id: 'clip-demo-text',
        trackId: 't-text',
        name: 'MVCUT PRO',
        type: 'text',
        startTime: 1.0,
        duration: 5.0,
        sourceDuration: 5.0,
        sourceOffset: 0,
        properties: {
          scale: 1,
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          speed: 1,
          volume: 1,
          blendMode: 'source-over',
          filters: { brightness: 100, contrast: 100, saturation: 100, hue: 0, warmth: 0, vignette: 0, blur: 0 },
          text: {
            content: 'MVCUT PRO',
            font: 'Outfit',
            size: 64,
            color: '#00f2fe',
            strokeColor: '#000000',
            strokeWidth: 6,
            bgColor: 'transparent',
            align: 'center'
          },
          effect: 'none'
        }
      }
    ];

    this.recalculateDuration();
  }

  // Pub/Sub Event System
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error('Event listener error', e); }
      });
    }
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(cb => {
        try { cb(event, data); } catch (e) { console.error('Wildcard listener error', e); }
      });
    }
  }

  getState() {
    return this.state;
  }

  // History / Undo / Redo
  saveSnapshot() {
    // Purge future snapshots if any
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    const snapshot = JSON.stringify({
      duration: this.state.duration,
      aspectRatio: this.state.aspectRatio,
      tracks: this.state.tracks,
      clips: this.state.clips.map(c => ({
        ...c,
        sourceElement: null // don't serialize DOM elements
      }))
    });
    this.history.push(snapshot);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreSnapshot(this.history[this.historyIndex]);
      this.emit('history:changed', { canUndo: this.canUndo(), canRedo: this.canRedo() });
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreSnapshot(this.history[this.historyIndex]);
      this.emit('history:changed', { canUndo: this.canUndo(), canRedo: this.canRedo() });
    }
  }

  canUndo() { return this.historyIndex > 0; }
  canRedo() { return this.historyIndex < this.history.length - 1; }

  restoreSnapshot(jsonStr) {
    const data = JSON.parse(jsonStr);
    // Restore element references
    const prevClips = new Map(this.state.clips.map(c => [c.id, c.sourceElement]));
    this.state.duration = data.duration;
    this.state.aspectRatio = data.aspectRatio;
    this.state.tracks = data.tracks;
    this.state.clips = data.clips.map(c => ({
      ...c,
      sourceElement: prevClips.get(c.id) || null
    }));
    this.emit('timeline:updated');
    this.emit('render:needed');
  }

  recalculateDuration() {
    let maxEnd = 10.0;
    for (const clip of this.state.clips) {
      const end = clip.startTime + clip.duration;
      if (end > maxEnd) maxEnd = end;
    }
    this.state.duration = Math.ceil(maxEnd + 2); // 2s padding
    this.emit('timeline:updated');
  }

  // Playhead & Transport
  setCurrentTime(time) {
    const clamped = Math.max(0, Math.min(this.state.duration, time));
    this.state.currentTime = clamped;
    this.emit('time:changed', clamped);
  }

  play() {
    if (!this.state.isPlaying) {
      this.state.isPlaying = true;
      this.emit('playback:changed', true);
    }
  }

  pause() {
    if (this.state.isPlaying) {
      this.state.isPlaying = false;
      this.emit('playback:changed', false);
    }
  }

  togglePlay() {
    if (this.state.isPlaying) this.pause();
    else this.play();
  }

  setAspectRatio(ratio) {
    this.state.aspectRatio = ratio;
    this.emit('aspectRatio:changed', ratio);
    this.emit('render:needed');
    this.saveSnapshot();
  }

  setZoom(zoomVal) {
    this.state.zoom = Math.max(15, Math.min(250, zoomVal));
    this.emit('zoom:changed', this.state.zoom);
  }

  selectClip(clipId) {
    this.state.selectedClipId = clipId;
    this.emit('selection:changed', clipId);
  }

  getSelectedClip() {
    return this.state.clips.find(c => c.id === this.state.selectedClipId) || null;
  }

  // Clip Operations (Split, Trim, Delete, Duplicate)
  addClip(clipData) {
    const newClip = {
      id: 'clip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      startTime: clipData.startTime ?? this.state.currentTime,
      duration: clipData.duration || 5.0,
      sourceDuration: clipData.sourceDuration || clipData.duration || 5.0,
      sourceOffset: 0,
      properties: {
        scale: 1,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        speed: 1,
        volume: 1,
        blendMode: 'source-over',
        filters: { brightness: 100, contrast: 100, saturation: 100, hue: 0, warmth: 0, vignette: 0, blur: 0 },
        effect: 'none',
        ...clipData.properties
      },
      ...clipData
    };

    this.state.clips.push(newClip);
    this.selectClip(newClip.id);
    this.recalculateDuration();
    this.saveSnapshot();
    this.emit('timeline:updated');
    this.emit('render:needed');
    return newClip;
  }

  updateClip(clipId, updates) {
    const clip = this.state.clips.find(c => c.id === clipId);
    if (!clip) return;

    if (updates.properties) {
      clip.properties = { ...clip.properties, ...updates.properties };
      if (updates.properties.filters) {
        clip.properties.filters = { ...clip.properties.filters, ...updates.properties.filters };
      }
      if (updates.properties.text) {
        clip.properties.text = { ...clip.properties.text, ...updates.properties.text };
      }
      delete updates.properties;
    }

    Object.assign(clip, updates);
    this.emit('clip:updated', clip);
    this.emit('render:needed');
  }

  // Dividir (Split / Cut) at playhead
  splitClipAtPlayhead() {
    const time = this.state.currentTime;
    let targetClip = this.getSelectedClip();

    if (!targetClip) {
      // Find clip under playhead
      targetClip = this.state.clips.find(c => time > c.startTime && time < c.startTime + c.duration);
    }

    if (!targetClip) return false;

    // Check if time is within clip boundaries
    if (time <= targetClip.startTime + 0.1 || time >= targetClip.startTime + targetClip.duration - 0.1) {
      return false;
    }

    const track = this.state.tracks.find(t => t.id === targetClip.trackId);
    if (track && track.locked) return false;

    const firstDuration = time - targetClip.startTime;
    const secondDuration = targetClip.duration - firstDuration;

    // Create cloned second half
    const secondClip = {
      ...JSON.parse(JSON.stringify(targetClip)),
      id: 'clip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      startTime: time,
      duration: secondDuration,
      sourceOffset: targetClip.sourceOffset + (firstDuration * (targetClip.properties.speed || 1)),
      sourceElement: targetClip.sourceElement
    };

    // Trim first half
    targetClip.duration = firstDuration;

    this.state.clips.push(secondClip);
    this.selectClip(secondClip.id);
    this.recalculateDuration();
    this.saveSnapshot();
    this.emit('timeline:updated');
    this.emit('render:needed');
    return true;
  }

  deleteClip(clipId) {
    const id = clipId || this.state.selectedClipId;
    if (!id) return;

    const clip = this.state.clips.find(c => c.id === id);
    if (clip) {
      const track = this.state.tracks.find(t => t.id === clip.trackId);
      if (track && track.locked) return;
    }

    this.state.clips = this.state.clips.filter(c => c.id !== id);
    if (this.state.selectedClipId === id) {
      this.state.selectedClipId = null;
      this.emit('selection:changed', null);
    }

    this.recalculateDuration();
    this.saveSnapshot();
    this.emit('timeline:updated');
    this.emit('render:needed');
  }

  duplicateClip(clipId) {
    const id = clipId || this.state.selectedClipId;
    const clip = this.state.clips.find(c => c.id === id);
    if (!clip) return;

    const track = this.state.tracks.find(t => t.id === clip.trackId);
    if (track && track.locked) return;

    const dup = {
      ...JSON.parse(JSON.stringify(clip)),
      id: 'clip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      startTime: clip.startTime + clip.duration + 0.2,
      sourceElement: clip.sourceElement
    };

    this.state.clips.push(dup);
    this.selectClip(dup.id);
    this.recalculateDuration();
    this.saveSnapshot();
    this.emit('timeline:updated');
    this.emit('render:needed');
  }

  toggleTrackHidden(trackId) {
    const track = this.state.tracks.find(t => t.id === trackId);
    if (!track) return;
    track.hidden = !track.hidden;
    this.emit('tracks:updated', this.state.tracks);
    this.emit('timeline:updated');
    this.emit('render:needed');
  }

  toggleTrackLocked(trackId) {
    const track = this.state.tracks.find(t => t.id === trackId);
    if (!track) return;
    track.locked = !track.locked;
    this.emit('tracks:updated', this.state.tracks);
    this.emit('timeline:updated');
  }

  toggleTrackMuted(trackId) {
    const track = this.state.tracks.find(t => t.id === trackId);
    if (!track) return;
    track.muted = !track.muted;
    this.emit('tracks:updated', this.state.tracks);
    this.emit('timeline:updated');
    this.emit('render:needed');
  }
}

export const store = new StateStore();
