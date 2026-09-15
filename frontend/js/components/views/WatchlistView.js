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
    // 3. Normal State
    const tasteDna = state.tasteDna || [];
    const ratingDna = state.ratingDna || null;

    let dnaSectionHtml = '';
    if (tasteDna.length > 0) {
      const topGenre = tasteDna[0];
      const top4Genres = tasteDna.slice(0, 4);
      const remainingGenresCount = tasteDna.length > 4 ? tasteDna.length - 4 : 0;

      let personalityTitle = "Cinephile";
      let personalityDesc = "You enjoy exploring a variety of cinematic experiences.";

      if (ratingDna) {
        if (ratingDna.average_rating >= 8.0) {
          personalityTitle = "Critically Acclaimed " + topGenre.genre + " Fan";
          personalityDesc = "You have a highly refined taste, favoring top-tier " + topGenre.genre + " masterpieces.";
        } else if (topGenre.percentage > 40) {
          personalityTitle = "Die-Hard " + topGenre.genre + " Enthusiast";
          personalityDesc = "Your watchlist is heavily dominated by " + topGenre.genre + ". You know exactly what you like!";
        } else {
          personalityTitle = "Eclectic " + topGenre.genre + " Explorer";
          personalityDesc = "While " + topGenre.genre + " is your favorite, your tastes span a healthy mix of genres and ratings.";
        }
      } else {
        personalityTitle = topGenre.genre + " Aficionado";
        personalityDesc = "You lean strongly towards " + topGenre.genre + " cinematic experiences.";
      }

      dnaSectionHtml = `
      <!-- Outer wrapper with radial glow -->
      <div class="relative w-full rounded-[2rem] p-[1px] overflow-hidden group">
        <!-- Glowing border effect -->
        <div class="absolute inset-0 bg-gradient-to-br from-red-600/30 via-black/0 to-[#E50914]/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <!-- Main card background -->
        <div class="relative bg-[#0F1015]/90 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 border border-white/5 shadow-2xl">
            <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h3 class="font-cinematic text-xs font-black text-[#E50914] tracking-[0.2em] uppercase mb-1 drop-shadow-[0_0_8px_rgba(229,9,20,0.5)]">
                Your Cinematic DNA
              </h3>
              <p class="text-white/60 text-sm font-medium">A personalized breakdown of your unique movie taste.</p>
            </div>
            ${ratingDna ? `
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span class="w-2 h-2 rounded-full bg-[#E50914] animate-pulse"></span>
                <span class="text-xs font-bold text-white tracking-wide uppercase">${ratingDna.category}</span>
              </div>
            ` : ''}
          </div>

          <!-- Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              <!-- Left Column: Metrics & Personality (7 cols) -->
            <div class="lg:col-span-7 flex flex-col gap-6">
                <!-- Top Metrics Row -->
              <div class="grid grid-cols-2 gap-4">
                <!-- Top Genre Card -->
                <div class="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-5 border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-colors">
                  <div class="absolute -right-4 -top-4 opacity-5 text-white transform group-hover:scale-110 transition-transform duration-700">
                    <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <span class="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">#1 Favorite Genre</span>
                  <div class="text-2xl sm:text-3xl font-black text-white font-cinematic truncate relative z-10">${topGenre.genre}</div>
                  <div class="text-sm font-semibold text-[#E50914] mt-1 relative z-10">${topGenre.percentage}% of watchlist</div>
                </div>

                <!-- Average Rating Card -->
                ${ratingDna ? `
                  <div class="bg-gradient-to-bl from-white/5 to-transparent rounded-2xl p-5 border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-colors flex flex-col justify-between">
                    <span class="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">Avg Rating</span>
                    <div class="flex items-baseline gap-1 mt-auto">
                      <span class="text-4xl sm:text-5xl font-black text-white font-cinematic tracking-tighter">${Number(ratingDna.average_rating).toFixed(1)}</span>
                      <span class="text-sm font-bold text-white/40">/10</span>
                    </div>
                  </div>
                ` : `
                  <div class="bg-gradient-to-bl from-white/5 to-transparent rounded-2xl p-5 border border-white/5 relative overflow-hidden flex flex-col justify-center items-center text-center">
                    <span class="text-xs text-white/40 font-semibold">Need more ratings</span>
                  </div>
                `}
              </div>

              <!-- Personality Section -->
              <div class="bg-white/[0.02] rounded-2xl p-5 sm:p-6 border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E50914] to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.4)]">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <h4 class="text-xs font-bold text-white/60 uppercase tracking-wider">Your Cinematic Personality</h4>
                </div>
                <div class="text-lg sm:text-xl font-cinematic font-bold text-white/90 mb-2">${personalityTitle}</div>
                <p class="text-sm text-white/50 leading-relaxed">${personalityDesc}</p>
              </div>

            </div>

            <!-- Right Column: Genre Breakdown (5 cols) -->
            <div class="lg:col-span-5 bg-black/20 rounded-2xl p-5 sm:p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden">
              <h4 class="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 border-b border-white/5 pb-3">Genre Composition</h4>
              <div class="space-y-4 sm:space-y-5">
                ${top4Genres.map((item) => `
                  <div class="group/bar">
                    <div class="flex justify-between items-end mb-1.5">
                      <span class="text-sm font-bold text-white/80 group-hover/bar:text-white transition-colors">${item.genre}</span>
                      <span class="text-xs font-mono font-medium text-[#E50914]">${item.percentage}%</span>
                    </div>
                    <div class="w-full bg-white/5 h-1.5 sm:h-2 rounded-full overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-red-900 to-[#E50914] origin-left" style="width: \${item.percentage}%; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                    </div>
                  </div>
                `).join('')}
              </div>

              ${remainingGenresCount > 0 ? `
                <div class="mt-6 pt-4 border-t border-white/5 text-center">
                  <span class="text-xs font-semibold text-white/30 hover:text-white/60 transition-colors cursor-default">
                    + ${remainingGenresCount} more preference${remainingGenresCount > 1 ? 's' : ''}
                  </span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
      `;
    } else {
      dnaSectionHtml = `
      <div class="bg-[#14151C] border border-[#21232E] rounded-[2rem] p-6 sm:p-12 shadow-xl">
        <div class="text-center flex flex-col items-center justify-center">
          <div class="w-16 h-16 rounded-2xl bg-[#1C1D26] border border-[#2B2D3C] flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-white/30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
          </div>
          <h4 class="text-xl font-bold text-white mb-2 font-cinematic">Cinematic DNA Unlocked Soon</h4>
          <p class="text-sm text-[#8E92A0] max-w-sm mx-auto leading-relaxed">Add more movies to your watchlist to generate your personalized cinematic profile and discover your unique taste.</p>
        </div>
      </div>
      `;
    }

    this.container.innerHTML = `
      <div class="space-y-6 pb-20">
        
        <!-- Header -->
        <div class="flex items-center justify-between pt-1">
          <div>
            <h1 class="font-cinematic text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              My Watchlist
            </h1>
            <p class="text-xs sm:text-sm text-[#8E92A0] mt-1">
              ${watchlist.length > 0
        ? `You have ${watchlist.length} ${watchlist.length === 1 ? 'title' : 'titles'} saved to watch.`
        : 'Your personal movie watchlist.'
      }
            </p>
          </div>

          ${watchlist.length > 0
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

        <!-- Taste DNA Section -->
        ${dnaSectionHtml}

        <!-- Watchlist Content (Movies Grid OR Empty State) -->
        ${watchlist.length > 0
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
