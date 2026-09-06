// js/components/views/LandingView.js
// Landing / Welcome Tour View matching Screenshot 4

import { store } from '../../state/store.js';

export class LandingView {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
      <div class="space-y-12 pb-20 max-w-4xl mx-auto">
        
        <!-- HERO SECTION (Screenshot 4) -->
        <div class="relative text-center py-10 sm:py-16 px-4 rounded-3xl overflow-hidden bg-gradient-to-b from-[#12131C] via-[#0E0F15] to-[#0B0B0E] border border-[#21232E]">
          
          <!-- Subtle cosmic background glow -->
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>

          <!-- CineMatch Logo Icon Badge -->
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#181922] border border-[#2B2D3C] shadow-[0_0_20px_rgba(229,9,20,0.3)] mb-6">
            <div class="w-7 h-7 rounded-lg bg-[#E50914] flex items-center justify-center text-white">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 4H4.5C3.12 4 2 5.12 2 6.5v11C2 18.88 3.12 20 4.5 20h15c1.38 0 2.5-1.12 2.5-2.5v-11C22 5.12 20.88 4 19.5 4zM5.5 6h2l1.5 3h-2L5.5 6zm5 0h2l1.5 3h-2L10.5 6zm5 0h2l1.5 3h-2L15.5 6zM20 17.5c0 .28-.22.5-.5.5h-15c-.28 0-.5-.22-.5-.5V11h16v6.5z"/>
              </svg>
            </div>
          </div>

          <!-- Main Headline -->
          <h1 class="font-cinematic text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mx-auto mb-4">
            Find what you'll love next.
          </h1>

          <!-- Subtitle -->
          <p class="text-xs sm:text-base text-[#9CA3AF] max-w-xl mx-auto leading-relaxed mb-8">
            Curated for the cinematic eye. Dive into a personalized universe of premium films, tailored precisely to your unique taste.
          </p>

          <!-- Get Started Button -->
          <div class="flex justify-center">
            <button 
              id="landing-get-started"
              class="btn-red-glow flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm sm:text-base"
            >
              <span>Get Started</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </div>

        </div>

