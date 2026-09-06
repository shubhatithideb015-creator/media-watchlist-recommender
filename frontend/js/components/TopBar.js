// js/components/TopBar.js
// Desktop Top Header Bar (Iteration 1: Persistent Input Focus)

import { store } from '../state/store.js';

export class TopBar {
  constructor(container) {
    this.container = container;
    this.isMounted = false;
  }

  render() {
    const state = store.getState();

    // If shell is not mounted, render once
    if (!this.isMounted || !this.container.querySelector('#topbar-search-input')) {
      this.container.innerHTML = `
        <header class="h-20 px-8 flex items-center justify-between border-b border-[#1A1C24] bg-[#0B0B0E]/80 backdrop-blur-md sticky top-0 z-20">
          
          <!-- Search Input -->
          <div class="relative w-full max-w-xl">
            <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#717684]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input 
              type="text" 
              id="topbar-search-input"
              value="${state.searchQuery || ''}"
              placeholder="Search movies and TV shows..." 
              autocomplete="off"
              spellcheck="false"
              class="w-full pl-11 pr-10 py-2.5 bg-[#16171E] hover:bg-[#1A1C24] focus:bg-[#1D1F2B] border border-[#232530] focus:border-[#E50914] text-sm text-white placeholder-[#717684] rounded-xl outline-none transition-all"
            />
            <button 
              id="topbar-search-clear" 
              class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#717684] hover:text-white ${state.searchQuery ? '' : 'hidden'}" 
              title="Clear"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Right Quick Navigation Links -->
          <div class="flex items-center gap-3 ml-6">
            <button 
              id="topbar-watchlist-link" 
              class="px-4 py-2 rounded-xl bg-[#16171E] hover:bg-[#20222C] border border-[#232530] text-xs font-semibold text-white transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4 text-[#E50914]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
              <span id="topbar-watchlist-count-text">Watchlist (${state.watchlist.length})</span>
            </button>
          </div>

        </header>
      `;

      this.attachEvents();
      this.isMounted = true;
    } else {
      // Update only dynamic pieces without destroying the input!
      const countText = this.container.querySelector('#topbar-watchlist-count-text');
      if (countText) countText.textContent = `Watchlist (${state.watchlist.length})`;

      const clearBtn = this.container.querySelector('#topbar-search-clear');
      if (clearBtn) {
        if (state.searchQuery) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
      }
    }
  }

  attachEvents() {
    const input = this.container.querySelector('#topbar-search-input');
    const clearBtn = this.container.querySelector('#topbar-search-clear');

    if (input) {
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        store.state.searchQuery = val;

        if (clearBtn) {
          if (val) clearBtn.classList.remove('hidden');
          else clearBtn.classList.add('hidden');
        }

        if (val.trim() && store.getState().currentView !== 'discover') {
          store.setView('discover');
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          store.setView('discover');
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        store.setSearchQuery('');
        if (input) {
          input.value = '';
          input.focus();
        }
        clearBtn.classList.add('hidden');
      });
    }

    const watchlistLink = this.container.querySelector('#topbar-watchlist-link');
    if (watchlistLink) {
      watchlistLink.addEventListener('click', () => {
        store.setView('watchlist');
      });
    }
  }
}
