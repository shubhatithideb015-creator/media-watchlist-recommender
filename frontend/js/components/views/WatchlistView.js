// js/components/views/WatchlistView.js
// Watchlist Page for CinemaMatch
// Connects to GET /api/watchlist and DELETE /api/watchlist/<id> via Flask backend and SQLite

import { store } from '../../state/store.js';
import { MediaCard } from '../MediaCard.js';

export class WatchlistView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const state = store.getState();
    const watchlist = state.watchlist || [];
    const isLoading = state.isLoadingWatchlist;
    const error = state.watchlistError;

    // 1. Loading State
    if (isLoading && watchlist.length === 0) {
      this.container.innerHTML = `
        <div class="space-y-6 pb-20 animate-pulse">
          <div class="h-10 bg-[#1A1C24] rounded-lg w-48 pt-1"></div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            ${Array(5)
              .fill(0)
              .map(
                () => `
              <div class="bg-[#14151C] border border-[#21232E] rounded-2xl overflow-hidden">
                <div class="aspect-[2/3] bg-[#1E202B] w-full"></div>
                <div class="p-3 space-y-2">
                  <div class="h-3 bg-[#242634] rounded w-1/3"></div>
                  <div class="h-4 bg-[#242634] rounded w-3/4"></div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
      return;
    }

    // 2. Error State
    if (error && watchlist.length === 0) {
      this.container.innerHTML = `
        <div class="text-center py-20 bg-[#121319] border border-red-900/40 rounded-3xl p-8 max-w-lg mx-auto my-6 shadow-xl">
          <div class="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/40 text-[#E50914] flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 class="font-cinematic text-xl font-bold text-white mb-2">Watchlist Connection Error</h2>
          <p class="text-xs text-[#8E92A0] mb-6 leading-relaxed">
            ${error}. Please ensure the backend is running.
          </p>
          <button id="watchlist-retry-btn" class="btn-red-glow px-6 py-2.5 rounded-xl text-xs font-bold">
            Retry Connection
          </button>
        </div>
      `;
      const retryBtn = this.container.querySelector('#watchlist-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => store.loadWatchlist());
      }
      return;
    }

    // 3. Normal State
    this.container.innerHTML = `
      <div class="space-y-6 pb-20">
        
        <!-- Header -->
        <div class="flex items-center justify-between pt-1">
          <div>
            <h1 class="font-cinematic text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              My Watchlist
            </h1>
            <p class="text-xs sm:text-sm text-[#8E92A0] mt-1">
              ${
                watchlist.length > 0
                  ? `You have ${watchlist.length} ${watchlist.length === 1 ? 'title' : 'titles'} saved to watch.`
                  : 'Your personal movie watchlist.'
              }
            </p>
          </div>

          ${
            watchlist.length > 0
              ? `
            <button 
              id="watchlist-clear-all"
              class="px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-semibold transition-colors"
            >
              Clear Watchlist
            </button>
          `
              : ''
          }
        </div>

        <!-- Watchlist Content (Movies Grid OR Empty State) -->
        ${
          watchlist.length > 0
            ? `
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4" id="watchlist-grid">
            ${watchlist.map((media) => MediaCard.render(media, { showRemoveBtn: true })).join('')}
          </div>
        `
            : `
          <!-- Empty Watchlist State -->
          <div class="text-center py-20 bg-[#121319] border border-[#20222D] rounded-3xl p-8 max-w-lg mx-auto my-6 shadow-xl">
            
            <div class="w-16 h-16 rounded-2xl bg-[#1C1D26] border border-[#2B2D3C] text-[#8E92A0] flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-[#E50914]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </div>

            <h2 class="font-cinematic text-xl sm:text-2xl font-bold text-white mb-2">
              Your Watchlist is Empty
            </h2>
            
            <p class="text-xs sm:text-sm text-[#8E92A0] max-w-sm mx-auto mb-6 leading-relaxed">
              Explore movies and TV shows to add them to your watchlist.
            </p>

            <button 
              id="watchlist-go-discover"
              class="btn-red-glow px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 mx-auto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Explore Movies</span>
            </button>

          </div>
        `
        }

      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    MediaCard.bindEvents(this.container);

    const goDiscoverBtn = this.container.querySelector('#watchlist-go-discover');
    if (goDiscoverBtn) {
      goDiscoverBtn.addEventListener('click', () => {
        store.setView('discover');
      });
    }

    const clearAllBtn = this.container.querySelector('#watchlist-clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', async () => {
        const list = [...(store.getState().watchlist || [])];
        clearAllBtn.disabled = true;
        try {
          for (const m of list) {
            await store.removeFromWatchlist(m.id);
          }
        } finally {
          clearAllBtn.disabled = false;
        }
      });
    }
  }
}
