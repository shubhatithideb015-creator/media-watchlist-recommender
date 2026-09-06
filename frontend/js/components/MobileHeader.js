// js/components/MobileHeader.js
// Mobile Top Header (Iteration 1)

import { store } from '../state/store.js';

export class MobileHeader {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
      <header class="lg:hidden h-14 px-4 flex items-center justify-between border-b border-[#1A1C24] bg-[#0B0B0E]/95 backdrop-blur-lg sticky top-0 z-30">
        
        <!-- Logo -->
        <div class="flex items-center gap-2 cursor-pointer" id="mobile-logo">
          <div class="w-7 h-7 rounded-md bg-[#E50914] flex items-center justify-center shadow-[0_0_10px_rgba(229,9,20,0.5)]">
            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 4H4.5C3.12 4 2 5.12 2 6.5v11C2 18.88 3.12 20 4.5 20h15c1.38 0 2.5-1.12 2.5-2.5v-11C22 5.12 20.88 4 19.5 4zM5.5 6h2l1.5 3h-2L5.5 6zm5 0h2l1.5 3h-2L10.5 6zm5 0h2l1.5 3h-2L15.5 6zM20 17.5c0 .28-.22.5-.5.5h-15c-.28 0-.5-.22-.5-.5V11h16v6.5z"/>
            </svg>
          </div>
          <span class="font-cinematic text-lg font-black tracking-tight text-white flex items-center">
            Cinema<span class="text-[#E50914]">Match</span>
          </span>
        </div>

        <!-- Action Icons -->
        <div class="flex items-center gap-2">
          <button 
            id="mobile-search-toggle"
            class="p-2 text-[#9CA3AF] hover:text-white transition-colors"
            title="Search"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </header>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const logo = this.container.querySelector('#mobile-logo');
    if (logo) {
      logo.addEventListener('click', () => store.setView('home'));
    }

    const searchToggle = this.container.querySelector('#mobile-search-toggle');
    if (searchToggle) {
      searchToggle.addEventListener('click', () => {
        store.setView('discover');
        setTimeout(() => {
          const input = document.querySelector('#discover-search-input');
          if (input) input.focus();
        }, 100);
      });
    }
  }
}
