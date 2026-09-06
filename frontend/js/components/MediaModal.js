// js/components/MediaModal.js
// Movie Details Modal
// Fetches full detail from GET /api/media/<imdb_id> and manages Watchlist addition/removal

import { store } from '../state/store.js';
import { apiService, FALLBACK_POSTER } from '../services/api.js';

export class MediaModal {
  constructor(container) {
    this.container = container;
    this.currentFetchedMedia = null;
    this.isLoadingDetails = false;
    this.fetchError = null;
  }

  async render() {
    const state = store.getState();
    const mediaId = state.selectedMediaId;

    if (!mediaId) {
      this.currentFetchedMedia = null;
      this.container.innerHTML = '';
      return;
    }

    let media = store.getMediaById(mediaId);

    // Fetch full details from backend GET /api/media/<id> if not already loaded for this ID
    if (!this.currentFetchedMedia || this.currentFetchedMedia.id !== mediaId) {
      this.isLoadingDetails = true;
      this.fetchError = null;
      this.renderModalContent(
        media || { id: mediaId, title: 'Loading details...', description: 'Fetching movie information from server...' },
        true
      );

      try {
        const enriched = await apiService.getMediaDetails(mediaId);
        if (enriched) {
          media = enriched;
          this.currentFetchedMedia = enriched;
          store.addExternalMedia(enriched);
        } else {
          this.fetchError = 'Movie details not found.';
        }
      } catch (err) {
        console.warn('Backend detail fetch error:', err);
        this.fetchError = err.message || 'Unable to load movie details.';
      } finally {
        this.isLoadingDetails = false;
      }
    } else {
      media = this.currentFetchedMedia;
    }

    if (!media) {
      this.container.innerHTML = '';
      return;
    }

    this.renderModalContent(media, this.isLoadingDetails);
  }

  renderModalContent(media, isLoading = false) {
    const isInWatchlist = store.isInWatchlist(media.id);

    const poster =
      media.poster_url && media.poster_url !== 'N/A' && media.poster_url.startsWith('http')
        ? media.poster_url
        : media.poster && media.poster !== 'N/A' && media.poster.startsWith('http')
        ? media.poster
        : FALLBACK_POSTER;

    // Handle null backdrop_url gracefully by falling back to poster or dark fallback
    const backdrop =
      media.backdrop_url && media.backdrop_url !== 'N/A' && media.backdrop_url.startsWith('http')
        ? media.backdrop_url
        : poster;

    const genreText =
      media.genre ||
      (Array.isArray(media.genres) && media.genres.length > 0 ? media.genres.join(', ') : 'Movie');

    const yearText = media.release_year || media.year || '';
    const ratingText = media.rating ? `★ ${media.rating}` : '';
    const descriptionText =
      media.description || media.synopsis || 'No description available for this title.';

    this.container.innerHTML = `
      <div id="media-modal-backdrop" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
        
        <!-- Modal Dialog Card -->
        <div class="relative w-full max-w-2xl bg-[#121319] border border-[#262835] rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.8)] animate-modal-pop my-auto">
          
          <!-- Close Button -->
          <button 
            id="media-modal-close"
            class="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-transform hover:scale-105"
            title="Close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Backdrop Header Banner -->
          <div class="relative h-60 sm:h-72 w-full overflow-hidden bg-black">
            <img 
              src="${backdrop}" 
              alt="${media.title || 'Movie'}"
              class="w-full h-full object-cover opacity-65 filter brightness-90 transition-all duration-500"
              onerror="this.onerror=null;this.src='${FALLBACK_POSTER}'"
            />
            
            <div class="absolute inset-0 bg-gradient-to-t from-[#121319] via-[#121319]/60 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-[#121319]/90 via-transparent to-transparent"></div>

            <!-- Title & Basic Info Overlay -->
            <div class="absolute bottom-4 left-4 sm:left-6 right-4 sm:right-6">
              <h2 class="font-cinematic text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                ${media.title || 'Untitled'}
              </h2>
              
              <div class="flex flex-wrap items-center gap-2.5 mt-2 text-xs sm:text-sm text-[#A1A1AA]">
                ${
                  ratingText
                    ? `<span class="text-amber-400 font-bold flex items-center gap-1">${ratingText}</span><span>•</span>`
                    : ''
                }
                ${yearText ? `<span>${yearText}</span><span>•</span>` : ''}
                <span class="text-white/80 font-medium">${genreText}</span>
              </div>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-5 sm:p-6 space-y-5">
            
            <!-- Description / Synopsis -->
            <div>
              <h4 class="text-xs font-bold text-[#8E92A0] uppercase tracking-wider mb-1.5">Overview</h4>
              <p class="text-sm text-[#D1D5DB] leading-relaxed">
                ${descriptionText}
              </p>
            </div>

            ${
              this.fetchError
                ? `
              <div class="p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-xs text-red-300">
                ${this.fetchError}
              </div>
            `
                : ''
            }

            <!-- Watchlist Action Button -->
            <div class="pt-2 border-t border-[#1F212C]">
              <button 
                id="modal-watchlist-btn"
                data-id="${media.id}"
                class="w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
                  isInWatchlist
                    ? 'bg-[#1C1D26] hover:bg-[#252836] border border-[#2B2D3C] text-white'
                    : 'btn-red-glow text-white shadow-[0_4px_20px_rgba(229,9,20,0.4)]'
                }"
              >
                <svg class="w-5 h-5" fill="${isInWatchlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
                <span>${isInWatchlist ? '✓ In Watchlist (Click to Remove)' : '+ Add to Watchlist'}</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const backdrop = this.container.querySelector('#media-modal-backdrop');
    const closeBtn = this.container.querySelector('#media-modal-close');

    const handleClose = () => store.closeMediaDetail();

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) handleClose();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', handleClose);

    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        handleClose();
        window.removeEventListener('keydown', keyHandler);
      }
    };
    window.addEventListener('keydown', keyHandler);

    // Watchlist button action
    const watchlistBtn = this.container.querySelector('#modal-watchlist-btn');
    if (watchlistBtn) {
      watchlistBtn.addEventListener('click', async () => {
        const id = watchlistBtn.dataset.id || store.getState().selectedMediaId;
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
  }
}
