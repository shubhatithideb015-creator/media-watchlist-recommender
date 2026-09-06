// js/components/RatingModal.js
// Interactive Rating Modal with 1-5 star selector and review tags

import { store } from '../state/store.js';

export class RatingModal {
  constructor(container) {
    this.container = container;
    this.selectedRating = 5;
    this.selectedTag = '';
  }

  render() {
    const state = store.getState();
    const mediaId = state.ratingModalMediaId;

    if (!mediaId) {
      this.container.innerHTML = '';
      return;
    }

    const media = store.getMediaById(mediaId);
    if (!media) {
      this.container.innerHTML = '';
      return;
    }

    const existingRating = store.getUserRating(media.id);
    if (existingRating) {
      this.selectedRating = existingRating.rating;
      this.selectedTag = existingRating.reviewTag || '';
    } else {
      this.selectedRating = 5;
      this.selectedTag = 'Masterpiece Atmosphere';
    }

    const ratingLabels = {
      1: 'Disappointing',
      2: 'Decent Watch',
      3: 'Good Cinema',
      4: 'Great & Compelling',
      5: 'Masterpiece 🏆'
    };

    const reviewTags = [
      'Masterpiece Atmosphere',
      'Mind-Bending',
      'Stunning Visuals',
      'Gripping Plot',
      'Exceptional Score',
      'Flawless Acting'
    ];

    this.container.innerHTML = `
      <div id="rating-modal-backdrop" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        
        <div class="relative w-full max-w-md bg-[#14151C] border border-[#2B2D3C] rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-modal-pop">
          
          <!-- Close Button -->
          <button 
            id="rating-modal-close"
            class="absolute top-4 right-4 text-[#8E92A0] hover:text-white p-2 rounded-full"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Header -->
          <div class="flex items-center gap-4 mb-6">
            <img 
              src="${media.poster}" 
              alt="${media.title}" 
              class="w-16 h-20 rounded-xl object-cover border border-[#2B2D3C]"
            />
            <div>
              <span class="text-xs font-bold text-[#E50914] uppercase tracking-wider">Rate & Calibrate</span>
              <h3 class="font-cinematic text-lg font-bold text-white leading-tight mt-0.5">${media.title}</h3>
              <p class="text-xs text-[#8E92A0]">${media.year} • ${media.genres?.[0] || 'Film'}</p>
            </div>
          </div>

          <!-- Interactive Star Selector -->
          <div class="text-center py-4 bg-[#0F1015] rounded-2xl border border-[#20222D] mb-5">
            <div class="flex items-center justify-center gap-2 mb-2" id="star-container">
              ${[1, 2, 3, 4, 5].map(starNum => `
                <button 
                  type="button" 
                  data-star="${starNum}"
                  class="star-btn p-1 text-3xl transition-transform hover:scale-125 focus:outline-none ${starNum <= this.selectedRating ? 'text-amber-400' : 'text-[#353849]'}"
                >
                  ★
                </button>
              `).join('')}
            </div>
            
            <p id="rating-label" class="text-sm font-bold text-amber-300">
              ${ratingLabels[this.selectedRating]}
            </p>
          </div>

          <!-- Quick Highlight Tags -->
          <div class="mb-6">
            <label class="text-xs font-semibold text-[#8E92A0] uppercase tracking-wider block mb-2">
              What stood out most? (Optional)
            </label>
            <div class="flex flex-wrap gap-2" id="review-tags-container">
              ${reviewTags.map(tag => `
                <button 
                  type="button"
                  data-tag="${tag}"
                  class="review-tag-btn px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${this.selectedTag === tag ? 'bg-purple-950/70 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-[#181A22] border-[#2B2D3C] text-[#A1A1AA] hover:text-white hover:border-[#4B4E63]'}"
                >
                  ${tag}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3">
            ${existingRating ? `
              <button 
                id="rating-remove-btn"
                class="px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-semibold transition-colors"
              >
                Delete Rating
              </button>
            ` : ''}
            
            <button 
              id="rating-submit-btn"
              class="flex-1 py-3 px-4 rounded-xl btn-red-glow font-bold text-sm text-center"
            >
              Save Rating
            </button>
          </div>

        </div>
      </div>
    `;

    this.attachEvents(media.id, ratingLabels);
  }

  attachEvents(mediaId, ratingLabels) {
    const backdrop = this.container.querySelector('#rating-modal-backdrop');
    const closeBtn = this.container.querySelector('#rating-modal-close');

    const handleClose = () => store.closeRatingModal();

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) handleClose();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', handleClose);

    // Star buttons
    const starBtns = this.container.querySelectorAll('.star-btn');
    const ratingLabel = this.container.querySelector('#rating-label');

    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const star = parseInt(btn.dataset.star, 10);
        this.selectedRating = star;
        
        starBtns.forEach(b => {
          const s = parseInt(b.dataset.star, 10);
          if (s <= star) {
            b.className = 'star-btn p-1 text-3xl transition-transform hover:scale-125 focus:outline-none text-amber-400';
          } else {
            b.className = 'star-btn p-1 text-3xl transition-transform hover:scale-125 focus:outline-none text-[#353849]';
          }
        });

        if (ratingLabel) {
          ratingLabel.textContent = ratingLabels[star] || `${star} Stars`;
        }
      });
    });

    // Tag buttons
    const tagBtns = this.container.querySelectorAll('.review-tag-btn');
    tagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        this.selectedTag = this.selectedTag === tag ? '' : tag;
        
        tagBtns.forEach(b => {
          if (b.dataset.tag === this.selectedTag) {
            b.className = 'review-tag-btn px-3 py-1.5 rounded-lg text-xs font-medium border transition-all bg-purple-950/70 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
          } else {
            b.className = 'review-tag-btn px-3 py-1.5 rounded-lg text-xs font-medium border transition-all bg-[#181A22] border-[#2B2D3C] text-[#A1A1AA] hover:text-white hover:border-[#4B4E63]';
          }
        });
      });
    });

    // Submit button
    const submitBtn = this.container.querySelector('#rating-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        store.setRating(mediaId, this.selectedRating, this.selectedTag);
      });
    }

    // Remove rating button
    const removeBtn = this.container.querySelector('#rating-remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        store.removeRating(mediaId);
        store.closeRatingModal();
      });
    }
  }
}
