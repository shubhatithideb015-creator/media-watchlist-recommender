// js/components/BottomNav.js
// Mobile Bottom Navigation Bar (Iteration 1: Home, Discover, Watchlist)

import { store } from '../state/store.js';

export class BottomNav {
  constructor(container) {
    this.container = container;
  }

  render() {
    const state = store.getState();
    const currentView = state.currentView;
    const watchlistCount = state.watchlist.length;

    this.container.innerHTML = `
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0E0F14]/95 backdrop-blur-xl border-t border-[#1C1E26] z-40 px-6 flex items-center justify-around select-none">
        
        <!-- Home -->
        <button 
          data-view="home"
          class="mobile-nav-btn flex flex-col items-center justify-center flex-1 py-1 transition-all ${currentView === 'home' ? 'text-[#E50914]' : 'text-[#8E92A0] hover:text-white'}"
        >
          <svg class="w-5 h-5 mb-1 ${currentView === 'home' ? 'text-[#E50914]' : 'text-current'}" fill="${currentView === 'home' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="text-xs font-medium tracking-tight">Home</span>
        </button>

        <!-- Discover -->
        <button 
          data-view="discover"
          class="mobile-nav-btn flex flex-col items-center justify-center flex-1 py-1 transition-all ${currentView === 'discover' ? 'text-[#E50914]' : 'text-[#8E92A0] hover:text-white'}"
        >
          <div class="${currentView === 'discover' ? 'w-8 h-8 rounded-full bg-[#E50914]/20 flex items-center justify-center -my-1.5' : ''}">
            <svg class="w-5 h-5 ${currentView === 'discover' ? 'text-[#E50914]' : 'text-current'}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
          </div>
          <span class="text-xs font-medium tracking-tight mt-0.5">Discover</span>
        </button>

        <!-- Watchlist -->
        <button 
          data-view="watchlist"
          class="mobile-nav-btn flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${currentView === 'watchlist' ? 'text-[#E50914]' : 'text-[#8E92A0] hover:text-white'}"
        >
          <div class="relative">
            <svg class="w-5 h-5 mb-1 ${currentView === 'watchlist' ? 'text-[#E50914]' : 'text-current'}" fill="${currentView === 'watchlist' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
            ${watchlistCount > 0 ? `
              <span class="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#E50914] text-[9px] font-bold text-white flex items-center justify-center">${watchlistCount}</span>
            ` : ''}
          </div>
          <span class="text-xs font-medium tracking-tight">Watchlist</span>
        </button>

      </nav>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.container.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view) store.setView(view);
      });
    });
  }
}
