// Top Header Component for KrakenCut Pro
import { icons } from './icons.js';
import { store } from '../core/state.js';
import { aspectRatios } from '../core/presets.js';
import { openGlobalMediaPicker } from '../core/uploader.js';

export function initHeader(headerElement, { onOpenExport, onBackHome }) {
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('btn-install-app');
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  function render() {
    const state = store.getState();
    const canUndo = store.canUndo();
    const canRedo = store.canRedo();

    headerElement.innerHTML = `
      <div class="header-left">
        <button id="btn-back-home" class="btn btn-ghost" title="Voltar à Tela de Início" style="font-weight: 700; gap: 6px; padding: 6px 10px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="m15 18-6-6 6-6"/></svg>
          <span>Início</span>
        </button>

        <div class="tool-divider"></div>

        <div class="brand-logo" title="MVcut Pro - Editor Profissional">
          <img src="/logo.png" alt="MVcut Logo" style="width: 28px; height: 28px; border-radius: 6px; box-shadow: 0 0 10px rgba(0, 242, 254, 0.4); object-fit: cover;" />
          <span style="font-size: 16px; font-weight: 800; letter-spacing: -0.5px;">MVcut</span>
          <span class="badge-pro">PRO</span>
        </div>

        <button id="btn-header-import" class="btn btn-primary" title="Fazer Upload de Vídeos e Fotos" style="background: rgba(0, 242, 254, 0.15); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); font-weight: 700; gap: 6px; padding: 6px 14px; margin-left: 8px;">
          ${icons.upload}
          <span>Importar Mídia</span>
        </button>
      </div>

      <div class="header-center">
        <!-- Aspect Ratio Quick Switcher -->
        <select id="header-aspect-ratio" class="aspect-ratio-selector" title="Formato de Proporção">
          ${aspectRatios.map(r => `
            <option value="${r.id}" ${r.id === state.aspectRatio ? 'selected' : ''}>
              ${r.name}
            </option>
          `).join('')}
        </select>

        <div class="tool-divider"></div>

        <!-- Undo / Redo -->
        <button id="btn-undo" class="btn btn-icon btn-ghost" title="Desfazer (Ctrl+Z)" ${!canUndo ? 'disabled' : ''}>
          ${icons.undo}
        </button>
        <button id="btn-redo" class="btn btn-icon btn-ghost" title="Refazer (Ctrl+Y)" ${!canRedo ? 'disabled' : ''}>
          ${icons.redo}
        </button>
      </div>

      <div class="header-right">
        <!-- Install PWA Button -->
        <button id="btn-install-app" class="btn btn-ghost" style="display: none;">
          ${icons.smartphone}
          <span>Instalar App</span>
        </button>

        <!-- Export Pro Button -->
        <button id="btn-header-export" class="btn btn-primary" title="Exportar Vídeo em Alta Resolução">
          ${icons.export}
          <span>Exportar</span>
        </button>
      </div>
    `;

    // Event Listeners
    const ratioSelect = headerElement.querySelector('#header-aspect-ratio');
    ratioSelect.addEventListener('change', (e) => {
      store.setAspectRatio(e.target.value);
    });

    const undoBtn = headerElement.querySelector('#btn-undo');
    undoBtn.addEventListener('click', () => store.undo());

    const redoBtn = headerElement.querySelector('#btn-redo');
    redoBtn.addEventListener('click', () => store.redo());

    const backHomeBtn = headerElement.querySelector('#btn-back-home');
    backHomeBtn?.addEventListener('click', () => {
      if (onBackHome) onBackHome();
    });

    const importBtn = headerElement.querySelector('#btn-header-import');
    importBtn?.addEventListener('click', () => {
      openGlobalMediaPicker();
    });

    const exportBtn = headerElement.querySelector('#btn-header-export');
    exportBtn.addEventListener('click', onOpenExport);

    const installBtn = headerElement.querySelector('#btn-install-app');
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          installBtn.style.display = 'none';
        }
        deferredPrompt = null;
      }
    });
  }

  store.subscribe('history:changed', render);
  store.subscribe('aspectRatio:changed', render);

  render();
}
