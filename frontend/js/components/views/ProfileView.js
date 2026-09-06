// js/components/views/ProfileView.js
// User Profile & Cinematic Taste Calibration View

import { store } from '../../state/store.js';

export class ProfileView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const state = store.getState();
    const user = state.user;
    const watchlistCount = Object.keys(state.watchlist).length;
    const watchedCount = Object.keys(state.watched).length;
    const ratedCount = Object.keys(state.ratings).length;
    const hoursWatched = Math.round(watchedCount * 2.1);

    this.container.innerHTML = `
      <div class="space-y-8 pb-20 max-w-4xl">
        
        <!-- Profile Banner -->
        <div class="relative bg-gradient-to-r from-[#171822] via-[#14151C] to-[#121319] border border-[#232532] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
          
          <div class="relative">
            <img 
              src="${user.avatar}" 
              alt="${user.name}"
              class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.3)]"
            />
            <span class="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md bg-[#E50914] text-[10px] font-extrabold text-white uppercase tracking-wider">
              PRO
            </span>
          </div>

          <div class="flex-1 text-center sm:text-left">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 class="font-cinematic text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ${user.name}
              </h1>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                ${user.tier}
              </span>
            </div>

            <p class="text-xs sm:text-sm text-[#8E92A0] mb-4">
              Calibrated Taste: <strong class="text-purple-300">${user.stats.tasteAffinity}</strong>
            </p>

            <!-- Action buttons -->
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button id="profile-edit-taste-btn" class="btn-glass px-4 py-2 rounded-xl text-xs font-semibold">
                Re-calibrate Matrix
              </button>
              <button id="profile-export-btn" class="btn-glass px-4 py-2 rounded-xl text-xs font-semibold">
                Export Watchlist JSON
              </button>
            </div>
          </div>
        </div>

        <!-- 4-Stat Metric Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          <div class="bg-[#14151C] border border-[#21232E] rounded-2xl p-4 text-center sm:text-left">
            <span class="text-xs text-[#717684] block uppercase font-bold">Watchlist</span>
            <span class="font-cinematic text-2xl sm:text-3xl font-black text-white mt-1 block">${watchlistCount}</span>
            <span class="text-[11px] text-[#8E92A0] mt-0.5 block">Saved masterpieces</span>
          </div>

          <div class="bg-[#14151C] border border-[#21232E] rounded-2xl p-4 text-center sm:text-left">
            <span class="text-xs text-[#717684] block uppercase font-bold">Watched</span>
            <span class="font-cinematic text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">${watchedCount}</span>
            <span class="text-[11px] text-[#8E92A0] mt-0.5 block">Completed titles</span>
          </div>

          <div class="bg-[#14151C] border border-[#21232E] rounded-2xl p-4 text-center sm:text-left">
            <span class="text-xs text-[#717684] block uppercase font-bold">Rated</span>
            <span class="font-cinematic text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">${ratedCount}</span>
            <span class="text-[11px] text-[#8E92A0] mt-0.5 block">Personal reviews</span>
          </div>

          <div class="bg-[#14151C] border border-[#21232E] rounded-2xl p-4 text-center sm:text-left">
            <span class="text-xs text-[#717684] block uppercase font-bold">Screen Time</span>
            <span class="font-cinematic text-2xl sm:text-3xl font-black text-purple-300 mt-1 block">${hoursWatched}h</span>
            <span class="text-[11px] text-[#8E92A0] mt-0.5 block">Cinephile runtime</span>
          </div>
        </div>

        <!-- Taste Profile & Genre Breakdown -->
        <div class="bg-[#14151C] border border-[#21232E] rounded-3xl p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="font-cinematic text-lg font-bold text-white tracking-tight">
              Cinematic Taste Matrix
            </h3>
            <span class="text-xs font-semibold text-[#8E92A0]">Top: Sci-Fi / Cyberpunk Noir</span>
          </div>

          <div class="space-y-4">
            ${user.favoriteGenres.map(genre => `
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-white">${genre.name}</span>
                  <span class="text-[#8E92A0]">${genre.percentage}%</span>
                </div>
                <div class="w-full bg-[#1F212C] h-2 rounded-full overflow-hidden">
                  <div class="h-full rounded-full" style="width: ${genre.percentage}%; background-color: ${genre.color}"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Data & Settings Controls -->
        <div class="bg-[#14151C] border border-[#21232E] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 class="font-cinematic text-base font-bold text-white">Reset Demo Data</h4>
            <p class="text-xs text-[#8E92A0]">Clear local storage to reset your watchlist and ratings to fresh defaults.</p>
          </div>
          <button id="profile-reset-data-btn" class="px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-bold transition-colors whitespace-nowrap">
            Reset All Data
          </button>
        </div>

      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const editTasteBtn = this.container.querySelector('#profile-edit-taste-btn');
    if (editTasteBtn) {
      editTasteBtn.addEventListener('click', () => {
        store.showToast('Matrix re-calibrated based on your latest ratings!', 'success');
        store.setView('match');
      });
    }

    const exportBtn = this.container.querySelector('#profile-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const state = store.getState();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.watchlist, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "cinematch_watchlist.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        store.showToast('Watchlist exported successfully!', 'success');
      });
    }

    const resetBtn = this.container.querySelector('#profile-reset-data-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your watchlist and ratings?')) {
          localStorage.clear();
          location.reload();
        }
      });
    }
  }
}
