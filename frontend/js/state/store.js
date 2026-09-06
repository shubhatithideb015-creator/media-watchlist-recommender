// js/state/store.js
// CineMatch Reactive State Store
// Integrates with Flask Backend for live curated media and SQLite watchlist

import { apiService, normalizeMedia } from '../services/api.js';

class Store {
  constructor() {
    this.listeners = [];

    this.state = {
      currentView: 'home', // 'home' | 'discover' | 'watchlist'
      
      // Curated Media from GET /api/media
      curatedMedia: [],
      isLoadingCurated: false,
      curatedError: null,

      // Media Cache (accumulated known media items for details lookup)
      mediaList: [],

      // Watchlist from GET /api/watchlist
      watchlist: [],
      isLoadingWatchlist: false,
      watchlistError: null,

      // Search & Filters
      searchQuery: '',
      activeFilter: 'all', // 'all' | 'movies' | 'tv'
      activeGenre: 'All', // 'All' | 'Sci-Fi' | 'Action' | ...

      // Movie Details Modal
      selectedMediaId: null,

      // Feedback toast
      toast: null,
    };
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Store listener error:', err);
      }
    }
  }

  // --- ACTIONS ---

  setView(viewName) {
    if (this.state.currentView !== viewName) {
      this.state.currentView = viewName;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.notify();
    }
  }

  setSearchQuery(query) {
    this.state.searchQuery = query;
    this.notify();
  }

  setActiveFilter(filter) {
    this.state.activeFilter = filter;
    this.notify();
  }

  setActiveGenre(genre) {
    this.state.activeGenre = genre;
    this.notify();
  }

  /**
   * Fetch initial curated media from backend GET /api/media
   */
  async loadCuratedMedia() {
    this.state.isLoadingCurated = true;
    this.state.curatedError = null;
    this.notify();

    try {
      const items = await apiService.getBackendMedia();
      this.state.curatedMedia = items;
      this.state.isLoadingCurated = false;
      this.state.curatedError = null;

      // Merge into mediaList
      for (const item of items) {
        this.addExternalMedia(item);
      }
      this.notify();
      return items;
    } catch (err) {
      console.error('Failed to load curated media from backend:', err);
      this.state.isLoadingCurated = false;
      this.state.curatedError = err.message || 'Unable to connect to CineMatch backend.';
      this.notify();
      return [];
    }
  }

  /**
   * Fetch initial watchlist from backend GET /api/watchlist
   */
  async loadWatchlist() {
    this.state.isLoadingWatchlist = true;
    this.state.watchlistError = null;
    this.notify();

    try {
      const items = await apiService.getWatchlist();
      this.state.watchlist = items;
      this.state.isLoadingWatchlist = false;
      this.state.watchlistError = null;

      // Merge into mediaList
      for (const item of items) {
        this.addExternalMedia(item);
      }
      this.notify();
      return items;
    } catch (err) {
      console.error('Failed to load watchlist from backend:', err);
      this.state.isLoadingWatchlist = false;
      this.state.watchlistError = err.message || 'Unable to load watchlist from backend.';
      this.notify();
      return [];
    }
  }

  /**
   * Add movie to watchlist via backend POST /api/watchlist
   */
  async addToWatchlist(media) {
    if (!media || !media.id) return;
    const mediaItem = normalizeMedia(media);
    const mediaId = mediaItem.id;

    // Check if already in local watchlist state
    if (this.isInWatchlist(mediaId)) {
      this.showToast(`"${mediaItem.title}" is already in your Watchlist`, 'info');
      return;
    }

    try {
      const res = await apiService.addToWatchlist(mediaId);

      if (res.status === 201 || res.success) {
        if (!this.isInWatchlist(mediaId)) {
          this.state.watchlist = [...this.state.watchlist, mediaItem];
        }
        this.addExternalMedia(mediaItem);
        this.showToast(`Added "${mediaItem.title}" to Watchlist`, 'success');
        this.notify();
      } else if (res.status === 409) {
        if (!this.isInWatchlist(mediaId)) {
          this.state.watchlist = [...this.state.watchlist, mediaItem];
        }
        this.showToast(`"${mediaItem.title}" is already in your Watchlist`, 'info');
        this.notify();
      }
    } catch (err) {
      console.error('Add to watchlist error:', err);
      this.showToast(err.message || 'Failed to add to Watchlist', 'error');
    }
  }

  /**
   * Remove movie from watchlist via backend DELETE /api/watchlist/<media_id>
   */
  async removeFromWatchlist(mediaId) {
    if (!mediaId) return;
    const item = this.getMediaById(mediaId);
    const title = item ? item.title : 'Movie';

    // Optimistically update watchlist for instant UI response
    const previousWatchlist = [...this.state.watchlist];
    this.state.watchlist = this.state.watchlist.filter((m) => m.id !== mediaId);
    this.notify();

    try {
      await apiService.removeFromWatchlist(mediaId);
      this.showToast(`Removed "${title}" from Watchlist`, 'info');
    } catch (err) {
      console.error('Remove from watchlist error:', err);
      // Revert if API failed
      this.state.watchlist = previousWatchlist;
      this.showToast(err.message || 'Failed to remove from Watchlist', 'error');
      this.notify();
    }
  }

  /**
   * Toggle movie in watchlist
   */
  async toggleWatchlist(mediaId) {
    if (!mediaId) return;
    if (this.isInWatchlist(mediaId)) {
      await this.removeFromWatchlist(mediaId);
    } else {
      let media = this.getMediaById(mediaId);
      if (!media) {
        // Fetch details if not yet in cache
        try {
          media = await apiService.getMediaDetails(mediaId);
        } catch (e) {
          media = { id: mediaId, title: 'Movie' };
        }
      }
      if (media) {
        await this.addToWatchlist(media);
      }
    }
  }

  isInWatchlist(mediaId) {
    if (!mediaId) return false;
    return this.state.watchlist.some((item) => item.id === mediaId);
  }

  getWatchlist() {
    return this.state.watchlist;
  }

  getCuratedMedia() {
    return this.state.curatedMedia;
  }

  openMediaDetail(mediaId) {
    this.state.selectedMediaId = mediaId;
    this.notify();
  }

  closeMediaDetail() {
    this.state.selectedMediaId = null;
    this.notify();
  }

  showToast(message, type = 'success') {
    const id = Date.now();
    this.state.toast = { message, type, id };
    this.notify();

    setTimeout(() => {
      if (this.state.toast && this.state.toast.id === id) {
        this.state.toast = null;
        this.notify();
      }
    }, 3000);
  }

  getMediaById(id) {
    if (!id) return null;
    const fromCurated = this.state.curatedMedia.find((m) => m.id === id);
    if (fromCurated) return fromCurated;
    const fromWatchlist = this.state.watchlist.find((m) => m.id === id);
    if (fromWatchlist) return fromWatchlist;
    const fromList = this.state.mediaList.find((m) => m.id === id);
    if (fromList) return fromList;
    return null;
  }

  addExternalMedia(mediaItem) {
    if (!mediaItem || !mediaItem.id) return;
    const normalized = normalizeMedia(mediaItem);
    const idx = this.state.mediaList.findIndex((m) => m.id === normalized.id);
    if (idx === -1) {
      this.state.mediaList.push(normalized);
    } else {
      this.state.mediaList[idx] = { ...this.state.mediaList[idx], ...normalized };
    }
  }
}

export const store = new Store();
