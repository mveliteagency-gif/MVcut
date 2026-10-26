// Export Modal Component for KrakenCut Pro
import { icons } from './icons.js';
import { exportProject } from '../core/exporter.js';

export function openExportModal(modalContainer, { renderer, onToast }) {
  let isExporting = false;

  modalContainer.innerHTML = `
    <div class="modal-overlay" id="export-modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">
            ${icons.export}
            <span>Exportar Vídeo Profissional</span>
            <span class="badge-pro">PRO UNLOCKED</span>
          </div>
          <button class="btn btn-icon btn-ghost" id="btn-close-modal">
            ${icons.close}
          </button>
        </div>

        <div class="modal-body" id="modal-export-body">
          <div class="form-group">
            <label class="form-label">Resolução de Saída</label>
            <select id="export-res">
              <option value="1080p" selected>1080p Full HD (Recomendado)</option>
              <option value="4k">4K Ultra HD (Máxima Fidelidade)</option>
              <option value="720p">720p HD (Rápido)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Taxa de Quadros (FPS)</label>
            <select id="export-fps">
              <option value="30" selected>30 FPS (Padrão)</option>
              <option value="60">60 FPS (Ultra Fluido / Gamer)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Marca d'Água</label>
            <div style="background: rgba(0, 242, 254, 0.1); border: 1px solid var(--accent-cyan); padding: 10px; border-radius: var(--radius-sm); font-size: 12px; color: #fff; display: flex; align-items: center; gap: 8px;">
              <span class="badge-pro">GRÁTIS</span>
              <span>100% Desbloqueado: Zero marcas d'água no vídeo final!</span>
            </div>
          </div>

          <!-- Progress Section (Hidden initially) -->
          <div id="export-progress-box" style="display: none; flex-direction: column; gap: 8px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-primary);">
              <span>Renderizando vídeo...</span>
              <span id="export-progress-text" style="font-weight: 700; color: var(--accent-cyan);">0%</span>
            </div>
            <div style="width: 100%; height: 8px; background: var(--bg-surface-hover); border-radius: 4px; overflow: hidden;">
              <div id="export-progress-bar" style="width: 0%; height: 100%; background: var(--accent-gradient); transition: width 0.15s ease;"></div>
            </div>
          </div>
        </div>

        <div class="modal-footer" id="modal-export-footer">
          <button class="btn btn-ghost" id="btn-cancel-export">Cancelar</button>
          <button class="btn btn-primary" id="btn-start-export">
            ${icons.download}
            <span>Iniciar Renderização</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const overlay = modalContainer.querySelector('#export-modal-overlay');
  const closeBtn = modalContainer.querySelector('#btn-close-modal');
  const cancelBtn = modalContainer.querySelector('#btn-cancel-export');
  const startBtn = modalContainer.querySelector('#btn-start-export');
  const progressBox = modalContainer.querySelector('#export-progress-box');
  const progressBar = modalContainer.querySelector('#export-progress-bar');
  const progressText = modalContainer.querySelector('#export-progress-text');

  const closeModal = () => {
    if (isExporting) return;
    modalContainer.innerHTML = '';
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  startBtn.addEventListener('click', () => {
    isExporting = true;
    startBtn.disabled = true;
    cancelBtn.disabled = true;
    closeBtn.style.display = 'none';
    progressBox.style.display = 'flex';

    const res = modalContainer.querySelector('#export-res').value;
    const fps = Number(modalContainer.querySelector('#export-fps').value);

    exportProject({
      renderer,
      resolution: res,
      fps,
      onProgress: (percent) => {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
      },
      onComplete: ({ filename }) => {
        isExporting = false;
        onToast(`Vídeo exportado com sucesso: ${filename}!`, 'success');
        closeModal();
      },
      onError: (err) => {
        isExporting = false;
        startBtn.disabled = false;
        cancelBtn.disabled = false;
        closeBtn.style.display = 'block';
        onToast('Erro ao exportar vídeo: ' + err.message, 'error');
      }
    });
  });
}
