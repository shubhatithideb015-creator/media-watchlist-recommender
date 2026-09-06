// js/components/TopBar.js
// Desktop Top Header Bar (Search removed from navbar)

import { store } from '../state/store.js';

export class TopBar {
  constructor(container) {
    this.container = container;
  }

  getViewTitle(view) {
    switch (view) {
      case 'home':
        return 'Home & Curated';
      case 'discover':
        return 'Discover & Search';
      case 'watchlist':
        return 'My Watchlist';
      default:
        return 'CinemaMatch';
    }
  }

  render() {
    const state = store.getState();
    const viewTitle = this.getViewTitle(state.currentView);
    const watchlistCount = state.watchlist ? state.watchlist.length : 0;

    this.container.innerHTML = `
      <header class="h-16 px-8 flex items-center justify-between border-b border-[#1A1C24] bg-[#0B0B0E]/80 backdrop-blur-md sticky top-0 z-20">
        
        <!-- Left: Current Section / Breadcrumb Indicator -->
        <div class="flex items-center gap-3">
          <span class="w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.8)]"></span>
          <h2 class="text-sm font-semibold tracking-wide text-[#8E92A0] uppercase">
            ${viewTitle}
          </h2>
        </div>

        <!-- Right Quick Navigation Links -->
        <div class="flex items-center gap-3">
          <button 
            id="topbar-watchlist-link" 
            class="px-4 py-2 rounded-xl bg-[#16171E] hover:bg-[#20222C] border border-[#232530] text-xs font-semibold text-white transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4 text-[#E50914]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
            <span id="topbar-watchlist-count-text">Watchlist (${watchlistCount})</span>
          </button>
        </div>

      </header>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const watchlistLink = this.container.querySelector('#topbar-watchlist-link');
    if (watchlistLink) {
      watchlistLink.addEventListener('click', () => {
        store.setView('watchlist');
      });
    }
  }
}

