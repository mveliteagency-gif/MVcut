// Main Application Entrypoint for MVcut Pro
import { store } from './core/state.js';
import { initHomeView } from './components/homeView.js';
import { initHeader } from './components/header.js';
import { initSidebar } from './components/sidebar.js';
import { initPreview } from './components/preview.js';
import { initTimeline } from './components/timeline.js';
import { initInspector } from './components/inspector.js';
import { initMobileToolbar } from './components/mobileToolbar.js';
import { openExportModal } from './components/exportModal.js';

// Toast Notification Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  const homeViewEl = document.getElementById('home-view');
  const studioViewEl = document.getElementById('studio-view');
  const headerEl = document.getElementById('header');
  const sidebarEl = document.getElementById('sidebar-panel');
  const previewEl = document.getElementById('preview-panel');
  const timelineEl = document.getElementById('timeline-panel');
  const inspectorEl = document.getElementById('inspector-panel');
  const mobileToolbarEl = document.getElementById('mobile-toolbar');
  const modalContainer = document.getElementById('modal-container');

  // Preview Controller
  const previewController = initPreview(previewEl);

  // View Switching (Home <-> Studio)
  const showStudio = () => {
    homeViewEl.style.display = 'none';
    studioViewEl.style.display = 'flex';
    // Trigger canvas resize
    window.dispatchEvent(new Event('resize'));
    store.emit('aspectRatio:changed', store.getState().aspectRatio);
  };

  const showHome = () => {
    store.pause();
    studioViewEl.style.display = 'none';
    homeViewEl.style.display = 'flex';
  };

  // Initialize Home Start Screen (CapCut Desktop style)
  initHomeView(homeViewEl, {
    onEnterStudio: showStudio
  });

  const handleOpenExport = () => {
    openExportModal(modalContainer, {
      renderer: previewController.getRenderer(),
      onToast: showToast
    });
  };

  // Initialize Header
  initHeader(headerEl, {
    onOpenExport: handleOpenExport,
    onBackHome: showHome
  });

  // Initialize Studio Components
  initSidebar(sidebarEl);
  initTimeline(timelineEl);
  initInspector(inspectorEl);

  // Initialize Mobile Toolbar
  initMobileToolbar(mobileToolbarEl, {
    onOpenExport: handleOpenExport,
    onSelectTab: (tabName) => {
      const tabBtn = sidebarEl.querySelector(`.nav-tab-btn[data-tab="${tabName}"]`);
      tabBtn?.click();
    }
  });

  // Keyboard Shortcuts (Active when inside Studio)
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      store.togglePlay();
    } else if (e.code === 'KeyS') {
      e.preventDefault();
      const didSplit = store.splitClipAtPlayhead();
      if (didSplit) showToast('Clipe fatiado no playhead!', 'success');
    } else if (e.code === 'Delete' || e.code === 'Backspace') {
      if (store.getState().selectedClipId) {
        e.preventDefault();
        store.deleteClip();
        showToast('Clipe excluído', 'info');
      }
    } else if (e.ctrlKey && e.code === 'KeyZ') {
      e.preventDefault();
      store.undo();
    } else if (e.ctrlKey && (e.code === 'KeyY' || (e.shiftKey && e.code === 'KeyZ'))) {
      e.preventDefault();
      store.redo();
    } else if (e.ctrlKey && e.code === 'KeyD') {
      e.preventDefault();
      store.duplicateClip();
      showToast('Clipe duplicado', 'success');
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      store.setCurrentTime(store.getState().currentTime - 0.1);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      store.setCurrentTime(store.getState().currentTime + 0.1);
    }
  });

  // Register PWA Service Worker
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  }

  showToast('Bem-vindo ao MVcut Pro! Todas as ferramentas Pro desbloqueadas.', 'pro');
});