        <!-- CURATED MASTERPIECES SHOWCASE (Screenshot 4) -->
        <div>
          <div class="flex items-center justify-between mb-4 px-1">
            <h2 class="font-cinematic text-xl sm:text-2xl font-bold text-white tracking-tight">
              Curated Masterpieces
            </h2>
            <button id="landing-view-all" class="text-xs font-semibold text-[#8E92A0] hover:text-white flex items-center gap-1">
              <span>View All</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Interstellar Echoes Poster Showcase -->
          <div 
            id="landing-masterpiece-card"
            class="relative rounded-3xl overflow-hidden border border-[#232635] bg-[#121319] min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-10 cursor-pointer card-hover-effect group shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80" 
              alt="Interstellar Echoes"
              class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0B0B0E] via-[#0B0B0E]/50 to-transparent"></div>

            <div class="relative z-10 max-w-lg">
              <span class="text-[11px] font-bold text-[#E50914] uppercase tracking-widest block mb-1">
                MASTERPIECE SPOTLIGHT
              </span>
              <h3 class="font-cinematic text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                INTERSTELLAR ECHOES
              </h3>
              <p class="text-xs sm:text-sm text-[#D1D5DB] mb-4 line-clamp-2">
                A journey beyond the known. Christopher Nolan's cosmic milestone reimagined with sublime fidelity.
              </p>
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 rounded-md badge-match-glow text-xs font-bold">✨ 99% CineMatch Affinity</span>
                <span class="text-xs text-amber-400 font-bold">★ 5.0 Rating</span>
              </div>
            </div>
          </div>
        </div>

        <!-- THE CINEMATCH EXPERIENCE (Screenshot 4: 3 Pillars) -->
        <div class="space-y-4">
          <div class="text-center max-w-lg mx-auto mb-6">
            <h3 class="font-cinematic text-xl sm:text-2xl font-bold text-white tracking-tight">
              The CineMatch Experience
            </h3>
            <p class="text-xs sm:text-sm text-[#8E92A0] mt-1">
              A seamless journey from discovering hidden gems to building your perfect cinematic library.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <!-- 1. Discover -->
            <div class="bg-[#14151C] border border-[#21232E] rounded-2xl p-5 hover:border-[#353846] transition-colors flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                </div>
                <h4 class="font-cinematic text-base font-bold text-white mb-1.5">Discover</h4>
                <p class="text-xs text-[#8E92A0] leading-relaxed">
                  Browse an exquisitely curated selection of films across genres, handpicked for true cinephiles.
                </p>
              </div>
            </div>

            <!-- 2. Build Watchlist -->
            <div class="bg-[#14151C] border border-[#21232E] rounded-2xl p-5 hover:border-[#353846] transition-colors flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/40 text-red-400 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                </div>
                <h4 class="font-cinematic text-base font-bold text-white mb-1.5">Build Watchlist</h4>
                <p class="text-xs text-[#8E92A0] leading-relaxed">
                  Curate your personal library. Save masterpieces you want to experience in the perfect moment.
                </p>
              </div>
            </div>

            <!-- 3. Get Recommendations -->
            <div class="bg-[#14151C] border border-[#21232E] rounded-2xl p-5 hover:border-[#353846] transition-colors flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h4 class="font-cinematic text-base font-bold text-white mb-1.5">Get Recommendations</h4>
                <p class="text-xs text-[#8E92A0] leading-relaxed">
                  Our intelligent engine learns your sophisticated taste to suggest your next favorite film.
                </p>
              </div>
            </div>

          </div>
        </div>

        <!-- SOCIAL PROOF BANNER (Screenshot 4: 50k+ Cinephiles) -->
        <div class="bg-[#14151C] border border-[#232530] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div class="flex items-center gap-4">
            <!-- Stacked Avatar Avatars -->
            <div class="flex -space-x-3 overflow-hidden">
              <img class="inline-block h-10 w-10 rounded-full ring-2 ring-[#14151C]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt=""/>
              <img class="inline-block h-10 w-10 rounded-full ring-2 ring-[#14151C]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt=""/>
              <img class="inline-block h-10 w-10 rounded-full ring-2 ring-[#14151C]" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt=""/>
              <span class="inline-flex h-10 w-10 rounded-full ring-2 ring-[#14151C] bg-[#222432] items-center justify-center text-[10px] font-bold text-white">+50k</span>
            </div>

            <div>
              <h4 class="font-cinematic text-base sm:text-lg font-bold text-white">Join 50k+ cinephiles</h4>
              <p class="text-xs text-[#8E92A0]">Finding their next favorite film every day.</p>
            </div>
          </div>

          <button id="landing-join-btn" class="btn-red-glow px-6 py-3 rounded-xl font-bold text-xs whitespace-nowrap">
            Elevate Your Experience
          </button>
        </div>

        <!-- Footer -->
        <footer class="pt-8 border-t border-[#1C1E26] text-center space-y-3">
          <div class="flex items-center justify-center gap-2">
            <div class="w-5 h-5 rounded bg-[#E50914] flex items-center justify-center text-white">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 4H4.5C3.12 4 2 5.12 2 6.5v11C2 18.88 3.12 20 4.5 20h15c1.38 0 2.5-1.12 2.5-2.5v-11C22 5.12 20.88 4 19.5 4z"/></svg>
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

    this.attachEvents();
  }

  attachEvents() {
    const getStartedBtn = this.container.querySelector('#landing-get-started');
    if (getStartedBtn) getStartedBtn.addEventListener('click', () => store.setView('home'));

    const joinBtn = this.container.querySelector('#landing-join-btn');
    if (joinBtn) joinBtn.addEventListener('click', () => store.setView('home'));

    const viewAllBtn = this.container.querySelector('#landing-view-all');
    if (viewAllBtn) viewAllBtn.addEventListener('click', () => store.setView('discover'));

    const masterpieceCard = this.container.querySelector('#landing-masterpiece-card');
    if (masterpieceCard) {
      masterpieceCard.addEventListener('click', () => {
        store.openMediaDetail('interstellar-echoes');
      });
    }
  }
}
