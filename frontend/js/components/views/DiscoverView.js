// js/components/views/DiscoverView.js
// Discover and Live OMDb Search View
// Connects to GET /api/search?q=<query> via Flask backend

import { store } from '../../state/store.js';
import { apiService } from '../../services/api.js';
import { MediaCard } from '../MediaCard.js';

export class DiscoverView {
  constructor(container) {
    this.container = container;
    this.isLoading = false;
    this.error = null;
    this.debounceTimer = null;
    this.lastSearchResults = [];
    this.isMounted = false;
  }

  render() {
    const state = store.getState();
    const activeFilter = state.activeFilter; // 'all' | 'movies' | 'tv'
    const activeGenre = state.activeGenre; // 'All' | 'Sci-Fi' | ...
    const searchQuery = state.searchQuery || '';

    // If shell is not mounted yet, render the full UI shell once
    if (!this.isMounted || !this.container.querySelector('#discover-search-input')) {
      this.renderShell(searchQuery, activeFilter, activeGenre);
      this.isMounted = true;
    } else {
      // Input exists: DO NOT recreate or replace the input! Keep focus intact.
      this.updatePillStates(activeFilter, activeGenre);
    }

    // Execute search or load curated explore titles
    this.executeSearch(searchQuery, activeFilter, activeGenre);
  }

