// Complete Pro Inspector Component with Speed Curves, Masks, Chroma Key and Color Grading
import { icons } from './icons.js';
import { store } from '../core/state.js';
import { speedCurves, maskTypes } from '../core/presets.js';

export function initInspector(inspectorElement) {
  let activeTab = 'basic'; // 'basic' | 'speed' | 'mask' | 'color' | 'audio'

  function render() {
    const selectedClip = store.getSelectedClip();

    if (!selectedClip) {
      renderEmptyState();
      return;
    }

    if (selectedClip.type === 'text') {
      renderTextInspector(selectedClip);
      return;
    }

    renderVisualInspector(selectedClip);
  }

  function renderEmptyState() {
    const state = store.getState();
    inspectorElement.innerHTML = `
      <div class="inspector-header">
        <span class="inspector-title">
          ${icons.sliders}
          <span>Propriedades do Projeto</span>
        </span>
        <span class="badge-pro">PRO ATIVO</span>
      </div>

      <div class="inspector-content">
        <div class="inspector-section">
          <div class="inspector-section-title">Informações Gerais</div>
          <div class="form-group">
            <label class="form-label">Nome do Projeto</label>
            <input type="text" id="project-name-input" value="${state.projectTitle || 'Projeto 01'}" />
          </div>
          <div class="form-group">
            <div class="form-label">
              <span>Duração Total</span>
              <span class="form-val">${state.duration.toFixed(1)}s</span>
            </div>
          </div>
          <div class="form-group">
            <div class="form-label">
              <span>Proporção de Tela</span>
              <span class="form-val">${state.aspectRatio}</span>
            </div>
          </div>
        </div>

        <!-- Canvas Backgrounds (OpenCut & CapCut Style) -->
        <div class="inspector-section">
          <div class="inspector-section-title">Fundo do Canvas (Background)</div>
          <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px;">
            Preencha bordas pretas quando o vídeo não cobrir todo o formato da tela.
          </p>
          <div class="grid-2-cols" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button class="btn ${(state.canvasBackground?.type === 'color' && state.canvasBackground?.value === '#050608') || !state.canvasBackground ? 'btn-primary' : 'btn-ghost'}" data-canvas-bg="black" style="font-size: 11px; padding: 8px 6px;">
              ⬛ Preto Puro
            </button>
            <button class="btn ${state.canvasBackground?.type === 'gradient' ? 'btn-primary' : 'btn-ghost'}" data-canvas-bg="gradient" style="font-size: 11px; padding: 8px 6px;">
              🌌 Gradiente Neon
            </button>
            <button class="btn ${state.canvasBackground?.type === 'blur' ? 'btn-primary' : 'btn-ghost'}" data-canvas-bg="blur" style="font-size: 11px; padding: 8px 6px;">
              ✨ Desfoque do Vídeo
            </button>
            <button class="btn ${state.canvasBackground?.type === 'color' && state.canvasBackground?.value === '#ffffff' ? 'btn-primary' : 'btn-ghost'}" data-canvas-bg="white" style="font-size: 11px; padding: 8px 6px;">
              ⬜ Branco Studio
            </button>
          </div>
        </div>

        <div class="inspector-section">
          <div class="inspector-section-title">Atalhos de Teclado</div>
          <ul style="font-size: 11px; color: var(--text-secondary); line-height: 1.8; list-style: none;">
            <li><strong>Espaço:</strong> Reproduzir / Pausar</li>
            <li><strong>S:</strong> Dividir / Fatiar no Playhead</li>
            <li><strong>Delete:</strong> Excluir clipe</li>
            <li><strong>Ctrl + Z:</strong> Desfazer ação</li>
            <li><strong>Ctrl + Y:</strong> Refazer ação</li>
          </ul>
        </div>
      </div>
    `;

    const titleInput = inspectorElement.querySelector('#project-name-input');
    if (titleInput) {
      titleInput.addEventListener('input', (e) => {
        store.state.projectTitle = e.target.value;
      });
    }

    inspectorElement.querySelectorAll('[data-canvas-bg]').forEach(btn => {
      btn.addEventListener('click', () => {
        const bgType = btn.getAttribute('data-canvas-bg');
        if (bgType === 'gradient') {
          store.setCanvasBackground({ type: 'gradient' });
        } else if (bgType === 'blur') {
          store.setCanvasBackground({ type: 'blur' });
        } else if (bgType === 'white') {
          store.setCanvasBackground({ type: 'color', value: '#ffffff' });
        } else {
          store.setCanvasBackground({ type: 'color', value: '#050608' });
        }
        renderEmptyState();
      });
    });
  }

  function renderVisualInspector(clip) {
    const p = clip.properties || {};
    const f = p.filters || {};

    inspectorElement.innerHTML = `
      <div class="inspector-header">
        <span class="inspector-title">
          ${icons.sliders}
          <span>Editar Clipe</span>
        </span>
        <span class="badge-pro">PRO UNLOCKED</span>
      </div>

      <!-- Extended Pro Tabs -->
      <div class="inspector-tabs" style="overflow-x: auto; scrollbar-width: none;">
        <button class="inspector-tab ${activeTab === 'basic' ? 'active' : ''}" data-itab="basic">Básico</button>
        <button class="inspector-tab ${activeTab === 'speed' ? 'active' : ''}" data-itab="speed">Curva Vel.</button>
        <button class="inspector-tab ${activeTab === 'mask' ? 'active' : ''}" data-itab="mask">Máscara</button>
        <button class="inspector-tab ${activeTab === 'color' ? 'active' : ''}" data-itab="color">Cores & LUTs</button>
        <button class="inspector-tab ${activeTab === 'audio' ? 'active' : ''}" data-itab="audio">Áudio Pro</button>
      </div>

      <div class="inspector-content">
        ${activeTab === 'basic' ? `
          <!-- Transform Section -->
          <div class="inspector-section">
            <div class="inspector-section-title">Transformação & Escala</div>
            <div class="grid-2-cols">
              <div class="form-group">
                <div class="form-label">
                  <span>Escala X (Largura)</span>
                  <span class="form-val" id="val-scale-x">${(p.scaleX !== undefined ? p.scaleX : (p.scale || 1)).toFixed(2)}x</span>
                </div>
                <input type="range" id="prop-scale-x" min="0.2" max="3.0" step="0.05" value="${p.scaleX !== undefined ? p.scaleX : (p.scale || 1)}" />
              </div>
              <div class="form-group">
                <div class="form-label">
                  <span>Escala Y (Altura)</span>
                  <span class="form-val" id="val-scale-y">${(p.scaleY !== undefined ? p.scaleY : (p.scale || 1)).toFixed(2)}x</span>
                </div>
                <input type="range" id="prop-scale-y" min="0.2" max="3.0" step="0.05" value="${p.scaleY !== undefined ? p.scaleY : (p.scale || 1)}" />
              </div>
            </div>

            <div class="grid-2-cols">
              <div class="form-group">
                <div class="form-label"><span>Posição X</span></div>
                <input type="number" id="prop-x" value="${p.x || 0}" step="5" />
              </div>
              <div class="form-group">
                <div class="form-label"><span>Posição Y</span></div>
                <input type="number" id="prop-y" value="${p.y || 0}" step="5" />
              </div>
            </div>

            <div class="form-group">
              <div class="form-label">
                <span>Rotação</span>
                <span class="form-val" id="val-rot">${p.rotation || 0}°</span>
              </div>
              <input type="range" id="prop-rot" min="0" max="360" step="1" value="${p.rotation || 0}" />
            </div>

            <div class="form-group">
              <div class="form-label">
                <span>Opacidade</span>
                <span class="form-val" id="val-opacity">${Math.round((p.opacity ?? 1) * 100)}%</span>
              </div>
              <input type="range" id="prop-opacity" min="0" max="1" step="0.05" value="${p.opacity ?? 1}" />
            </div>

            <div class="form-group">
              <label class="form-label">Modo de Mesclagem (Blend Mode)</label>
              <select id="prop-blend-mode" style="width: 100%;">
                <option value="source-over" ${(p.blendMode || 'source-over') === 'source-over' ? 'selected' : ''}>Normal</option>
                <option value="screen" ${p.blendMode === 'screen' ? 'selected' : ''}>Screen (Clarear)</option>
                <option value="multiply" ${p.blendMode === 'multiply' ? 'selected' : ''}>Multiply (Multiplicar)</option>
                <option value="overlay" ${p.blendMode === 'overlay' ? 'selected' : ''}>Overlay (Sobrepor)</option>
                <option value="lighten" ${p.blendMode === 'lighten' ? 'selected' : ''}>Lighten</option>
                <option value="color-dodge" ${p.blendMode === 'color-dodge' ? 'selected' : ''}>Color Dodge</option>
                <option value="difference" ${p.blendMode === 'difference' ? 'selected' : ''}>Difference</option>
              </select>
            </div>
          </div>
        ` : ''}

        ${activeTab === 'speed' ? `
          <!-- Speed Curves Pro -->
          <div class="inspector-section">
            <div class="inspector-section-title">
              <span>Curvas de Velocidade CapCut Pro</span>
              <span class="badge-pro">PRO</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Crie acelerações dramáticas e câmera lenta cinematográfica.
            </p>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${speedCurves.map(sc => `
                <div class="asset-card curve-card ${(p.speedCurve || 'standard') === sc.id ? 'selected' : ''}"
                     data-curve-id="${sc.id}"
                     style="padding: 10px; cursor: pointer; border: 1px solid ${(p.speedCurve || 'standard') === sc.id ? 'var(--accent-cyan)' : 'var(--border-default)'};">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 12px; color: #fff;">${sc.name}</strong>
                    <span class="badge-pro">PRO</span>
                  </div>
                  <!-- Visual curve line preview -->
                  <div style="display: flex; align-items: flex-end; gap: 4px; height: 26px; margin-top: 6px;">
                    ${sc.points.map(pt => `
                      <div style="flex: 1; height: ${Math.min(100, (pt / 3.5) * 100)}%; background: var(--accent-cyan); border-radius: 2px;"></div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="form-group" style="margin-top: 14px;">
              <div class="form-label">
                <span>Velocidade Linear</span>
                <span class="form-val" id="val-speed">${(p.speed || 1).toFixed(2)}x</span>
              </div>
              <input type="range" id="prop-speed" min="0.2" max="4.0" step="0.1" value="${p.speed || 1}" />
            </div>
          </div>
        ` : ''}

        ${activeTab === 'mask' ? `
          <!-- Masking Tools Pro -->
          <div class="inspector-section">
            <div class="inspector-section-title">
              <span>Máscaras de Recorte</span>
              <span class="badge-pro">PRO</span>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
              Isole partes do vídeo com máscaras geométricas e bordas suaves.
            </p>

            <div class="grid-2-cols">
              ${maskTypes.map(m => `
                <button class="btn ${p.mask === m.id ? 'btn-primary' : 'btn-ghost'}" data-mask-type="${m.id}" style="font-size: 11px; padding: 10px 6px;">
                  ${m.name}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${activeTab === 'color' ? `
          <!-- Color Grading Pro -->
          <div class="inspector-section">
            <div class="inspector-section-title">Ajustes Profissionais de Cor</div>

            <div class="form-group">
              <div class="form-label">
                <span>Brilho</span>
                <span class="form-val" id="val-bright">${f.brightness ?? 100}%</span>
              </div>
              <input type="range" id="prop-bright" min="40" max="180" step="1" value="${f.brightness ?? 100}" />
            </div>

            <div class="form-group">
              <div class="form-label">
                <span>Contraste</span>
                <span class="form-val" id="val-contrast">${f.contrast ?? 100}%</span>
              </div>
              <input type="range" id="prop-contrast" min="40" max="180" step="1" value="${f.contrast ?? 100}" />
            </div>

            <div class="form-group">
              <div class="form-label">
                <span>Saturação</span>
                <span class="form-val" id="val-sat">${f.saturation ?? 100}%</span>
              </div>
              <input type="range" id="prop-sat" min="0" max="250" step="1" value="${f.saturation ?? 100}" />
            </div>

            <div class="form-group">
              <div class="form-label">
                <span>Matiz / Tom (Hue)</span>
                <span class="form-val" id="val-hue">${f.hue ?? 0}°</span>
              </div>
              <input type="range" id="prop-hue" min="-180" max="180" step="2" value="${f.hue ?? 0}" />
            </div>

            <div class="form-group">
              <div class="form-label">
                <span>Vinheta Cinema</span>
                <span class="form-val" id="val-vignette">${f.vignette ?? 0}%</span>
              </div>
              <input type="range" id="prop-vignette" min="0" max="50" step="1" value="${f.vignette ?? 0}" />
            </div>

            <div class="form-group">
              <div class="form-label">
                <span>Desfoque (Blur)</span>
                <span class="form-val" id="val-blur">${f.blur ?? 0}px</span>
              </div>
              <input type="range" id="prop-blur" min="0" max="15" step="0.5" value="${f.blur ?? 0}" />
            </div>

            <button class="btn btn-ghost" id="btn-reset-filters" style="width: 100%; margin-top: 8px;">
              Restaurar Cores Padrão
            </button>
          </div>
        ` : ''}

        ${activeTab === 'audio' ? `
          <div class="inspector-section">
            <div class="inspector-section-title">Controles de Áudio Pro</div>
            <div class="form-group">
              <div class="form-label">
                <span>Volume</span>
                <span class="form-val" id="val-vol">${Math.round((p.volume ?? 1) * 100)}%</span>
              </div>
              <input type="range" id="prop-vol" min="0" max="2" step="0.05" value="${p.volume ?? 1}" />
            </div>

            <div class="grid-2-cols" style="margin-top: 6px;">
              <div class="form-group">
                <div class="form-label">
                  <span>Fade In (Entrada)</span>
                  <span class="form-val" id="val-fade-in">${(p.fadeIn || 0).toFixed(1)}s</span>
                </div>
                <input type="range" id="prop-fade-in" min="0" max="5" step="0.5" value="${p.fadeIn || 0}" />
              </div>
              <div class="form-group">
                <div class="form-label">
                  <span>Fade Out (Saída)</span>
                  <span class="form-val" id="val-fade-out">${(p.fadeOut || 0).toFixed(1)}s</span>
                </div>
                <input type="range" id="prop-fade-out" min="0" max="5" step="0.5" value="${p.fadeOut || 0}" />
              </div>
            </div>

            <div class="form-group" style="margin-top: 14px;">
              <label class="form-label">Efeitos de Mudança de Voz (Voice Changer Pro)</label>
              <select id="voice-effect-select" style="width: 100%;">
                <option value="none" ${(p.voiceEffect || 'none') === 'none' ? 'selected' : ''}>Original (Voz Natural)</option>
                <option value="deep" ${p.voiceEffect === 'deep' ? 'selected' : ''}>Monstro / Voz Ultra Grave (Pro)</option>
                <option value="chipmunk" ${p.voiceEffect === 'chipmunk' ? 'selected' : ''}>Esquilo / Agudo Divertido (Pro)</option>
                <option value="robot" ${p.voiceEffect === 'robot' ? 'selected' : ''}>Robô Cibernético (Pro)</option>
                <option value="radio" ${p.voiceEffect === 'radio' ? 'selected' : ''}>Rádio Vintage / Megafone (Pro)</option>
                <option value="echo" ${p.voiceEffect === 'echo' ? 'selected' : ''}>Echo & Reverberação de Estúdio (Pro)</option>
              </select>
            </div>

            <label class="form-group" style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin-top: 14px; background: rgba(16, 185, 129, 0.1); border: 1px solid var(--accent-emerald); padding: 10px; border-radius: var(--radius-sm);">
              <input type="checkbox" id="prop-enhance-audio" ${p.enhanceAudio ? 'checked' : ''} style="accent-color: var(--accent-emerald); width: 16px; height: 16px;" />
              <div>
                <div style="font-size: 12px; font-weight: 700; color: #fff;">Melhoria de Estúdio & Redução de Ruído com IA</div>
                <div style="font-size: 10px; color: var(--text-muted);">Elimina chiados e realça frequências vocais</div>
              </div>
            </label>
          </div>
        ` : ''}
      </div>
    `;

    attachVisualEvents(clip);
  }

  function renderTextInspector(clip) {
    const t = clip.properties?.text || {};

    inspectorElement.innerHTML = `
      <div class="inspector-header">
        <span class="inspector-title">
          ${icons.text}
          <span>Editor de Texto</span>
        </span>
        <span class="badge-pro">PRO</span>
      </div>

      <div class="inspector-content">
        <div class="inspector-section">
          <div class="inspector-section-title">Conteúdo</div>
          <div class="form-group">
            <textarea id="text-content-input" rows="3" style="width: 100%; background: var(--bg-surface); border: 1px solid var(--border-default); color: #fff; border-radius: var(--radius-sm); padding: 8px; font-size: 13px; outline: none;">${t.content || ''}</textarea>
          </div>

          <div class="form-group">
            <div class="form-label">
              <span>Tamanho da Fonte</span>
              <span class="form-val" id="val-text-size">${t.size || 40}px</span>
            </div>
            <input type="range" id="text-size" min="16" max="120" value="${t.size || 40}" />
          </div>

          <div class="grid-2-cols">
            <div class="form-group">
              <label class="form-label">Cor do Texto</label>
              <input type="color" id="text-color" value="${t.color || '#ffffff'}" style="height: 34px; width: 100%; border: none; border-radius: 4px; cursor: pointer;" />
            </div>
            <div class="form-group">
              <label class="form-label">Cor da Borda</label>
              <input type="color" id="text-stroke-color" value="${t.strokeColor === 'transparent' ? '#000000' : (t.strokeColor || '#000000')}" style="height: 34px; width: 100%; border: none; border-radius: 4px; cursor: pointer;" />
            </div>
          </div>

          <div class="form-group">
            <div class="form-label">
              <span>Espessura da Borda</span>
              <span class="form-val" id="val-stroke-width">${t.strokeWidth || 0}px</span>
            </div>
            <input type="range" id="text-stroke-width" min="0" max="12" value="${t.strokeWidth || 0}" />
          </div>

          <div class="form-group">
            <label class="form-label">Fonte Tipográfica</label>
            <select id="text-font" style="width: 100%;">
              <option value="Inter" ${t.font === 'Inter' ? 'selected' : ''}>Inter (Padrão)</option>
              <option value="Outfit" ${t.font === 'Outfit' ? 'selected' : ''}>Outfit (Impactante)</option>
              <option value="Playfair Display" ${t.font === 'Playfair Display' ? 'selected' : ''}>Playfair Display (Elegante)</option>
              <option value="Impact" ${t.font === 'Impact' ? 'selected' : ''}>Impact (Memes/Viral)</option>
              <option value="JetBrains Mono" ${t.font === 'JetBrains Mono' ? 'selected' : ''}>JetBrains Mono (Código)</option>
              <option value="Arial" ${t.font === 'Arial' ? 'selected' : ''}>Arial (Sistema)</option>
              <option value="Times New Roman" ${t.font === 'Times New Roman' ? 'selected' : ''}>Times New Roman (Clássico)</option>
              <option value="Georgia" ${t.font === 'Georgia' ? 'selected' : ''}>Georgia (Serifada)</option>
            </select>
          </div>

          <div class="grid-2-cols">
            <div class="form-group">
              <label class="form-label">Alinhamento</label>
              <select id="text-align" style="width: 100%;">
                <option value="center" ${(t.align || 'center') === 'center' ? 'selected' : ''}>Centro</option>
                <option value="left" ${t.align === 'left' ? 'selected' : ''}>Esquerda</option>
                <option value="right" ${t.align === 'right' ? 'selected' : ''}>Direita</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Espaçamento</label>
              <input type="range" id="text-spacing" min="0" max="20" value="${t.spacing || 0}" />
            </div>
          </div>
        </div>
      </div>
    `;

    attachTextEvents(clip);
  }

  function attachVisualEvents(clip) {
    inspectorElement.querySelectorAll('.inspector-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.getAttribute('data-itab');
        render();
      });
    });

    if (activeTab === 'basic') {
      const scaleXInput = inspectorElement.querySelector('#prop-scale-x');
      scaleXInput?.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        inspectorElement.querySelector('#val-scale-x').textContent = `${val.toFixed(2)}x`;
        store.updateClip(clip.id, { properties: { scaleX: val, scale: val } });
      });

      const scaleYInput = inspectorElement.querySelector('#prop-scale-y');
      scaleYInput?.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        inspectorElement.querySelector('#val-scale-y').textContent = `${val.toFixed(2)}x`;
        store.updateClip(clip.id, { properties: { scaleY: val } });
      });

      const blendSelect = inspectorElement.querySelector('#prop-blend-mode');
      blendSelect?.addEventListener('change', (e) => {
        store.updateClip(clip.id, { properties: { blendMode: e.target.value } });
      });

      const xInput = inspectorElement.querySelector('#prop-x');
      xInput?.addEventListener('input', (e) => {
        store.updateClip(clip.id, { properties: { x: Number(e.target.value) } });
      });

      const yInput = inspectorElement.querySelector('#prop-y');
      yInput?.addEventListener('input', (e) => {
        store.updateClip(clip.id, { properties: { y: Number(e.target.value) } });
      });

      const rotInput = inspectorElement.querySelector('#prop-rot');
      rotInput?.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        inspectorElement.querySelector('#val-rot').textContent = `${val}°`;
        store.updateClip(clip.id, { properties: { rotation: val } });
      });

      const opInput = inspectorElement.querySelector('#prop-opacity');
      opInput?.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        inspectorElement.querySelector('#val-opacity').textContent = `${Math.round(val * 100)}%`;
        store.updateClip(clip.id, { properties: { opacity: val } });
      });
    }

    if (activeTab === 'speed') {
      inspectorElement.querySelectorAll('.curve-card').forEach(card => {
        card.addEventListener('click', () => {
          const cid = card.getAttribute('data-curve-id');
          store.updateClip(clip.id, { properties: { speedCurve: cid } });
          render();
        });
      });

      const speedInput = inspectorElement.querySelector('#prop-speed');
      speedInput?.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        inspectorElement.querySelector('#val-speed').textContent = `${val.toFixed(2)}x`;
        store.updateClip(clip.id, { properties: { speed: val, speedCurve: 'standard' } });
      });
    }

    if (activeTab === 'mask') {
      inspectorElement.querySelectorAll('button[data-mask-type]').forEach(btn => {
        btn.addEventListener('click', () => {
          const mt = btn.getAttribute('data-mask-type');
          store.updateClip(clip.id, { properties: { mask: mt } });
          render();
        });
      });
    }

    if (activeTab === 'color') {
      const updateFilter = (prop, val) => {
        const filters = clip.properties?.filters || {};
        filters[prop] = val;
        store.updateClip(clip.id, { properties: { filters } });
      };

      inspectorElement.querySelector('#prop-bright')?.addEventListener('input', (e) => {
        const v = Number(e.target.value);
        inspectorElement.querySelector('#val-bright').textContent = `${v}%`;
        updateFilter('brightness', v);
      });

      inspectorElement.querySelector('#prop-contrast')?.addEventListener('input', (e) => {
        const v = Number(e.target.value);
        inspectorElement.querySelector('#val-contrast').textContent = `${v}%`;
        updateFilter('contrast', v);
      });

      inspectorElement.querySelector('#prop-sat')?.addEventListener('input', (e) => {
        const v = Number(e.target.value);
        inspectorElement.querySelector('#val-sat').textContent = `${v}%`;
        updateFilter('saturation', v);
      });

      inspectorElement.querySelector('#prop-hue')?.addEventListener('input', (e) => {
        const v = Number(e.target.value);
        inspectorElement.querySelector('#val-hue').textContent = `${v}°`;
        updateFilter('hue', v);
      });

      inspectorElement.querySelector('#prop-vignette')?.addEventListener('input', (e) => {
        const v = Number(e.target.value);
        inspectorElement.querySelector('#val-vignette').textContent = `${v}%`;
        updateFilter('vignette', v);
      });

      inspectorElement.querySelector('#prop-blur')?.addEventListener('input', (e) => {
        const v = Number(e.target.value);
        inspectorElement.querySelector('#val-blur').textContent = `${v}px`;
        updateFilter('blur', v);
      });

      inspectorElement.querySelector('#btn-reset-filters')?.addEventListener('click', () => {
        store.updateClip(clip.id, {
          properties: {
            filters: { brightness: 100, contrast: 100, saturation: 100, hue: 0, vignette: 0, blur: 0 }
          }
        });
        render();
      });
    }

    if (activeTab === 'audio') {
      inspectorElement.querySelector('#prop-vol')?.addEventListener('input', (e) => {
        const v = Number(e.target.value);
        inspectorElement.querySelector('#val-vol').textContent = `${Math.round(v * 100)}%`;
        store.updateClip(clip.id, { properties: { volume: v } });
      });

      inspectorElement.querySelector('#prop-fade-in')?.addEventListener('input', (e) => {
        const v = Number(e.target.value);
        inspectorElement.querySelector('#val-fade-in').textContent = `${v.toFixed(1)}s`;
        store.updateClip(clip.id, { properties: { fadeIn: v } });
      });

      inspectorElement.querySelector('#prop-fade-out')?.addEventListener('input', (e) => {
        const v = Number(e.target.value);
        inspectorElement.querySelector('#val-fade-out').textContent = `${v.toFixed(1)}s`;
        store.updateClip(clip.id, { properties: { fadeOut: v } });
      });

      inspectorElement.querySelector('#voice-effect-select')?.addEventListener('change', (e) => {
        store.updateClip(clip.id, { properties: { voiceEffect: e.target.value } });
      });

      inspectorElement.querySelector('#prop-enhance-audio')?.addEventListener('change', (e) => {
        store.updateClip(clip.id, { properties: { enhanceAudio: e.target.checked } });
      });
    }
  }

  function attachTextEvents(clip) {
    const updateText = (key, val) => {
      const textConfig = clip.properties?.text || {};
      textConfig[key] = val;
      store.updateClip(clip.id, { properties: { text: textConfig } });
    };

    inspectorElement.querySelector('#text-content-input')?.addEventListener('input', (e) => {
      updateText('content', e.target.value);
    });

    inspectorElement.querySelector('#text-size')?.addEventListener('input', (e) => {
      const v = Number(e.target.value);
      inspectorElement.querySelector('#val-text-size').textContent = `${v}px`;
      updateText('size', v);
    });

    inspectorElement.querySelector('#text-color')?.addEventListener('input', (e) => {
      updateText('color', e.target.value);
    });

    inspectorElement.querySelector('#text-stroke-color')?.addEventListener('input', (e) => {
      updateText('strokeColor', e.target.value);
    });

    inspectorElement.querySelector('#text-stroke-width')?.addEventListener('input', (e) => {
      const v = Number(e.target.value);
      inspectorElement.querySelector('#val-stroke-width').textContent = `${v}px`;
      updateText('strokeWidth', v);
    });

    inspectorElement.querySelector('#text-font')?.addEventListener('change', (e) => {
      updateText('font', e.target.value);
    });

    inspectorElement.querySelector('#text-align')?.addEventListener('change', (e) => {
      updateText('align', e.target.value);
    });

    inspectorElement.querySelector('#text-spacing')?.addEventListener('input', (e) => {
      updateText('spacing', Number(e.target.value));
    });
  }

  store.subscribe('selection:changed', () => render());

  render();
}
