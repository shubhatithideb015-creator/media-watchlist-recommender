// js/services/api.js
// CineMatch Backend API Service
// Connects to Flask backend (Endpoints: /api/media, /api/search, /api/watchlist, /api/health)

/**
 * Resolves the API base URL.
 * Defaults to http://localhost:5000 in local dev, or relative /api in production if on same domain.
 * Can be overridden globally via window.__API_BASE_URL__.
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    return window.__API_BASE_URL__.replace(/\/+$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5000';
  }
  return '';
}

export const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

/**
 * Normalizes backend movie object to maintain consistent fields
 * and backward compatibility with UI components.
 */
export function normalizeMedia(item) {
  if (!item) return null;

  const poster =
    item.poster_url && item.poster_url !== 'N/A' && item.poster_url.startsWith('http')
      ? item.poster_url
      : item.poster && item.poster !== 'N/A' && item.poster.startsWith('http')
      ? item.poster
      : FALLBACK_POSTER;

  const backdrop =
    item.backdrop_url && item.backdrop_url !== 'N/A' && item.backdrop_url.startsWith('http')
      ? item.backdrop_url
      : poster;

  let genres = [];
  if (Array.isArray(item.genres) && item.genres.length > 0) {
    genres = item.genres;
  } else if (typeof item.genre === 'string' && item.genre.trim()) {
    genres = item.genre.split(',').map((g) => g.trim());
  } else {
    genres = [item.media_type === 'series' ? 'TV Series' : 'Movie'];
  }

  const year = item.release_year || item.year || null;
  const rating =
    item.rating !== undefined && item.rating !== null && !isNaN(Number(item.rating))
      ? Number(item.rating)
      : null;

  const desc = item.description || item.Plot || item.synopsis || 'No description available.';

  return {
    id: item.id || item.imdbID,
    title: item.title || item.Title || 'Untitled',
    description: desc,
    synopsis: desc,
    poster_url: poster,
    poster: poster,
    backdrop_url: item.backdrop_url || null,
    backdrop: backdrop,
    genre: item.genre || genres.join(', '),
    genres: genres,
    rating: rating,
    release_year: year,
    year: year,
    media_type: item.media_type || (item.Type === 'series' ? 'series' : 'movie'),
    type: item.media_type === 'series' || item.type === 'tv' ? 'tv' : 'movie',
  };
}

class MediaApiService {
  constructor() {
    this.searchCache = new Map();
  }

  /**
   * Health check endpoint
   */
  async checkHealth() {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Fetch curated 5 movies from backend GET /api/media
   */
  async getBackendMedia() {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/media`);
    if (!response.ok) {
      throw new Error(`Failed to fetch media (Status: ${response.status})`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map(normalizeMedia);
  }

  /**
   * Fetch single media details from backend GET /api/media/<imdb_id>
   */
  async getMediaDetails(mediaId) {
    if (!mediaId || !String(mediaId).trim()) return null;
    const cleanId = String(mediaId).trim();
    const baseUrl = getApiBaseUrl();

    const response = await fetch(`${baseUrl}/api/media/${encodeURIComponent(cleanId)}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch details (Status: ${response.status})`);
    }
    const data = await response.json();
    return normalizeMedia(data);
  }

  /**
   * Search media via backend GET /api/search?q=<query>
   */
  async searchMedia(query = '', mediaType = 'all', genre = 'All') {
    const q = (query || '').trim();
    if (!q) {
      return [];
    }

    const cacheKey = `search_${q.toLowerCase()}_${mediaType}_${genre}`;
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }

    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(q)}`);
    if (!response.ok) {
      throw new Error(`Search failed (Status: ${response.status})`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    let results = data.map(normalizeMedia);

    // Client-side filters for UI convenience if active
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

    this.searchCache.set(cacheKey, results);
    return results;
  }

  /**
   * Get all watchlist items from backend GET /api/watchlist
   */
  async getWatchlist() {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/watchlist`);
    if (!response.ok) {
      throw new Error(`Failed to fetch watchlist (Status: ${response.status})`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map(normalizeMedia);
  }

  /**
   * Add movie to watchlist via backend POST /api/watchlist
   * Request body: { "media_id": "<imdb_id>" }
   */
  async addToWatchlist(mediaId) {
    if (!mediaId || !String(mediaId).trim()) {
      throw new Error('media_id is required');
    }
    const cleanId = String(mediaId).trim();
    const baseUrl = getApiBaseUrl();

    const response = await fetch(`${baseUrl}/api/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ media_id: cleanId }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 201) {
      return { success: true, status: 201, message: data.message || 'Media added to watchlist' };
    }

    if (response.status === 409) {
      return {
        success: false,
        status: 409,
        message: data.error || 'Media already in watchlist',
      };
    }

    if (response.status === 404) {
      throw new Error(data.error || 'Media not found');
    }

    if (response.status === 400) {
      throw new Error(data.error || 'Invalid request');
    }

    throw new Error(data.error || `Failed to add to watchlist (Status: ${response.status})`);
  }

  /**
   * Remove movie from watchlist via backend DELETE /api/watchlist/<media_id>
   */
  async removeFromWatchlist(mediaId) {
    if (!mediaId || !String(mediaId).trim()) {
      throw new Error('media_id is required');
    }
    const cleanId = String(mediaId).trim();
    const baseUrl = getApiBaseUrl();

    const response = await fetch(`${baseUrl}/api/watchlist/${encodeURIComponent(cleanId)}`, {
      method: 'DELETE',
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 200) {
      return { success: true, status: 200, message: data.message || 'Media removed from watchlist' };
    }

    if (response.status === 404) {
      return { success: false, status: 404, message: data.error || 'Media not in watchlist' };
    }

    throw new Error(data.error || `Failed to remove from watchlist (Status: ${response.status})`);
  }
}

export const apiService = new MediaApiService();
