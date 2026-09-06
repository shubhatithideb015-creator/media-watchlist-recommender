// js/components/views/MatchView.js
// Algorithm-Driven Recommendation View matching Screenshot 5

import { store } from '../../state/store.js';
import { recommendationEngine } from '../../services/recommendationEngine.js';
import { MediaCard } from '../MediaCard.js';

export class MatchView {
  constructor(container) {
    this.container = container;
    this.currentTopMatchIndex = 0;
  }

  render() {
    const { topMatch, topMatchesList, hiddenGems, somethingDifferent } = 
      recommendationEngine.getMatchViewRecommendations();

    const currentTop = topMatchesList[this.currentTopMatchIndex] || topMatch;
    const isTopInWatchlist = store.isInWatchlist(currentTop.id);

    this.container.innerHTML = `
      <div class="space-y-10 pb-20">
        
        <!-- Header: ALGORITHM-DRIVEN DISCOVERY (Screenshot 5) -->
        <div class="pt-1">
          <span class="text-[11px] sm:text-xs font-bold text-[#E50914] uppercase tracking-widest block mb-1">
            ALGORITHM-DRIVEN DISCOVERY
          </span>
          <h1 class="font-cinematic text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Curated for You
          </h1>
          <p class="text-xs sm:text-sm text-[#8E92A0] max-w-2xl mt-1 leading-relaxed">
            Based on your recent cinematic journey, we've calibrated our matrix to surface these premium selections.
          </p>
        </div>

        <!-- 1. TOP MATCHES SHOWCASE (Screenshot 5) -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-cinematic text-lg sm:text-2xl font-bold text-white tracking-tight">
              Top Matches
            </h2>
            
            <!-- Prev / Next arrows -->
            <div class="flex items-center gap-2">
              <button 
                id="top-match-prev"
                class="w-8 h-8 rounded-full bg-[#181A22] hover:bg-[#232532] border border-[#2B2D3C] text-white flex items-center justify-center transition-colors"
                title="Previous match"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button 
                id="top-match-next"
                class="w-8 h-8 rounded-full bg-[#181A22] hover:bg-[#232532] border border-[#2B2D3C] text-white flex items-center justify-center transition-colors"
                title="Next match"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

          <!-- Featured Top Match Banner Card -->
          <div 
            data-media-id="${currentTop.id}"
            class="media-card-clickable group relative rounded-3xl overflow-hidden border border-[#232635] bg-[#121319] min-h-[360px] sm:min-h-[420px] flex flex-col justify-end p-5 sm:p-8 cursor-pointer card-hover-effect shadow-2xl"
          >
            <!-- Backdrop Image -->
            <img 
              src="${currentTop.backdrop || currentTop.poster}" 
              alt="${currentTop.title}"
              class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
              onerror="this.src='https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80'"
            />
            
            <!-- Dark Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-[#0B0B0E] via-[#0B0B0E]/60 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-[#0B0B0E]/80 via-transparent to-transparent"></div>

            <!-- Top Match Glowing Badge (Top Right) -->
            <div class="absolute top-4 sm:top-6 right-4 sm:right-6">
              <span class="px-3 py-1.5 rounded-xl badge-match-glow text-xs sm:text-sm font-black flex items-center gap-1.5">
                <span class="text-purple-300">✨</span>
                <span>${currentTop.matchScore}%</span>
              </span>
            </div>

            <!-- Content Area -->
            <div class="relative z-10 max-w-xl">
              <!-- Comparison Tag ("BECAUSE YOU LIKED BLADE RUNNER 2049") -->
              <span class="inline-block px-3 py-1 rounded-md bg-black/60 border border-white/10 text-[10px] sm:text-xs font-bold text-white/90 uppercase tracking-wider mb-2 backdrop-blur-md">
                ${currentTop.matchReason || 'BECAUSE YOU LIKED BLADE RUNNER 2049'}
              </span>

              <!-- Title -->
              <h3 class="font-cinematic text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-1">
                ${currentTop.title}
              </h3>

              <!-- Metadata info -->
              <p class="text-xs sm:text-sm text-[#A1A1AA] mb-4">
                ${currentTop.year} • ${currentTop.genres?.join(', ')} • ${currentTop.duration}
              </p>

              <!-- Quick action button -->
              <div class="flex items-center gap-3">
                <button 
                  data-action="toggle-watchlist"
                  data-id="${currentTop.id}"
                  class="btn-red-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold"
                >
                  <svg class="w-4 h-4" fill="${isTopInWatchlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                  <span>${isTopInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>

                <button 
                  class="btn-glass px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold"
                  onclick="event.stopPropagation(); store.openMediaDetail('${currentTop.id}');"
                >
                  View Details
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- 2. HIDDEN GEMS (Screenshot 5: 2x2 Grid) -->
        <div>
          <div class="mb-4">
            <h2 class="font-cinematic text-lg sm:text-2xl font-bold text-white tracking-tight">
              Hidden Gems
            </h2>
            <p class="text-xs text-[#8E92A0] mt-0.5">Highly rated selections that flew under the radar.</p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4" id="hidden-gems-grid">
            ${hiddenGems.map(media => MediaCard.render(media, { variant: 'gem' })).join('')}
          </div>
        </div>

        <!-- 3. SOMETHING DIFFERENT (Screenshot 5: 2 Horizontal Cards) -->
        <div>
          <div class="mb-4">
            <h2 class="font-cinematic text-lg sm:text-2xl font-bold text-white tracking-tight">
              Something Different
            </h2>
            <p class="text-xs text-[#8E92A0] mt-0.5">Expand your cinematic horizons outside your usual genres.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="something-different-grid">
            ${somethingDifferent.map(media => MediaCard.render(media, { variant: 'horizontal' })).join('')}
          </div>
        </div>

        <!-- CineMatch Footer (Screenshot 5) -->
        <footer class="pt-10 border-t border-[#1C1E26] text-center space-y-3">
          <div class="flex items-center justify-center gap-2">
            <div class="w-5 h-5 rounded bg-[#E50914] flex items-center justify-center">
              <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 4H4.5C3.12 4 2 5.12 2 6.5v11C2 18.88 3.12 20 4.5 20h15c1.38 0 2.5-1.12 2.5-2.5v-11C22 5.12 20.88 4 19.5 4z"/>
              </svg>
            </div>
            <span class="font-cinematic text-sm font-bold text-[#E50914]">CinemaMatch</span>
          </div>

          <div class="flex flex-wrap justify-center gap-4 text-xs text-[#717684]">
            <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" class="hover:text-white transition-colors">Help Center</a>
            <span>•</span>
            <a href="#" class="hover:text-white transition-colors">Contact</a>
          </div>

          <p class="text-[11px] text-[#525768]">
            © 2026 CinemaMatch. Curated for the cinematic eye.
          </p>
        </footer>

      </div>
    `;

    this.attachEvents(topMatchesList);
  }

  attachEvents(topMatchesList) {
    MediaCard.bindEvents(this.container);

    const prevBtn = this.container.querySelector('#top-match-prev');
    const nextBtn = this.container.querySelector('#top-match-next');

    if (prevBtn && topMatchesList.length > 1) {
      prevBtn.addEventListener('click', () => {
        this.currentTopMatchIndex = (this.currentTopMatchIndex - 1 + topMatchesList.length) % topMatchesList.length;
        this.render();
      });
    }

    if (nextBtn && topMatchesList.length > 1) {
      nextBtn.addEventListener('click', () => {
        this.currentTopMatchIndex = (this.currentTopMatchIndex + 1) % topMatchesList.length;
        this.render();
      });
    }
  }
}
