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

  function closeAllSheets() {
    sidebarPanel?.classList.remove('mobile-open');
    inspectorPanel?.classList.remove('mobile-open');
    backdrop?.classList.remove('visible');
    toolbarElement.querySelectorAll('.mobile-tool-item').forEach(b => b.classList.remove('active'));
  }

  backdrop.addEventListener('click', closeAllSheets);

  function render() {
    toolbarElement.innerHTML = `
      <button class="mobile-tool-item" id="m-btn-split" title="Dividir">
        ${icons.scissors}
        <span>Dividir</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-upload" style="color: var(--accent-cyan); font-weight: 700;" title="Upload de Mídia">
        ${icons.upload}
        <span>Upload</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-media" data-tab="media" title="Mídia">
        ${icons.video}
        <span>Mídia</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-text" data-tab="text" title="Texto">
        ${icons.text}
        <span>Texto</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-audio" data-tab="audio" title="Áudio">
        ${icons.music}
        <span>Áudio</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-filters" data-tab="filters" title="Filtros">
        ${icons.filter}
        <span>Filtros</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-edit" title="Ajustes">
        ${icons.sliders}
        <span>Ajustes</span>
      </button>

      <button class="mobile-tool-item" id="m-btn-export" style="color: var(--accent-cyan);" title="Exportar">
        ${icons.export}
        <span>Exportar</span>
      </button>
    `;

    // Split button
    toolbarElement.querySelector('#m-btn-split').addEventListener('click', () => {
      store.splitClipAtPlayhead();
    });

    // Mobile direct Upload button
    toolbarElement.querySelector('#m-btn-upload')?.addEventListener('click', () => {
      openGlobalMediaPicker();
    });

    // Sidebar tab buttons (Media, Text, Audio, Filters)
    ['media', 'text', 'audio', 'filters'].forEach(tabName => {
      toolbarElement.querySelector(`#m-btn-${tabName}`).addEventListener('click', () => {
        closeAllSheets();
        sidebarPanel?.classList.add('mobile-open');
        backdrop?.classList.add('visible');
        onSelectTab(tabName);
      });
    });

    // Inspector button
    toolbarElement.querySelector('#m-btn-edit').addEventListener('click', () => {
      closeAllSheets();
      inspectorPanel?.classList.add('mobile-open');
      backdrop?.classList.add('visible');
    });

    // Export button
    toolbarElement.querySelector('#m-btn-export').addEventListener('click', () => {
      closeAllSheets();
      onOpenExport();
    });
  }

  render();
}