  renderShell(searchQuery, activeFilter, activeGenre) {
    const mediaTypePills = [
      { id: 'all', label: 'All' },
      { id: 'movies', label: 'Movies' },
      { id: 'tv', label: 'TV Shows' },
    ];

    const genrePills = [
      'All',
      'Sci-Fi',
      'Action',
      'Thriller',
      'Drama',
      'Crime',
      'Adventure',
      'Comedy',
      'Horror',
    ];

    this.container.innerHTML = `
      <div class="space-y-6 pb-20">
        
        <!-- Search Input Bar (Persistent DOM Node) -->
        <div class="relative flex items-center gap-3">
          <div class="relative flex-1">
            <span id="discover-search-icon" class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#8E92A0]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input 
              type="text" 
              id="discover-search-input"
              value="${searchQuery}"
              placeholder="Search movies and TV shows via live backend..." 
              autocomplete="off"
              spellcheck="false"
              class="w-full pl-12 pr-12 py-3.5 bg-[#14151C] border border-[#232532] focus:border-[#E50914] text-sm text-white placeholder-[#717684] rounded-2xl outline-none shadow-sm transition-all"
            />
            <button 
              id="discover-clear-btn" 
              class="absolute inset-y-0 right-3 flex items-center text-[#717684] hover:text-white p-1 ${
                searchQuery ? '' : 'hidden'
              }" 
              title="Clear search"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Media Type Filters (All / Movies / TV Shows) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none" id="type-pills-bar">
          ${mediaTypePills
            .map((pill) => {
              const isActive = activeFilter === pill.id;
              return `
              <button 
                data-filter-type="${pill.id}"
                class="media-type-btn whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#E50914] text-white shadow-[0_2px_12px_rgba(229,9,20,0.45)]'
                    : 'bg-[#181922] text-[#A1A1AA] hover:text-white hover:bg-[#222430] border border-[#232532]'
                }"
              >
                ${pill.label}
              </button>
            `;
            })
            .join('')}
        </div>

        <!-- Genre Filters Bar -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none text-xs border-t border-[#1C1E26] pt-3" id="genre-pills-bar">
          <span class="text-[#717684] text-[11px] font-bold uppercase tracking-wider pl-1 pr-1 flex-shrink-0">Genre:</span>
          ${genrePills
            .map((genre) => {
              const isGenreActive = activeGenre.toLowerCase() === genre.toLowerCase();
              return `
              <button 
                data-genre-name="${genre}"
                class="genre-filter-btn whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isGenreActive
                    ? 'bg-red-950/80 border border-red-500 text-red-200 shadow-[0_0_10px_rgba(229,9,20,0.3)]'
                    : 'bg-[#14151C] text-[#8E92A0] hover:text-white hover:bg-[#1D1F2B] border border-[#232532]'
                }"
              >
                ${genre}
              </button>
            `;
            })
            .join('')}
        </div>

        <!-- Results Counter -->
        <div class="flex items-center justify-between text-xs text-[#8E92A0] px-1">
          <span id="results-filter-summary">
            ${
              searchQuery
                ? `Search results for <strong class="text-[#E50914]">"${searchQuery}"</strong>`
                : `Browse <strong class="text-white capitalize">${activeFilter}</strong>`
            }
            ${activeGenre !== 'All' ? ` • ${activeGenre}` : ''}
          </span>
          <span id="results-count-badge" class="font-medium">
            ${this.isLoading ? 'Searching...' : `${this.lastSearchResults.length} titles`}
          </span>
        </div>

        <!-- Dynamic Content Area -->
        <div id="discover-results-area">
          ${this.renderContentArea()}
        </div>

      </div>
    `;

    this.attachEvents();
  }

  updatePillStates(activeFilter, activeGenre) {
    this.container.querySelectorAll('.media-type-btn').forEach((btn) => {
      const isAct = btn.dataset.filterType === activeFilter;
      btn.className = `media-type-btn whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
        isAct
          ? 'bg-[#E50914] text-white shadow-[0_2px_12px_rgba(229,9,20,0.45)]'
          : 'bg-[#181922] text-[#A1A1AA] hover:text-white hover:bg-[#222430] border border-[#232532]'
      }`;
    });

    this.container.querySelectorAll('.genre-filter-btn').forEach((btn) => {
      const isGenreAct = btn.dataset.genreName.toLowerCase() === activeGenre.toLowerCase();
      btn.className = `genre-filter-btn whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        isGenreAct
          ? 'bg-red-950/80 border border-red-500 text-red-200 shadow-[0_0_10px_rgba(229,9,20,0.3)]'
          : 'bg-[#14151C] text-[#8E92A0] hover:text-white hover:bg-[#1D1F2B] border border-[#232532]'
      }`;
    });
  }

  renderContentArea() {
    // 1. Loading State (Skeletons)
    if (this.isLoading) {
      return `
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          ${Array(8)
            .fill(0)
            .map(
              () => `
            <div class="bg-[#14151C] border border-[#21232E] rounded-2xl overflow-hidden animate-pulse">
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
      `;
    }

    // 2. Error State
    if (this.error) {
      return `
        <div class="text-center py-16 bg-[#161215] border border-red-900/40 rounded-3xl p-8 max-w-lg mx-auto">
          <div class="w-12 h-12 rounded-full bg-red-950/60 text-[#E50914] flex items-center justify-center mx-auto mb-3 border border-red-800/40">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="font-cinematic text-lg font-bold text-white mb-1">Search Connection Error</h3>
          <p class="text-xs text-[#A1A1AA] mb-4">${this.error}</p>
          <button id="discover-retry-btn" class="btn-red-glow px-5 py-2 rounded-xl text-xs font-bold">
            Retry Search
          </button>
        </div>
      `;
    }

    // 3. Results Grid
    if (this.lastSearchResults && this.lastSearchResults.length > 0) {
      return `
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4" id="discover-cards-grid">
          ${this.lastSearchResults.map((media) => MediaCard.render(media)).join('')}
        </div>
      `;
    }

    // 4. Empty State
    return `
      <div class="text-center py-16 bg-[#121319] border border-[#20222D] rounded-3xl p-8 max-w-md mx-auto">
        <div class="w-14 h-14 rounded-full bg-[#1C1D26] flex items-center justify-center mx-auto mb-3 text-[#717684]">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <h3 class="font-cinematic text-base font-bold text-white mb-1">No movies found</h3>
        <p class="text-xs text-[#8E92A0] mb-4">
          Try searching for another movie title (e.g. "Interstellar", "Inception", "Batman").
        </p>
        <button id="discover-reset-filters" class="btn-glass px-4 py-2 rounded-xl text-xs font-semibold">
          Reset Filters
        </button>
      </div>
    `;
  }

  async executeSearch(query, mediaType, genre) {
    this.isLoading = true;
    this.error = null;
    this.updateLoadingIcon(true);
    this.updateResultsArea();

    try {
      let results = [];
      const trimmedQuery = (query || '').trim();

      if (trimmedQuery) {
        // Fetch live search from backend GET /api/search?q=<query>
        results = await apiService.searchMedia(trimmedQuery, mediaType, genre);
        for (const item of results) {
          store.addExternalMedia(item);
        }
      } else {
        // If query is empty, show curated catalog from store
        let curated = store.getState().curatedMedia || [];
        if (curated.length === 0) {
          curated = await store.loadCuratedMedia();
        }
        results = [...curated];

        if (mediaType && mediaType !== 'all') {
          results = results.filter((item) => {
            if (mediaType === 'movies') return item.media_type === 'movie' || item.type === 'movie';
            if (mediaType === 'tv') return item.media_type === 'series' || item.type === 'tv';
            return true;
          });
        }

        if (genre && genre !== 'All') {
          const gLower = genre.toLowerCase();
          results = results.filter(
            (item) =>
              item.genre?.toLowerCase().includes(gLower) ||
              (item.genres && item.genres.some((g) => g.toLowerCase().includes(gLower)))
          );
        }
      }

      this.lastSearchResults = results;
      this.isLoading = false;
      this.error = null;
    } catch (err) {
      this.isLoading = false;
      this.error = err.message || 'Unable to connect to search service.';
    }

    this.updateLoadingIcon(false);
    this.updateResultsArea();
  }

  updateLoadingIcon(loading) {
    const iconContainer = this.container.querySelector('#discover-search-icon');
    if (iconContainer) {
      if (loading) {
        iconContainer.innerHTML = `
          <svg class="w-5 h-5 animate-spin text-[#E50914]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        `;
      } else {
        iconContainer.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        `;
      }
    }
  }

  updateResultsArea() {
    const area = this.container.querySelector('#discover-results-area');
    if (area) {
      area.innerHTML = this.renderContentArea();
      MediaCard.bindEvents(area);
      this.attachInnerEvents();
    }

    const countBadge = this.container.querySelector('#results-count-badge');
    if (countBadge) {
      countBadge.textContent = this.isLoading
        ? 'Searching...'
        : `${this.lastSearchResults.length} titles`;
    }

    const state = store.getState();
    const summary = this.container.querySelector('#results-filter-summary');
    if (summary) {
      summary.innerHTML = `
        ${
          state.searchQuery
            ? `Search results for <strong class="text-[#E50914]">"${state.searchQuery}"</strong>`
            : `Browse <strong class="text-white capitalize">${state.activeFilter}</strong>`
        }
        ${state.activeGenre !== 'All' ? ` • ${state.activeGenre}` : ''}
      `;
    }

    const clearBtn = this.container.querySelector('#discover-clear-btn');
    if (clearBtn) {
      if (state.searchQuery) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
  }

  attachEvents() {
    const searchInput = this.container.querySelector('#discover-search-input');
    const clearBtn = this.container.querySelector('#discover-clear-btn');

    if (searchInput) {
      // Continuous input without losing focus
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        store.state.searchQuery = query; // update state quietly without re-creating the input

        if (clearBtn) {
          if (query) clearBtn.classList.remove('hidden');
          else clearBtn.classList.add('hidden');
        }

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          const state = store.getState();
          this.executeSearch(query, state.activeFilter, state.activeGenre);
        }, 300);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        store.setSearchQuery('');
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        clearBtn.classList.add('hidden');
        const state = store.getState();
        this.executeSearch('', state.activeFilter, state.activeGenre);
      });
    }

    // Media Type filter buttons
    this.container.querySelectorAll('.media-type-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.filterType;
        if (type) {
          store.setActiveFilter(type);
          this.updatePillStates(type, store.getState().activeGenre);
          const state = store.getState();
          this.executeSearch(state.searchQuery, type, state.activeGenre);
        }
      });
    });

    // Genre filter buttons
    this.container.querySelectorAll('.genre-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const genre = btn.dataset.genreName;
        if (genre) {
          store.setActiveGenre(genre);
          this.updatePillStates(store.getState().activeFilter, genre);
          const state = store.getState();
          this.executeSearch(state.searchQuery, state.activeFilter, genre);
        }
      });
    });

    this.attachInnerEvents();
  }

  attachInnerEvents() {
    const retryBtn = this.container.querySelector('#discover-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const state = store.getState();
        this.executeSearch(state.searchQuery, state.activeFilter, state.activeGenre);
      });
    }

    const resetBtn = this.container.querySelector('#discover-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        store.setSearchQuery('');
        store.setActiveFilter('all');
        store.setActiveGenre('All');
        const searchInput = this.container.querySelector('#discover-search-input');
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        this.updatePillStates('all', 'All');
        this.executeSearch('', 'all', 'All');
      });
    }
  }

  // Reset mount status if view is switched away
  unmount() {
    this.isMounted = false;
  }
}
