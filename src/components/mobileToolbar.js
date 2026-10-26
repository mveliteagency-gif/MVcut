import { icons } from './icons.js';
import { store } from '../core/state.js';
import { openGlobalMediaPicker } from '../core/uploader.js';

export function initMobileToolbar(toolbarElement, { onOpenExport, onSelectTab }) {
  const sidebarPanel = document.getElementById('sidebar-panel');
  const inspectorPanel = document.getElementById('inspector-panel');

  // Create backdrop if not existing
  let backdrop = document.getElementById('mobile-sheet-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'mobile-sheet-backdrop';
    backdrop.className = 'mobile-sheet-backdrop';
    document.body.appendChild(backdrop);
  }

  function ensureSheetCloseBars() {
    [sidebarPanel, inspectorPanel].forEach(panel => {
      if (!panel || panel.querySelector('.mobile-sheet-close-bar')) return;
      const bar = document.createElement('div');
      bar.className = 'mobile-sheet-close-bar';
      bar.innerHTML = `
        <div class="sheet-drag-handle" title="Puxar para fechar"></div>
        <button class="btn-sheet-close" type="button" aria-label="Fechar">✕</button>
      `;
      bar.querySelector('.btn-sheet-close')?.addEventListener('click', closeAllSheets);
      bar.querySelector('.sheet-drag-handle')?.addEventListener('click', closeAllSheets);
      panel.prepend(bar);
    });
  }

  function closeAllSheets() {
    sidebarPanel?.classList.remove('mobile-open');
    inspectorPanel?.classList.remove('mobile-open');
    backdrop?.classList.remove('visible');
    toolbarElement.querySelectorAll('.mobile-tool-item').forEach(b => b.classList.remove('active'));
  }

  backdrop.addEventListener('click', closeAllSheets);

  function render() {
    toolbarElement.innerHTML = `
      <button class="mobile-tool-item" id="m-btn-split" title="Dividir no Playhead">
        ${icons.scissors}
        <span>Dividir</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-upload" style="color: var(--accent-cyan); font-weight: 700;" title="Upload de Mídia">
        ${icons.upload}
        <span>Upload</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-media" data-tab="media" title="Biblioteca de Mídia">
        ${icons.video}
        <span>Mídia</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-text" data-tab="text" title="Títulos e Legendas">
        ${icons.text}
        <span>Texto</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-audio" data-tab="audio" title="Música e Efeitos Sonoros">
        ${icons.music}
        <span>Áudio</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-effects" data-tab="effects" title="Efeitos Visuais Pro">
        ${icons.wand}
        <span>Efeitos</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-filters" data-tab="filters" title="Filtros e LUTs de Cor">
        ${icons.filter}
        <span>Filtros</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-stickers" data-tab="stickers" title="Figurinhas e Selos">
        ${icons.sticker}
        <span>Stickers</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-transitions" data-tab="transitions" title="Transições entre Clipes">
        ${icons.transition}
        <span>Transições</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-edit" title="Ajustes e Propriedades">
        ${icons.sliders}
        <span>Ajustes</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-export" style="color: var(--accent-cyan);" title="Exportar Vídeo">
        ${icons.export}
        <span>Exportar</span>
      </button>
    `;

    // Ensure close buttons exist on panels
    ensureSheetCloseBars();

    // Split button
    toolbarElement.querySelector('#m-btn-split')?.addEventListener('click', () => {
      store.splitClipAtPlayhead();
    });

    // Mobile direct Upload button
    toolbarElement.querySelector('#m-btn-upload')?.addEventListener('click', () => {
      openGlobalMediaPicker();
    });

    // Sidebar tab buttons (Media, Text, Audio, Effects, Filters, Stickers, Transitions)
    ['media', 'text', 'audio', 'effects', 'filters', 'stickers', 'transitions'].forEach(tabName => {
      const btn = toolbarElement.querySelector(`#m-btn-${tabName}`);
      btn?.addEventListener('click', () => {
        closeAllSheets();
        btn.classList.add('active');
        ensureSheetCloseBars();
        sidebarPanel?.classList.add('mobile-open');
        backdrop?.classList.add('visible');
        onSelectTab(tabName);
      });
    });

    // Inspector button
    const editBtn = toolbarElement.querySelector('#m-btn-edit');
    editBtn?.addEventListener('click', () => {
      closeAllSheets();
      editBtn.classList.add('active');
      ensureSheetCloseBars();
      inspectorPanel?.classList.add('mobile-open');
      backdrop?.classList.add('visible');
    });

    // Export button
    toolbarElement.querySelector('#m-btn-export')?.addEventListener('click', () => {
      closeAllSheets();
      onOpenExport();
    });
  }

  render();
}
