// js/components/MobileHeader.js
// Mobile Top Header (Search removed from header)

import { store } from '../state/store.js';

export class MobileHeader {
  constructor(container) {
    this.container = container;
  }

  render() {
    const state = store.getState();
    const watchlistCount = state.watchlist ? state.watchlist.length : 0;

    this.container.innerHTML = `
      <header class="lg:hidden h-14 px-4 flex items-center justify-between border-b border-[#1A1C24] bg-[#0B0B0E]/95 backdrop-blur-lg sticky top-0 z-30">
        
        <!-- Logo -->
        <div class="flex items-center gap-2 cursor-pointer" id="mobile-logo">
          <div class="w-7 h-7 rounded-md bg-[#E50914] flex items-center justify-center shadow-[0_0_10px_rgba(229,9,20,0.5)]">
            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 4H4.5C3.12 4 2 5.12 2 6.5v11C2 18.88 3.12 20 4.5 20h15c1.38 0 2.5-1.12 2.5-2.5v-11C22 5.12 20.88 4 19.5 4zM5.5 6h2l1.5 3h-2L5.5 6zm5 0h2l1.5 3h-2L10.5 6zm5 0h2l1.5 3h-2L15.5 6zM20 17.5c0 .28-.22.5-.5.5h-15c-.28 0-.5-.22-.5-.5V11h16v6.5z"/>
            </svg>
          </div>
          <span class="font-cinematic text-lg font-black tracking-tight text-white flex items-center">
            Cinema<span class="text-[#E50914]">Match</span>
          </span>
        </div>

        <!-- Right Quick Actions -->
        <div class="flex items-center gap-2">
          <button 
            id="mobile-watchlist-btn"
            class="px-2.5 py-1 rounded-lg bg-[#16171E] border border-[#232530] text-xs font-semibold text-white flex items-center gap-1.5"
            title="Watchlist"
          >
            <svg class="w-3.5 h-3.5 text-[#E50914]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
            <span>${watchlistCount}</span>
          </button>
        </div>
      </header>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const logo = this.container.querySelector('#mobile-logo');
    if (logo) {
      logo.addEventListener('click', () => store.setView('home'));
    }

    const watchlistBtn = this.container.querySelector('#mobile-watchlist-btn');
    if (watchlistBtn) {
      watchlistBtn.addEventListener('click', () => store.setView('watchlist'));
    }
  }
}

