// CapCut Desktop Authentic Start Screen (Home View) Controller for MVcut Pro
import { icons } from './icons.js';
import { store } from '../core/state.js';
import { openGlobalMediaPicker } from '../core/uploader.js';

export function initHomeView(containerElement, { onEnterStudio }) {
  // Preset demo projects for recent projects list
  const recentProjects = [
    {
      id: 'proj-1',
      title: 'Edição Cyberpunk Neon 4K',
      aspect: '16:9',
      duration: '00:15',
      updated: 'Hoje, 14:20',
      bg: 'linear-gradient(135deg, #090a14, #00f2fe)',
      res: '4K PRO'
    },
    {
      id: 'proj-2',
      title: 'Vídeo Viral TikTok / Reels',
      aspect: '9:16',
      duration: '00:30',
      updated: 'Ontem',
      bg: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
      res: '1080p'
    },
    {
      id: 'proj-3',
      title: 'Podcast Highlights Teaser',
      aspect: '1:1',
      duration: '01:00',
      updated: 'Há 2 dias',
      bg: 'linear-gradient(135deg, #1b092a, #a855f7)',
      res: '1080p'
    },
    {
      id: 'proj-4',
      title: 'Comercial Produto Instagram',
      aspect: '9:16',
      duration: '00:20',
      updated: 'Há 3 dias',
      bg: 'linear-gradient(135deg, #00c6ff, #0072ff)',
      res: '4K PRO'
    }
  ];

  function render() {
    containerElement.innerHTML = `
      <!-- Left Sidebar -->
      <aside class="home-sidebar">
        <div>
          <!-- Brand Logo -->
          <div class="home-brand">
            <img src="/logo.png" alt="MVcut Logo" />
            <div class="home-brand-text">
              <span class="home-brand-title">MVcut</span>
              <span class="badge-pro" style="align-self: flex-start; margin-top: 2px;">PRO VITALÍCIO</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="home-nav-list">
            <button class="home-nav-item active" data-home-nav="home">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>Início</span>
            </button>
            <button class="home-nav-item" data-home-nav="projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              <span>Projetos</span>
            </button>
            <button class="home-nav-item" data-home-nav="cloud">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
              <span>Espaço na Nuvem</span>
              <span class="badge-pro" style="margin-left: auto;">100 GB</span>
            </button>
            <button class="home-nav-item" data-home-nav="trash">
              ${icons.trash}
              <span>Lixeira</span>
            </button>
          </nav>
        </div>

        <div>
          <!-- Cloud Storage Indicator (CapCut style) -->
          <div class="cloud-storage-box">
            <div class="cloud-storage-header">
              <span>Nuvem MVcut Pro</span>
              <span style="color: var(--accent-cyan); font-weight: 700;">14.2 GB / 100 GB</span>
            </div>
            <div class="cloud-storage-bar">
              <div class="cloud-storage-fill"></div>
            </div>
          </div>

          <!-- User Profile -->
          <div class="home-user-card">
            <div class="user-avatar">MV</div>
            <div class="user-info">
              <span class="user-name">Criador Pro VIP</span>
              <span class="user-tier">Todas as Funções Liberadas</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Hub Content Area -->
      <main class="home-main">
        <!-- Top Bar -->
        <div class="home-header-row">
          <div class="home-search-bar">
            ${icons.search}
            <input type="text" placeholder="Pesquisar projetos, modelos e mídia..." />
          </div>

          <div class="home-header-actions">
            <button class="btn btn-ghost" id="home-install-pwa" style="display: none;">
              ${icons.smartphone}
              <span>Instalar no PC / Celular</span>
            </button>
            <button class="btn btn-icon btn-ghost" title="Notificações">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
          </div>
        </div>

        <!-- Hero Actions (Novo Projeto, Upload de Mídia & Gravar) -->
        <section class="hero-create-section" style="grid-template-columns: 1.4fr 1.2fr 1fr;">
          <!-- Card 1: Criar Novo Projeto -->
          <div class="card-new-project" id="btn-hero-new-project" title="Abrir projeto em branco">
            <div class="new-project-content">
              <div class="new-project-icon-badge">
                ${icons.plus}
              </div>
              <div class="new-project-texts">
                <h2>Novo Projeto</h2>
                <p>Estúdio em branco multi-faixas</p>
              </div>
            </div>
            <button class="btn btn-primary btn-open-creator">
              <span>Abrir</span>
            </button>
          </div>

          <!-- Card 2: Importar Arquivos (Upload de Vídeos & Fotos) -->
          <div class="card-new-project" id="btn-hero-upload" title="Fazer upload de vídeos e fotos do seu dispositivo" style="border-color: var(--accent-cyan); background: linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(14, 16, 26, 0.95) 100%);">
            <div class="new-project-content">
              <div class="new-project-icon-badge" style="background: linear-gradient(135deg, #00f2fe, #4facfe);">
                ${icons.upload}
              </div>
              <div class="new-project-texts">
                <h2 style="color: var(--accent-cyan);">Importar Mídia</h2>
                <p>Upload de vídeos, fotos e áudios</p>
              </div>
            </div>
            <button class="btn btn-primary" style="background: var(--accent-cyan); color: #000; font-weight: 700; border-radius: var(--radius-full);">
              <span>Upload</span>
            </button>
          </div>

          <!-- Card 3: Gravar Tela / Câmera -->
          <div class="card-record-screen" id="btn-hero-record" title="Gravar webcam ou tela">
            <div class="card-record-header">
              <div class="record-icon-badge">
                <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <div>
                <strong style="font-size: 13px; color: #fff;">Gravar Tela</strong>
                <div style="font-size: 11px; color: var(--text-secondary);">Webcam / Tela</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick AI Pro Tools (CapCut Style) -->
        <section class="quick-tools-section">
          <div class="quick-tools-title-row">
            <div class="quick-tools-title">
              ${icons.sparkles}
              <span>Ferramentas Inteligentes Pro (Sem Limites)</span>
            </div>
            <span class="badge-pro">100% GRATUITO</span>
          </div>

          <div class="quick-tools-grid">
            <div class="quick-tool-card" data-action="autocut">
              <div class="quick-tool-icon" style="background: linear-gradient(135deg, #00f2fe, #4facfe);">
                ${icons.wand}
              </div>
              <span class="quick-tool-name">AutoCut Rápido</span>
              <span class="badge-pro">PRO</span>
            </div>

            <div class="quick-tool-card" data-action="captions">
              <div class="quick-tool-icon" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);">
                ${icons.text}
              </div>
              <span class="quick-tool-name">Legendas IA</span>
              <span class="badge-pro">PRO</span>
            </div>

            <div class="quick-tool-card" data-action="cutout">
              <div class="quick-tool-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                ${icons.scissors}
              </div>
              <span class="quick-tool-name">Remover Fundo</span>
              <span class="badge-pro">PRO</span>
            </div>

            <div class="quick-tool-card" data-action="reframe">
              <div class="quick-tool-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
              </div>
              <span class="quick-tool-name">Auto Reframe 9:16</span>
              <span class="badge-pro">PRO</span>
            </div>

            <div class="quick-tool-card" data-action="voice">
              <div class="quick-tool-icon" style="background: linear-gradient(135deg, #ec4899, #f43f5e);">
                ${icons.music}
              </div>
              <span class="quick-tool-name">Melhorar Áudio</span>
              <span class="badge-pro">PRO</span>
            </div>

            <div class="quick-tool-card" data-action="upscaler">
              <div class="quick-tool-icon" style="background: linear-gradient(135deg, #6366f1, #a855f7);">
                ${icons.sparkles}
              </div>
              <span class="quick-tool-name">Upscaler 4K IA</span>
              <span class="badge-pro">PRO</span>
            </div>
          </div>
        </section>

        <!-- Recent Projects Section -->
        <section class="recent-projects-section">
          <div class="recent-header-row">
            <span class="recent-title">Projetos Recentes</span>
            <div class="recent-tabs">
              <button class="recent-tab-btn active">Todos</button>
              <button class="recent-tab-btn">Vídeos</button>
              <button class="recent-tab-btn">Nuvem</button>
            </div>
          </div>

          <div class="projects-grid">
            ${recentProjects.map(proj => `
              <div class="project-card" data-project-id="${proj.id}">
                <div class="project-thumb" style="background: ${proj.bg};">
                  <div class="project-res-tag">${proj.res}</div>
                  <div class="project-duration-tag">${proj.duration}</div>
                  <div style="font-weight: 800; color: rgba(255, 255, 255, 0.85); font-size: 16px; font-family: 'Outfit';">
                    ${proj.aspect}
                  </div>
                </div>
                <div class="project-card-details">
                  <span class="project-card-title">${proj.title}</span>
                  <div class="project-card-meta">
                    <span>${proj.updated}</span>
                    <span style="color: var(--accent-cyan); font-weight: 600;">Abrir ➜</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </main>
    `;

    attachEvents();
  }

  function attachEvents() {
    // New Project Launch
    containerElement.querySelector('#btn-hero-new-project')?.addEventListener('click', () => {
      onEnterStudio();
    });

    // Import Media / Upload from Home Screen
    containerElement.querySelector('#btn-hero-upload')?.addEventListener('click', () => {
      openGlobalMediaPicker({
        onSuccess: () => onEnterStudio()
      });
    });

    // Record Screen -> launches studio
    containerElement.querySelector('#btn-hero-record')?.addEventListener('click', () => {
      onEnterStudio();
    });

    // Quick Tool Cards -> launch studio with relevant presets
    containerElement.querySelectorAll('.quick-tool-card').forEach(card => {
      card.addEventListener('click', () => {
        onEnterStudio();
      });
    });

    // Project Cards -> open in editor
    containerElement.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const pid = card.getAttribute('data-project-id');
        const proj = recentProjects.find(p => p.id === pid);
        if (proj) {
          store.state.projectTitle = proj.title;
          if (proj.aspect === '9:16') store.setAspectRatio('9:16');
          else if (proj.aspect === '1:1') store.setAspectRatio('1:1');
          else store.setAspectRatio('16:9');
        }
        onEnterStudio();
      });
    });
  }

  render();
}
