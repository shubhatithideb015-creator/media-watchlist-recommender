// js/components/views/HomeView.js
// Home View for CinemaMatch
// Displays Hero Banner and 5 Curated Titles from backend GET /api/media

import { store } from '../../state/store.js';
import { MediaCard } from '../MediaCard.js';
import { FALLBACK_POSTER } from '../../services/api.js';

export class HomeView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const state = store.getState();
    const curatedMedia = state.curatedMedia || [];
    const isLoading = state.isLoadingCurated;
    const error = state.curatedError;

    // 1. Loading State
    if (isLoading && curatedMedia.length === 0) {
      this.container.innerHTML = `
        <div class="space-y-8 pb-16 animate-pulse">
          <!-- Hero Skeleton -->
          <div class="rounded-3xl bg-[#14151C] border border-[#21232E] min-h-[380px] sm:min-h-[440px] p-6 sm:p-10 flex flex-col justify-end">
            <div class="max-w-xl space-y-3">
              <div class="h-6 bg-[#20222D] rounded-md w-28"></div>
              <div class="h-10 bg-[#20222D] rounded-lg w-3/4"></div>
              <div class="h-14 bg-[#20222D] rounded-lg w-full"></div>
              <div class="flex gap-3 pt-2">
                <div class="h-11 bg-[#20222D] rounded-xl w-32"></div>
                <div class="h-11 bg-[#20222D] rounded-xl w-36"></div>
              </div>
            </div>
          </div>

          <!-- Featured Titles Skeleton -->
          <div>
            <div class="h-7 bg-[#1A1C24] rounded-md w-40 mb-4"></div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              ${Array(5).fill(0).map(() => `
                <div class="bg-[#14151C] border border-[#21232E] rounded-2xl overflow-hidden">
                  <div class="aspect-[2/3] bg-[#1E202B] w-full"></div>
                  <div class="p-3 space-y-2">
                    <div class="h-3 bg-[#242634] rounded w-1/3"></div>
                    <div class="h-4 bg-[#242634] rounded w-3/4"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      return;
    }

    // 2. Error State (Backend down / unavailable)
    if (error && curatedMedia.length === 0) {
      this.container.innerHTML = `
        <div class="py-20 text-center max-w-lg mx-auto">
          <div class="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/40 text-[#E50914] flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 class="font-cinematic text-xl font-bold text-white mb-2">Backend Connection Error</h2>
          <p class="text-xs text-[#8E92A0] mb-6 leading-relaxed">
            ${error}. Please ensure the Flask backend server is running on port 5000.
          </p>
          <button id="home-retry-btn" class="btn-red-glow px-6 py-2.5 rounded-xl text-xs font-bold">
            Retry Connection
          </button>
        </div>
      `;
      const retryBtn = this.container.querySelector('#home-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => store.loadCuratedMedia());
      }
      return;
    }

    // 3. Normal State with Live Backend Data
    const hero = curatedMedia[0] || {
      id: '',
      title: 'No Movies Available',
      description: '',
      poster_url: FALLBACK_POSTER,
      backdrop_url: null,
      rating: null,
      release_year: null,
      genre: 'Cinema',
    };

    const isHeroInWatchlist = hero.id ? store.isInWatchlist(hero.id) : false;

    // Handle null backdrop gracefully by falling back to poster_url
    const heroBackdrop =
      hero.backdrop_url && hero.backdrop_url !== 'N/A' && hero.backdrop_url.startsWith('http')
        ? hero.backdrop_url
        : hero.poster_url && hero.poster_url !== 'N/A' && hero.poster_url.startsWith('http')
        ? hero.poster_url
        : FALLBACK_POSTER;

    const heroGenre =
      hero.genre ||
      (Array.isArray(hero.genres) && hero.genres.length > 0 ? hero.genres[0] : 'Featured');

    this.container.innerHTML = `
      <div class="space-y-8 sm:space-y-10 pb-16">
        
        <!-- Mobile Search Header -->
        <div class="block lg:hidden pt-1">
          <h1 class="font-cinematic text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to CinemaMatch
          </h1>
          
          <div class="relative mt-3">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#717684]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input 
              type="text" 
              id="home-mobile-search-input"
              placeholder="Search movies and TV shows..." 
              class="w-full pl-10 pr-4 py-3 bg-[#15161D] border border-[#232530] focus:border-[#E50914] text-sm text-white placeholder-[#717684] rounded-2xl outline-none transition-all"
            />
          </div>
        </div>

        <!-- HERO SPOTLIGHT BANNER -->
        <div class="relative rounded-3xl overflow-hidden border border-[#21232F] bg-[#121319] group min-h-[380px] sm:min-h-[440px] flex flex-col justify-end p-6 sm:p-10 shadow-2xl">
          
          <!-- Background Poster Artwork -->
          <img 
            src="${heroBackdrop}" 
            alt="${hero.title}" 
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
            onerror="this.onerror=null;this.src='${FALLBACK_POSTER}'"
          />
          
          <!-- Dark Gradients -->
          <div class="absolute inset-0 bg-gradient-to-t from-[#0B0B0E] via-[#0B0B0E]/60 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-[#0B0B0E]/90 via-[#0B0B0E]/40 to-transparent"></div>

          <!-- Content -->
          <div class="relative z-10 max-w-xl">
            
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span class="px-2.5 py-1 rounded-md bg-[#E50914] text-xs font-bold text-white">
                Featured
              </span>
              <span class="px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold text-white backdrop-blur-md">
                ${heroGenre}
              </span>
              ${
                hero.release_year
                  ? `
                <span class="px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold text-white backdrop-blur-md">
                  ${hero.release_year}
                </span>
              `
                  : ''
              }
              ${
                hero.rating
                  ? `
                <span class="px-2.5 py-1 rounded-md bg-black/40 text-amber-400 text-xs font-bold backdrop-blur-md border border-amber-400/20">
                  ★ ${hero.rating}
                </span>
              `
                  : ''
              }
            </div>

            <h2 class="font-cinematic text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-2">
              ${hero.title}
            </h2>

            <p class="text-xs sm:text-sm text-[#D1D5DB] line-clamp-2 sm:line-clamp-3 mb-6 leading-relaxed">
              ${hero.description || hero.synopsis || ''}
            </p>

            <div class="flex flex-wrap items-center gap-3">
              <button 
                id="hero-details-btn"
                data-id="${hero.id}"
                class="btn-red-glow flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              >
                <span>View Details</span>
              </button>

              <button 
                id="hero-watchlist-btn"
                data-id="${hero.id}"
                class="btn-glass flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm"
              >
                <svg class="w-4 h-4" fill="${isHeroInWatchlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
                <span>${isHeroInWatchlist ? 'In Watchlist' : '+ Add to Watchlist'}</span>
              </button>
            </div>

          </div>
        </div>

        <!-- FEATURED MOVIES SECTION (5 movies from GET /api/media) -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-cinematic text-lg sm:text-2xl font-bold text-white tracking-tight">
              Featured Titles
            </h3>
            <button id="home-explore-all" class="text-xs font-semibold text-[#8E92A0] hover:text-white flex items-center gap-1 transition-colors">
              <span>Search & Discover</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4" id="home-featured-grid">
            ${curatedMedia.map((media) => MediaCard.render(media)).join('')}
          </div>
        </div>

      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    MediaCard.bindEvents(this.container);

    const detailsBtn = this.container.querySelector('#hero-details-btn');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', () => {
        const id = detailsBtn.dataset.id;
        if (id) store.openMediaDetail(id);
      });
    }

    const watchlistBtn = this.container.querySelector('#hero-watchlist-btn');
    if (watchlistBtn) {
      watchlistBtn.addEventListener('click', async () => {
        const id = watchlistBtn.dataset.id;
        if (id) {
          watchlistBtn.disabled = true;
          try {
            await store.toggleWatchlist(id);
            this.render();
          } finally {
            watchlistBtn.disabled = false;
          }
        }
      });
    }

    const exploreAllBtn = this.container.querySelector('#home-explore-all');
    if (exploreAllBtn) {
      exploreAllBtn.addEventListener('click', () => store.setView('discover'));
    }

    const mobileSearch = this.container.querySelector('#home-mobile-search-input');
    if (mobileSearch) {
      mobileSearch.addEventListener('input', (e) => {
        const val = e.target.value;
        store.setSearchQuery(val);
        if (val.trim()) {
          store.setView('discover');
        }
      });
    }
  }
}
