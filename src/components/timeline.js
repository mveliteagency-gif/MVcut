// Multi-track Timeline Component for MVcut Pro
import { icons } from './icons.js';
import { store } from '../core/state.js';
import { openGlobalMediaPicker } from '../core/uploader.js';

export function initTimeline(timelineElement) {
  let isDraggingPlayhead = false;
  let isDraggingClip = false;
  let isTrimming = null; // { clipId, side: 'left' | 'right', startX, originalStart, originalDuration }
  let activeDragClip = null;

  // Helper coordinate extractor
  const getClientX = (e) => {
    if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
    if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientX;
    return e.clientX;
  };

  function handleRulerScrub(e) {
    const tracksContent = timelineElement.querySelector('#tracks-content');
    if (!tracksContent) return;
    const rect = tracksContent.getBoundingClientRect();
    const clickX = getClientX(e) - rect.left;
    const zoom = store.getState().zoom;
    const time = Math.max(0, clickX / zoom);
    store.setCurrentTime(time);
  }

  function handleTrimMove(e) {
    if (!isTrimming) return;
    const { clipId, side, startX, originalStart, originalDuration } = isTrimming;
    const currentX = getClientX(e);
    const zoom = store.getState().zoom;
    const deltaSeconds = (currentX - startX) / zoom;
    const clip = store.getState().clips.find(c => c.id === clipId);
    if (!clip) return;

    if (side === 'left') {
      const newStart = Math.max(0, originalStart + deltaSeconds);
      const newDuration = Math.max(0.5, originalDuration - (newStart - originalStart));
      clip.startTime = newStart;
      clip.duration = newDuration;
    } else {
      const newDuration = Math.max(0.5, originalDuration + deltaSeconds);
      clip.duration = newDuration;
    }

    store.recalculateDuration();
    render();
  }

  function handleClipDragMove(e) {
    if (!activeDragClip) return;
    const { clipId, startX, originalStart } = activeDragClip;
    const currentX = getClientX(e);
    const zoom = store.getState().zoom;
    const deltaSeconds = (currentX - startX) / zoom;
    const clip = store.getState().clips.find(c => c.id === clipId);
    if (!clip) return;

    let targetStart = Math.max(0, originalStart + deltaSeconds);

    // Snapping to playhead or 0
    if (store.getState().isSnapping) {
      const snapThreshold = 0.2; // sec
      const playheadTime = store.getState().currentTime;
      if (Math.abs(targetStart - playheadTime) < snapThreshold) {
        targetStart = playheadTime;
      } else if (targetStart < snapThreshold) {
        targetStart = 0;
      }
    }

    clip.startTime = targetStart;
    store.recalculateDuration();

    // Fast DOM position update
    const clipEl = timelineElement.querySelector(`[data-clip-id="${clipId}"]`);
    if (clipEl) {
      clipEl.style.left = `${targetStart * zoom}px`;
    }
  }

  // Global Mouse & Touch Handlers (Attached ONCE)
  const handleGlobalMove = (e) => {
    if (isDraggingPlayhead) {
      if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();
      handleRulerScrub(e);
    } else if (isTrimming) {
      if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();
      handleTrimMove(e);
    } else if (isDraggingClip && activeDragClip) {
      if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();
      handleClipDragMove(e);
    }
  };

  const handleGlobalEnd = () => {
    if (isDraggingPlayhead) isDraggingPlayhead = false;
    if (isTrimming) {
      isTrimming = null;
      store.saveSnapshot();
      render();
    }
    if (isDraggingClip) {
      isDraggingClip = false;
      activeDragClip = null;
      store.saveSnapshot();
      render();
    }
  };

  window.addEventListener('mousemove', handleGlobalMove);
  window.addEventListener('touchmove', handleGlobalMove, { passive: false });
  window.addEventListener('mouseup', handleGlobalEnd);
  window.addEventListener('touchend', handleGlobalEnd, { passive: true });
  window.addEventListener('touchcancel', handleGlobalEnd, { passive: true });

  function renderClipElement(clip, zoom, isSelected, isLocked) {
    const left = clip.startTime * zoom;
    const width = Math.max(clip.duration * zoom, 18);
    let typeClass = 'clip-video';
    if (clip.trackId === 't-audio') typeClass = 'clip-audio';
    else if (clip.trackId === 't-text') typeClass = 'clip-text';

    return `
      <div class="timeline-clip ${typeClass} ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}"
           id="${clip.id}"
           data-clip-id="${clip.id}"
           style="left: ${left}px; width: ${width}px; ${isLocked ? 'opacity: 0.6; cursor: not-allowed;' : ''}">
        ${!isLocked ? '<div class="trim-handle trim-handle-left" data-trim="left" title="Ajustar Início"></div>' : ''}
        <div class="clip-info">
          <span>${clip.name || clip.properties?.text?.content || 'Clipe'}</span>
        </div>
        ${!isLocked ? '<div class="trim-handle trim-handle-right" data-trim="right" title="Ajustar Fim"></div>' : ''}
      </div>
    `;
  }

  function renderRulerTicks(totalWidth, zoom) {
    const ticksContainer = timelineElement.querySelector('#ruler-ticks');
    if (!ticksContainer) return;

    let step = 1;
    if (zoom < 35) step = 2;
    if (zoom < 20) step = 5;

    const maxSeconds = Math.ceil(totalWidth / zoom);
    let html = '';

    for (let s = 0; s <= maxSeconds; s += step) {
      const x = s * zoom;
      const isMajor = s % (step * 2) === 0;
      const mins = Math.floor(s / 60);
      const secs = s % 60;
      const label = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      html += `
        <div class="ruler-tick ${isMajor ? 'major' : 'minor'}" style="left: ${x}px;"></div>
        ${isMajor ? `<div class="ruler-time-label" style="left: ${x}px;">${label}</div>` : ''}
      `;
    }
    ticksContainer.innerHTML = html;
  }

  function render() {
    const state = store.getState();
    const zoom = state.zoom;
    const totalWidth = Math.max(state.duration * zoom + 300, 1200);

    timelineElement.innerHTML = `
      <!-- Toolbar -->
      <div class="timeline-toolbar">
        <div class="timeline-tools-left">
          <button class="btn btn-ghost" id="btn-timeline-upload" title="Fazer Upload de Vídeos e Fotos para a Timeline" style="color: var(--accent-cyan); font-weight: 700; gap: 6px; padding: 4px 10px; font-size: 11px; border: 1px solid rgba(0, 242, 254, 0.3); border-radius: var(--radius-sm);">
            ${icons.upload}
            <span>+ Mídia</span>
          </button>

          <div class="tool-divider"></div>

          <button class="btn btn-icon btn-ghost" id="btn-timeline-split" title="Dividir / Cortar no Playhead (S)">
            ${icons.scissors}
          </button>
          <button class="btn btn-icon btn-ghost" id="btn-timeline-delete" title="Excluir Clipe Selecionado (Del)">
            ${icons.trash}
          </button>
          <button class="btn btn-icon btn-ghost" id="btn-timeline-duplicate" title="Duplicar Clipe (Ctrl+D)">
            ${icons.copy}
          </button>

          <div class="tool-divider"></div>

          <button class="btn btn-icon btn-ghost ${state.isSnapping ? 'btn-primary' : ''}" id="btn-timeline-snap" title="Ajuste Magnético (Snap)">
            ${icons.magnet}
          </button>
        </div>

        <div class="timeline-tools-right">
          <button class="btn btn-icon btn-ghost" id="btn-zoom-out" title="Diminuir Zoom">
            ${icons.zoomOut}
          </button>
          <input type="range" id="zoom-slider" min="20" max="180" value="${zoom}" style="width: 90px;" />
          <button class="btn btn-icon btn-ghost" id="btn-zoom-in" title="Aumentar Zoom">
            ${icons.zoomIn}
          </button>
        </div>
      </div>

      <!-- Timeline Body -->
      <div class="timeline-body">
        <!-- Track Headers -->
        <div class="timeline-headers">
          <div class="timeline-header-ruler-space">Faixas</div>
          ${state.tracks.map(tr => `
            <div class="track-header ${tr.locked ? 'track-locked' : ''}" data-track-id="${tr.id}">
              <div class="track-header-title">
                ${tr.type === 'video' ? icons.video : tr.type === 'audio' ? icons.music : icons.text}
                <span>${tr.name}</span>
              </div>
              <div class="track-header-actions">
                <button class="track-action-btn ${tr.hidden ? 'active' : ''}" data-action="hide" title="${tr.hidden ? 'Mostrar Faixa' : 'Ocultar Faixa'}" style="${tr.hidden ? 'color: var(--accent-magenta);' : ''}">
                  ${icons.eye}
                </button>
                <button class="track-action-btn ${tr.locked ? 'active' : ''}" data-action="lock" title="${tr.locked ? 'Desbloquear Faixa' : 'Bloquear Faixa'}" style="${tr.locked ? 'color: var(--accent-cyan);' : ''}">
                  ${icons.lock}
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Tracks & Ruler Viewport -->
        <div class="timeline-tracks-viewport" id="tracks-viewport">
          <div class="timeline-tracks-content" id="tracks-content" style="width: ${totalWidth}px;">
            <!-- Ruler -->
            <div class="timeline-ruler" id="timeline-ruler">
              <div class="ruler-ticks" id="ruler-ticks"></div>
            </div>

            <!-- Lanes -->
            <div class="timeline-lanes">
              ${state.tracks.map(tr => `
                <div class="timeline-lane ${tr.hidden ? 'lane-hidden' : ''}" data-lane-track-id="${tr.id}" style="${tr.hidden ? 'opacity: 0.3;' : ''}">
                  ${state.clips
                    .filter(c => c.trackId === tr.id)
                    .map(clip => renderClipElement(clip, zoom, state.selectedClipId === clip.id, tr.locked))
                    .join('')}
                </div>
              `).join('')}
            </div>

            <!-- Playhead -->
            <div class="timeline-playhead" id="timeline-playhead" style="left: ${state.currentTime * zoom}px;">
              <div class="playhead-handle" id="playhead-handle" title="Arrastar indicador de tempo"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    renderRulerTicks(totalWidth, zoom);
    attachTimelineEvents();
  }

  function attachTimelineEvents() {
    const ruler = timelineElement.querySelector('#timeline-ruler');
    const playheadHandle = timelineElement.querySelector('#playhead-handle');

    const startPlayheadDrag = (e) => {
      isDraggingPlayhead = true;
      handleRulerScrub(e);
      if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();
    };

    ruler?.addEventListener('mousedown', startPlayheadDrag);
    ruler?.addEventListener('touchstart', startPlayheadDrag, { passive: false });

    playheadHandle?.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDraggingPlayhead = true;
    });
    playheadHandle?.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      isDraggingPlayhead = true;
    }, { passive: false });

    // Track hide and lock buttons
    timelineElement.querySelectorAll('.track-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const header = btn.closest('.track-header');
        const trackId = header?.getAttribute('data-track-id');
        const action = btn.getAttribute('data-action');
        if (action === 'hide') {
          store.toggleTrackHidden(trackId);
        } else if (action === 'lock') {
          store.toggleTrackLocked(trackId);
        }
      });
    });

    // Clip Selection and Dragging
    timelineElement.querySelectorAll('.timeline-clip').forEach(clipEl => {
      const clipId = clipEl.getAttribute('data-clip-id');

      const handleClipStart = (e) => {
        const clip = store.getState().clips.find(c => c.id === clipId);
        if (!clip) return;
        const track = store.getState().tracks.find(tr => tr.id === clip.trackId);
        if (track?.locked) {
          store.selectClip(clipId);
          return; // Locked tracks cannot be trimmed or moved!
        }

        const clientX = getClientX(e);

        if (e.target.classList.contains('trim-handle')) {
          if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();
          const side = e.target.getAttribute('data-trim');
          isTrimming = {
            clipId,
            side,
            startX: clientX,
            originalStart: clip.startTime,
            originalDuration: clip.duration
          };
          return;
        }

        store.selectClip(clipId);
        isDraggingClip = true;
        activeDragClip = {
          clipId,
          startX: clientX,
          originalStart: clip.startTime
        };
      };

      clipEl.addEventListener('mousedown', handleClipStart);
      clipEl.addEventListener('touchstart', handleClipStart, { passive: false });
    });

    // Upload Media Button on Timeline
    const uploadBtn = timelineElement.querySelector('#btn-timeline-upload');
    uploadBtn?.addEventListener('click', () => {
      openGlobalMediaPicker();
    });

    // Toolbar Split / Delete / Duplicate
    const splitBtn = timelineElement.querySelector('#btn-timeline-split');
    splitBtn?.addEventListener('click', () => {
      store.splitClipAtPlayhead();
    });

    const deleteBtn = timelineElement.querySelector('#btn-timeline-delete');
    deleteBtn?.addEventListener('click', () => {
      store.deleteClip();
    });

    const duplicateBtn = timelineElement.querySelector('#btn-timeline-duplicate');
    duplicateBtn?.addEventListener('click', () => {
      store.duplicateClip();
    });

    // Zoom controls
    const zoomSlider = timelineElement.querySelector('#zoom-slider');
    zoomSlider?.addEventListener('input', (e) => {
      store.setZoom(Number(e.target.value));
    });

    const zoomInBtn = timelineElement.querySelector('#btn-zoom-in');
    zoomInBtn?.addEventListener('click', () => {
      store.setZoom(store.getState().zoom + 15);
    });

    const zoomOutBtn = timelineElement.querySelector('#btn-zoom-out');
    zoomOutBtn?.addEventListener('click', () => {
      store.setZoom(store.getState().zoom - 15);
    });

    const snapBtn = timelineElement.querySelector('#btn-timeline-snap');
    snapBtn?.addEventListener('click', () => {
      store.state.isSnapping = !store.state.isSnapping;
      snapBtn.classList.toggle('btn-primary', store.state.isSnapping);
    });
  }

  // Update playhead position on time change without full re-render
  store.subscribe('time:changed', (t) => {
    const playhead = timelineElement.querySelector('#timeline-playhead');
    const zoom = store.getState().zoom;
    if (playhead) {
      playhead.style.left = `${t * zoom}px`;
    }
  });

  store.subscribe('timeline:updated', () => render());
  store.subscribe('tracks:updated', () => render());
  store.subscribe('zoom:changed', () => render());
  store.subscribe('selection:changed', (selId) => {
    timelineElement.querySelectorAll('.timeline-clip').forEach(c => {
      c.classList.toggle('selected', c.getAttribute('data-clip-id') === selId);
    });
  });

  render();
}
