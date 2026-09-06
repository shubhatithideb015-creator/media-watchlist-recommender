// js/components/Toast.js
// Non-intrusive floating toast notifications

import { store } from '../state/store.js';

export class Toast {
  constructor(container) {
    this.container = container;
  }

  render() {
    const toast = store.getState().toast;

    if (!toast) {
      this.container.innerHTML = '';
      return;
    }

    const typeStyles = {
      success: 'bg-[#181A24] border-[#E50914] text-white shadow-[0_8px_30px_rgba(229,9,20,0.35)]',
      info: 'bg-[#181A24] border-[#6320EE] text-white shadow-[0_8px_30px_rgba(99,32,238,0.35)]',
      warning: 'bg-[#181A24] border-amber-500 text-white shadow-[0_8px_30px_rgba(245,158,11,0.35)]'
    };

    const icons = {
      success: `<svg class="w-5 h-5 text-[#E50914]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
      info: `<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
      warning: `<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
    };

    this.container.innerHTML = `
      <div class="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border ${typeStyles[toast.type] || typeStyles.success} animate-modal-pop backdrop-blur-lg">
        <div>${icons[toast.type] || icons.success}</div>
        <p class="text-xs sm:text-sm font-semibold tracking-wide">${toast.message}</p>
      </div>
    `;
  }
}
