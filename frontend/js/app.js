// js/app.js
// CinemaMatch Application Bootstrap
// Connected to Flask Backend (Media Catalog, Search, Watchlist)

import { store } from './state/store.js';
import { Sidebar } from './components/Sidebar.js';
import { TopBar } from './components/TopBar.js';
import { MobileHeader } from './components/MobileHeader.js';
import { BottomNav } from './components/BottomNav.js';
import { MediaModal } from './components/MediaModal.js';
import { Toast } from './components/Toast.js';

import { HomeView } from './components/views/HomeView.js';
import { DiscoverView } from './components/views/DiscoverView.js';
import { WatchlistView } from './components/views/WatchlistView.js';

class CinemaMatchApp {
  constructor() {
    this.sidebarContainer = document.getElementById('sidebar-container');
    this.topbarContainer = document.getElementById('topbar-container');
    this.mobileHeaderContainer = document.getElementById('mobile-header-container');
    this.bottomNavContainer = document.getElementById('bottom-nav-container');
    this.mainViewContainer = document.getElementById('main-view-container');
    this.modalContainer = document.getElementById('modal-container');
    this.toastContainer = document.getElementById('toast-container');

    // Navigation & Persistent Components
    this.sidebar = new Sidebar(this.sidebarContainer);
    this.topbar = new TopBar(this.topbarContainer);
    this.mobileHeader = new MobileHeader(this.mobileHeaderContainer);
    this.bottomNav = new BottomNav(this.bottomNavContainer);
    this.mediaModal = new MediaModal(this.modalContainer);
    this.toast = new Toast(this.toastContainer);

    // Views
    this.views = {
      home: new HomeView(this.mainViewContainer),
      discover: new DiscoverView(this.mainViewContainer),
      watchlist: new WatchlistView(this.mainViewContainer),
    };

    this.activeViewName = null;
  }

  async init() {
    // Initial UI render (shows skeletons while backend data loads)
    this.render(true);

    // Subscribe to state updates
    store.subscribe(() => {
      this.render(false);
    });

    // Global keyboard shortcut ('/' focuses search without character loss)
    window.addEventListener('keydown', (e) => {
      if (
        e.key === '/' &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        const searchInput =
          document.querySelector('#discover-search-input') ||
          document.querySelector('#topbar-search-input');
        if (searchInput) {
          searchInput.focus();
        } else {
          store.setView('discover');
          setTimeout(() => {
            const input = document.querySelector('#discover-search-input');
            if (input) input.focus();
          }, 50);
        }
      }
    });

    // Concurrently fetch curated media (GET /api/media) and saved watchlist (GET /api/watchlist)
    try {
      await Promise.allSettled([
        store.loadCuratedMedia(),
        store.loadWatchlist(),
      ]);
    } catch (err) {
      console.warn('Backend initialization warning:', err);
    }

    console.log('🎬 CinemaMatch connected to Flask backend successfully.');
  }

  render(isInitial = false) {
    const state = store.getState();

    // Render persistent headers & navigation
    this.sidebar.render();
    this.topbar.render();
    this.mobileHeader.render();
    this.bottomNav.render();

    // Render Modal & Toast
    this.mediaModal.render();
    this.toast.render();

    // If active view changed or is initial, mount target view
    if (this.activeViewName !== state.currentView || isInitial) {
      if (this.activeViewName && this.views[this.activeViewName]?.unmount) {
        this.views[this.activeViewName].unmount();
      }
      this.activeViewName = state.currentView;
      const targetView = this.views[state.currentView] || this.views.home;
      targetView.render();
    } else {
      // Same view: update dynamic view content
      if (state.currentView === 'watchlist') {
        this.views.watchlist.render();
      } else if (state.currentView === 'home') {
        this.views.home.render();
      }
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const app = new CinemaMatchApp();
  app.init();
});
