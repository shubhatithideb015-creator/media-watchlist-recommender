// js/components/Sidebar.js
// Simplified Desktop Navigation Sidebar (Iteration 1)

import { store } from '../state/store.js';

export class Sidebar {
  constructor(container) {
    this.container = container;
  }

  render() {
    const state = store.getState();
    const currentView = state.currentView;
    const watchlistCount = state.watchlist.length;

    this.container.innerHTML = `
      <aside class="w-64 bg-[#0E0F14] border-r border-[#1F212A] flex flex-col h-screen sticky top-0 z-30 select-none">
        
        <!-- App Branding -->
        <div class="p-6 pb-6 flex items-center justify-between">
          <div class="flex items-center gap-2.5 cursor-pointer" id="sidebar-logo">
            <div class="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center shadow-[0_0_14px_rgba(229,9,20,0.5)]">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 4H4.5C3.12 4 2 5.12 2 6.5v11C2 18.88 3.12 20 4.5 20h15c1.38 0 2.5-1.12 2.5-2.5v-11C22 5.12 20.88 4 19.5 4zM5.5 6h2l1.5 3h-2L5.5 6zm5 0h2l1.5 3h-2L10.5 6zm5 0h2l1.5 3h-2L15.5 6zM20 17.5c0 .28-.22.5-.5.5h-15c-.28 0-.5-.22-.5-.5V11h16v6.5z"/>
              </svg>
            </div>
            <span class="font-cinematic text-2xl font-black tracking-tight text-white flex items-center">
              Cinema<span class="text-[#E50914]">Match</span>
            </span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-3 space-y-1.5 overflow-y-auto">
          <!-- Home -->
          <button 
            data-view="home"
            class="nav-btn w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${currentView === 'home' ? 'nav-item-active text-white' : 'text-[#8E92A0] hover:text-white hover:bg-white/5'}"
          >
            <svg class="w-5 h-5 ${currentView === 'home' ? 'text-[#E50914]' : 'text-current'}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span>Home</span>
          </button>

          <!-- Discover / Search -->
          <button 
            data-view="discover"
            class="nav-btn w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${currentView === 'discover' ? 'nav-item-active text-white' : 'text-[#8E92A0] hover:text-white hover:bg-white/5'}"
          >
            <svg class="w-5 h-5 ${currentView === 'discover' ? 'text-[#E50914]' : 'text-current'}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            <span>Discover</span>
          </button>

          <!-- Watchlist -->
          <button 
            data-view="watchlist"
            class="nav-btn w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${currentView === 'watchlist' ? 'nav-item-active text-white' : 'text-[#8E92A0] hover:text-white hover:bg-white/5'}"
          >
            <div class="flex items-center gap-3.5">
              <svg class="w-5 h-5 ${currentView === 'watchlist' ? 'text-[#E50914]' : 'text-current'}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
              <span>Watchlist</span>
            </div>
            ${watchlistCount > 0 ? `
              <span class="px-2 py-0.5 text-xs font-bold rounded-full bg-[#E50914] text-white">${watchlistCount}</span>
            ` : ''}
          </button>
        </nav>

        <!-- Footer Tag -->
        <div class="p-4 border-t border-[#1F212A] text-center">
          <p class="text-[11px] text-[#555869]">CinemaMatch v1.0</p>
        </div>
      </aside>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.container.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view) store.setView(view);
      });
    });

    const logo = this.container.querySelector('#sidebar-logo');
    if (logo) {
      logo.addEventListener('click', () => store.setView('home'));
    }
  }
}
