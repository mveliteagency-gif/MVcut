import { icons } from './icons.js';
import { store } from '../core/state.js';
import { globalMediaLibrary, openGlobalMediaPicker, handleMediaFiles } from '../core/uploader.js';
import {
  textPresets,
  filterPresets,
  filterCategories,
  effectPresets,
  effectCategories,
  stickerPresets,
  transitionPresets,
  createStockVideoSource,
  createAudioSynth
} from '../core/presets.js';

export function initSidebar(sidebarElement) {
  let activeTab = 'media';
  let activeFilterCat = 'all';
  let activeEffectCat = 'all';
  const audioSynth = createAudioSynth();

  store.subscribe('media:imported', () => {
    if (activeTab === 'media') render();
  });

  function render() {
    sidebarElement.innerHTML = `
      <!-- Left Category Nav -->
      <nav class="sidebar-nav">
        <button class="nav-tab-btn ${activeTab === 'media' ? 'active' : ''}" data-tab="media" title="Mídia">
          ${icons.video}
          <span>Mídia</span>
        </button>
        <button class="nav-tab-btn ${activeTab === 'audio' ? 'active' : ''}" data-tab="audio" title="Áudio">
          ${icons.music}
          <span>Áudio</span>
        </button>
        <button class="nav-tab-btn ${activeTab === 'text' ? 'active' : ''}" data-tab="text" title="Texto">
          ${icons.text}
          <span>Texto</span>
        </button>
        <button class="nav-tab-btn ${activeTab === 'effects' ? 'active' : ''}" data-tab="effects" title="Efeitos Pro">
          ${icons.wand}
          <span>Efeitos</span>
        </button>
        <button class="nav-tab-btn ${activeTab === 'filters' ? 'active' : ''}" data-tab="filters" title="Filtros Pro">
          ${icons.filter}
          <span>Filtros</span>
        </button>
        <button class="nav-tab-btn ${activeTab === 'stickers' ? 'active' : ''}" data-tab="stickers" title="Figurinhas & Selos">
          ${icons.sticker}
          <span>Stickers</span>
        </button>
        <button class="nav-tab-btn ${activeTab === 'transitions' ? 'active' : ''}" data-tab="transitions" title="Transições Pro">
          ${icons.transition}
          <span>Transição</span>
        </button>
      </nav>

      <!-- Content Drawer -->
      <div class="sidebar-content">
        ${renderTabContent(activeTab)}
      </div>
    `;

    sidebarElement.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        render();
      });
    });

    attachTabEvents(activeTab);
  }

  function renderTabContent(tab) {
    if (tab === 'media') {
      return `
        <div class="sidebar-header">
          <div class="sidebar-title-row">
            <span class="sidebar-title">Biblioteca de Mídia</span>
            <span class="badge-pro">PRO UNLOCKED</span>
          </div>
          <div class="search-input-box">
            ${icons.search}
            <input type="text" placeholder="Buscar clipes..." />
          </div>
        </div>

        <div class="media-upload-dropzone" id="media-dropzone">
          ${icons.upload}
          <p><strong>Clique ou arraste vídeos, fotos ou músicas</strong></p>
          <span>Formatos: MP4, MOV, WebM, MKV, JPG, PNG, WEBP, MP3, WAV</span>
          <input type="file" id="media-file-input" multiple accept="video/*,image/*,audio/*,.mp4,.mov,.webm,.mkv,.avi,.jpg,.jpeg,.png,.webp,.mp3,.wav,.m4a" style="display: none;" />
        </div>

        <div class="asset-scroll-container">
          ${globalMediaLibrary.length > 0 ? `
            <div style="margin-bottom: 16px;">
              <h4 style="font-size: 11px; color: var(--accent-cyan); font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">
                Minha Mídia Importada (${globalMediaLibrary.length})
              </h4>
              <div class="asset-grid">
                ${globalMediaLibrary.map((m, idx) => `
                  <div class="asset-card" data-uploaded-idx="${idx}">
                    <div class="asset-thumb" style="${m.thumb ? `background-image: url(${m.thumb}); background-size: cover; background-position: center;` : 'background: #141724;'}">
                      <div class="asset-card-duration">${m.duration.toFixed(1)}s</div>
                      <div class="asset-card-badge"><span class="badge-pro">${m.type.toUpperCase()}</span></div>
                    </div>
                    <div class="asset-card-info">
                      <span class="asset-card-name" title="${m.name}">${m.name}</span>
                      <button class="asset-card-add-btn" title="Adicionar à Linha do Tempo">${icons.plus}</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <h4 style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase;">
            Clipes de Demonstração (Prontos)
          </h4>
          <div class="asset-grid">
            <div class="asset-card" data-stock="cyber">
              <div class="asset-thumb" style="background: linear-gradient(135deg, #100b20, #00f2fe);">
                <div class="asset-card-duration">07.0s</div>
                <div class="asset-card-badge"><span class="badge-pro">PRO</span></div>
              </div>
              <div class="asset-card-info">
                <span class="asset-card-name">Cyberpunk Neon</span>
                <button class="asset-card-add-btn">${icons.plus}</button>
              </div>
            </div>

            <div class="asset-card" data-stock="sunset">
              <div class="asset-thumb" style="background: linear-gradient(135deg, #ff416c, #ff4b2b);">
                <div class="asset-card-duration">08.0s</div>
                <div class="asset-card-badge"><span class="badge-pro">PRO</span></div>
              </div>
              <div class="asset-card-info">
                <span class="asset-card-name">Sunset City</span>
                <button class="asset-card-add-btn">${icons.plus}</button>
              </div>
            </div>

            <div class="asset-card" data-stock="ocean">
              <div class="asset-thumb" style="background: linear-gradient(135deg, #00c6ff, #0072ff);">
                <div class="asset-card-duration">05.0s</div>
                <div class="asset-card-badge"><span class="badge-pro">PRO</span></div>
              </div>
              <div class="asset-card-info">
                <span class="asset-card-name">Ocean Flow</span>
                <button class="asset-card-add-btn">${icons.plus}</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (tab === 'filters') {
      const filtered = activeFilterCat === 'all'
        ? filterPresets
        : filterPresets.filter(f => f.category === activeFilterCat);

      return `
        <div class="sidebar-header">
          <div class="sidebar-title-row">
            <span class="sidebar-title">Filtros & LUTs Pro</span>
            <span class="badge-pro">${filterPresets.length} DESBLOQUEADOS</span>
          </div>
          <!-- Category Pills -->
          <div class="subcat-pills">
            ${filterCategories.map(cat => `
              <button class="subcat-pill ${cat.id === activeFilterCat ? 'active' : ''}" data-fcat="${cat.id}">
                ${cat.name}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="asset-scroll-container">
          <div class="asset-grid">
            ${filtered.map(f => `
              <div class="asset-card" data-filter-id="${f.id}">
                <div class="asset-thumb" style="background: linear-gradient(135deg, #1b1e2a, #2a2f42);">
                  <div class="asset-card-badge"><span class="badge-pro">${f.tag}</span></div>
                  <span style="font-size: 11px; font-weight: 700; color: #fff; text-align: center; padding: 4px;">
                    ${f.name}
                  </span>
                </div>
                <div class="asset-card-info">
                  <span class="asset-card-name">${f.name}</span>
                  <button class="asset-card-add-btn" title="Aplicar ao clipe selecionado">${icons.plus}</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'effects') {
      const filtered = activeEffectCat === 'all'
        ? effectPresets
        : effectPresets.filter(e => e.category === activeEffectCat);

      return `
        <div class="sidebar-header">
          <div class="sidebar-title-row">
            <span class="sidebar-title">Efeitos Visuais Pro</span>
            <span class="badge-pro">${effectPresets.length} DESBLOQUEADOS</span>
          </div>
          <div class="subcat-pills">
            ${effectCategories.map(cat => `
              <button class="subcat-pill ${cat.id === activeEffectCat ? 'active' : ''}" data-ecat="${cat.id}">
                ${cat.name}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="asset-scroll-container">
          <div class="asset-grid">
            ${filtered.map(e => `
              <div class="asset-card" data-effect-id="${e.id}">
                <div class="asset-thumb" style="background: radial-gradient(circle, #222638, #0c0d14);">
                  ${e.tag ? `<div class="asset-card-badge"><span class="badge-pro">${e.tag}</span></div>` : ''}
                  <span style="font-size: 11px; font-weight: 700; color: #00f2fe; text-align: center; padding: 6px;">
                    ${e.name}
                  </span>
                </div>
                <div class="asset-card-info">
                  <span class="asset-card-name">${e.name}</span>
                  <button class="asset-card-add-btn" title="Aplicar Efeito">${icons.plus}</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'text') {
      return `
        <div class="sidebar-header">
          <div class="sidebar-title-row">
            <span class="sidebar-title">Modelos de Texto & Títulos</span>
            <span class="badge-pro">PRO UNLOCKED</span>
          </div>
        </div>

        <div class="asset-scroll-container">
          <div class="asset-grid">
            ${textPresets.map(tp => `
              <div class="asset-card" data-text-preset="${tp.id}">
                <div class="asset-thumb" style="background: #181b24; padding: 12px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-family: '${tp.style.font}'; font-size: 13px; font-weight: bold; color: ${tp.style.color};">
                    ${tp.name}
                  </span>
                </div>
                <div class="asset-card-info">
                  <span class="asset-card-name">${tp.name}</span>
                  <button class="asset-card-add-btn">${icons.plus}</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'audio') {
      return `
        <div class="sidebar-header">
          <div class="sidebar-title-row">
            <span class="sidebar-title">Áudio, Batidas & Efeitos</span>
            <span class="badge-pro">ROYALTY FREE</span>
          </div>
        </div>

        <div class="asset-scroll-container">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div class="asset-card" data-sound="lofi" style="padding: 10px; flex-direction: row; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 12px; color: #fff;">Trilha Sonora Lo-Fi Chill Beat</strong>
                <div style="font-size: 10px; color: var(--text-muted);">Sintetizador 85 BPM</div>
              </div>
              <button class="btn btn-icon btn-ghost btn-play-sound" data-sound="lofi">${icons.play}</button>
            </div>

            <div class="asset-card" data-sound="whoosh" style="padding: 10px; flex-direction: row; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 12px; color: #fff;">Transição Whoosh Dinâmico</strong>
                <div style="font-size: 10px; color: var(--text-muted);">0.4s • Transição rápida</div>
              </div>
              <button class="btn btn-icon btn-ghost btn-play-sound" data-sound="whoosh">${icons.play}</button>
            </div>

            <div class="asset-card" data-sound="boom" style="padding: 10px; flex-direction: row; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 12px; color: #fff;">Cinematic Bass Boom Sub</strong>
                <div style="font-size: 10px; color: var(--text-muted);">0.9s • Impacto dramático</div>
              </div>
              <button class="btn btn-icon btn-ghost btn-play-sound" data-sound="boom">${icons.play}</button>
            </div>

            <div class="asset-card" data-sound="glitch" style="padding: 10px; flex-direction: row; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 12px; color: #fff;">Som Digital Glitch</strong>
                <div style="font-size: 10px; color: var(--text-muted);">0.2s • Erro cibernético</div>
              </div>
              <button class="btn btn-icon btn-ghost btn-play-sound" data-sound="glitch">${icons.play}</button>
            </div>
          </div>
        </div>
      `;
    }

    if (tab === 'stickers') {
      return `
        <div class="sidebar-header">
          <div class="sidebar-title-row">
            <span class="sidebar-title">Figurinhas & Selos Pro</span>
            <span class="badge-pro">PRO UNLOCKED</span>
          </div>
        </div>

        <div class="asset-scroll-container">
          <div class="asset-grid">
            ${stickerPresets.map(st => `
              <div class="asset-card" data-sticker-id="${st.id}">
                <div class="asset-thumb" style="background: #141724; display: flex; align-items: center; justify-content: center; padding: 10px;">
                  <span style="font-weight: 800; font-size: 13px; color: ${st.color || '#fff'};">
                    ${st.text}
                  </span>
                </div>
                <div class="asset-card-info">
                  <span class="asset-card-name">${st.name}</span>
                  <button class="asset-card-add-btn" title="Inserir na timeline">${icons.plus}</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'transitions') {
      return `
        <div class="sidebar-header">
          <div class="sidebar-title-row">
            <span class="sidebar-title">Transições Entre Clipes</span>
            <span class="badge-pro">PRO UNLOCKED</span>
          </div>
        </div>

        <div class="asset-scroll-container">
          <div class="asset-grid">
            ${transitionPresets.map(tr => `
              <div class="asset-card" data-trans-id="${tr.id}">
                <div class="asset-thumb" style="background: linear-gradient(135deg, #12141f, #252a3f); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;">
                  <span class="badge-pro">PRO</span>
                  <span style="font-size: 11px; font-weight: 700; color: #fff;">${tr.name}</span>
                </div>
                <div class="asset-card-info">
                  <span class="asset-card-name">${tr.name}</span>
                  <button class="asset-card-add-btn">${icons.plus}</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return '';
  }

  function attachTabEvents(tab) {
    if (tab === 'media') {
      const dropzone = sidebarElement.querySelector('#media-dropzone');

      if (dropzone) {
        dropzone.addEventListener('click', () => openGlobalMediaPicker());

        dropzone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
          handleMediaFiles(e.dataTransfer.files);
        });
      }

      sidebarElement.querySelectorAll('.asset-card[data-uploaded-idx]').forEach(card => {
        card.addEventListener('click', () => {
          const idx = Number(card.getAttribute('data-uploaded-idx'));
          const item = globalMediaLibrary[idx];
          if (item) {
            const trackId = item.type === 'audio' ? 't-audio' : 't-video';
            store.addClip({
              trackId,
              name: item.name,
              type: item.type,
              duration: item.duration,
              sourceDuration: item.duration,
              sourceElement: item.element
            });
          }
        });
      });

      sidebarElement.querySelectorAll('.asset-card[data-stock]').forEach(card => {
        card.addEventListener('click', () => {
          const type = card.getAttribute('data-stock');
          const canvasSrc = createStockVideoSource(type.toUpperCase(), type);
          store.addClip({
            trackId: 't-video',
            name: `${type.toUpperCase()}.mp4`,
            type: 'video',
            duration: 6.0,
            sourceDuration: 6.0,
            sourceElement: canvasSrc
          });
        });
      });
    }

    if (tab === 'filters') {
      sidebarElement.querySelectorAll('.subcat-pill[data-fcat]').forEach(pill => {
        pill.addEventListener('click', () => {
          activeFilterCat = pill.getAttribute('data-fcat');
          render();
        });
      });

      sidebarElement.querySelectorAll('.asset-card[data-filter-id]').forEach(card => {
        card.addEventListener('click', () => {
          const filterId = card.getAttribute('data-filter-id');
          const preset = filterPresets.find(f => f.id === filterId);
          let target = store.getSelectedClip();
          if (!target) {
            target = store.getState().clips.find(c => c.type === 'video');
          }
          if (target && preset) {
            store.updateClip(target.id, {
              properties: { filters: { ...preset.filters } }
            });
          }
        });
      });
    }

    if (tab === 'effects') {
      sidebarElement.querySelectorAll('.subcat-pill[data-ecat]').forEach(pill => {
        pill.addEventListener('click', () => {
          activeEffectCat = pill.getAttribute('data-ecat');
          render();
        });
      });

      sidebarElement.querySelectorAll('.asset-card[data-effect-id]').forEach(card => {
        card.addEventListener('click', () => {
          const effectId = card.getAttribute('data-effect-id');
          let target = store.getSelectedClip();
          if (!target) {
            target = store.getState().clips.find(c => c.type === 'video');
          }
          if (target) {
            store.updateClip(target.id, {
              properties: { effect: effectId }
            });
          }
        });
      });
    }

    if (tab === 'stickers') {
      sidebarElement.querySelectorAll('.asset-card[data-sticker-id]').forEach(card => {
        card.addEventListener('click', () => {
          const sid = card.getAttribute('data-sticker-id');
          const st = stickerPresets.find(s => s.id === sid);
          if (st) {
            store.addClip({
              trackId: 't-text',
              name: st.name,
              type: 'sticker',
              duration: 3.5,
              properties: {
                scale: 0.8,
                sticker: { ...st }
              }
            });
          }
        });
      });
    }

    if (tab === 'transitions') {
      sidebarElement.querySelectorAll('.asset-card[data-trans-id]').forEach(card => {
        card.addEventListener('click', () => {
          const tid = card.getAttribute('data-trans-id');
          const selected = store.getSelectedClip();
          if (selected) {
            store.updateClip(selected.id, {
              properties: { transition: tid }
            });
          }
        });
      });
    }

    if (tab === 'text') {
      sidebarElement.querySelectorAll('.asset-card[data-text-preset]').forEach(card => {
        card.addEventListener('click', () => {
          const presetId = card.getAttribute('data-text-preset');
          const preset = textPresets.find(p => p.id === presetId);
          if (preset) {
            store.addClip({
              trackId: 't-text',
              name: preset.name,
              type: 'text',
              duration: 4.0,
              properties: {
                text: { ...preset.style }
              }
            });
          }
        });
      });
    }
  }

  render();
}
