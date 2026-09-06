// js/components/MediaCard.js
// Media Card Component for CinemaMatch
// Displays movie/show card with poster_url, rating, genre, release_year, and watchlist controls

import { store } from '../state/store.js';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

export class MediaCard {
  static render(media, options = {}) {
    if (!media) return '';

    const isInWatchlist = store.isInWatchlist(media.id);
    const { className = '', showRemoveBtn = false } = options;

    const posterUrl =
      media.poster_url && media.poster_url !== 'N/A' && media.poster_url.startsWith('http')
        ? media.poster_url
        : media.poster && media.poster !== 'N/A' && media.poster.startsWith('http')
        ? media.poster
        : FALLBACK_POSTER;

    const genreText =
      media.genre ||
      (Array.isArray(media.genres) && media.genres.length > 0 ? media.genres[0] : null) ||
      (media.media_type === 'series' || media.type === 'tv' ? 'TV Series' : 'Movie');

    const yearText = media.release_year || media.year || '';

    return `
      <div 
        data-media-id="${media.id}"
        class="media-card-clickable group relative bg-[#14151C] hover:bg-[#1A1C25] border border-[#21232E] hover:border-[#353849] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer card-hover-effect flex flex-col ${className}"
      >
        <!-- Poster Container -->
        <div class="aspect-[2/3] w-full relative overflow-hidden bg-[#181922]">
          <img 
            src="${posterUrl}" 
            alt="${media.title || 'Movie'}"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onerror="this.onerror=null;this.src='${FALLBACK_POSTER}'"
          />
          
          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-[#14151C] via-transparent to-black/30"></div>

          <!-- Rating badge -->
          ${
            media.rating
              ? `
            <div class="absolute top-2.5 left-2.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[11px] font-bold text-amber-400">
              <span>★</span>
              <span>${media.rating}</span>
            </div>
          `
              : ''
          }

          <!-- Watchlist Action Button -->
          ${
            !showRemoveBtn
              ? `
            <button 
              data-action="toggle-watchlist"
              data-id="${media.id}"
              class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center ${
                isInWatchlist
                  ? 'bg-[#E50914] text-white shadow-lg'
                  : 'bg-black/60 backdrop-blur-md text-white/90 hover:bg-[#E50914] hover:text-white border border-white/10'
              } transition-all opacity-90 group-hover:opacity-100"
              title="${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}"
            >
              <svg class="w-4 h-4" fill="${isInWatchlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>
          `
              : `
            <button 
              data-action="remove-watchlist"
              data-id="${media.id}"
              class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-red-950/90 border border-red-500/50 text-red-300 hover:bg-red-900 text-xs font-bold transition-all shadow-lg flex items-center gap-1"
              title="Remove from Watchlist"
            >
              <span>✕</span>
              <span>Remove</span>
            </button>
          `
          }
        </div>

        <!-- Card Body -->
        <div class="p-3 sm:p-3.5 flex flex-col flex-1 justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-[#8E92A0] mb-1">
              <span class="truncate pr-2">${genreText}</span>
              ${yearText ? `<span class="text-[#717684] flex-shrink-0">${yearText}</span>` : ''}
            </div>
            <h3 class="font-cinematic text-sm sm:text-base font-bold text-white group-hover:text-[#E50914] transition-colors line-clamp-1 leading-snug">
              ${media.title || 'Untitled'}
            </h3>
          </div>

          ${
            showRemoveBtn
              ? `
            <button 
              data-action="remove-watchlist"
              data-id="${media.id}"
              class="mt-3 w-full py-1.5 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800/40 text-red-300 hover:text-white text-xs font-semibold transition-colors text-center"
            >
              Remove from Watchlist
            </button>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  static bindEvents(container) {
    if (!container) return;

    // Card Click -> Open Details Modal
    container.querySelectorAll('.media-card-clickable').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) return;
        const mediaId = card.dataset.mediaId;
        if (mediaId) {
          store.openMediaDetail(mediaId);
        }
      });
    });

    // Toggle watchlist button
    container.querySelectorAll('[data-action="toggle-watchlist"]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (id) {
          btn.disabled = true;
          try {
            await store.toggleWatchlist(id);
          } finally {
            btn.disabled = false;
          }
        }
      });
    });

    // Remove from watchlist button
    container.querySelectorAll('[data-action="remove-watchlist"]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (id) {
          btn.disabled = true;
          try {
            await store.removeFromWatchlist(id);
          } finally {
            btn.disabled = false;
          }
        }
      });
    });
  }
}
