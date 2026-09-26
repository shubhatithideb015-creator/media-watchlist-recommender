// js/services/recommendationEngine.js
// Groups backend recommendations into Netflix-style rows.

import { store } from '../state/store.js';

function bySection(recommendations, section) {
  return recommendations.filter((rec) => rec.section === section && rec.media);
}

/**
 * Split ranked recs into Top Picks / Because You Watched / Because You Like.
 * Falls back to slices of the ranked list if section tags are missing.
 */
export function groupRecommendationSections(recommendations = []) {
  const recs = (recommendations || []).filter((rec) => rec && rec.media);

  const topPicks = bySection(recs, 'top_picks');
  const becauseWatched = bySection(recs, 'because_you_watched');
  const becauseLike = bySection(recs, 'because_you_like');

  if (topPicks.length || becauseWatched.length || becauseLike.length) {
    return { topPicks, becauseWatched, becauseLike };
  }

  return {
    topPicks: recs.slice(0, 5),
    becauseWatched: recs.slice(5, 10),
    becauseLike: recs.slice(10, 15),
  };
}

class RecommendationEngine {
  getHomeRecommendationSections() {
    return groupRecommendationSections(store.getState().recommendations || []);
  }

  getMatchViewRecommendations() {
    const { topPicks, becauseWatched, becauseLike } =
      this.getHomeRecommendationSections();

    const toMedia = (rec) => ({
      ...rec.media,
      matchScore: rec.score != null ? Math.round(rec.score * 100) : null,
      matchReason: rec.reason || '',
    });

    const topMatchesList = topPicks.map(toMedia);
    const fallback = store.getState().mediaList[0] || {
      id: '',
      title: 'Add titles to your Watchlist',
      matchScore: 0,
      matchReason: 'Save a title to unlock matches',
      poster: '',
      backdrop: '',
      year: '',
      genres: [],
      duration: '',
    };
    const primaryTopMatch = topMatchesList[0] || fallback;

    return {
      topMatch: primaryTopMatch,
      topMatchesList: topMatchesList.length > 0 ? topMatchesList : [primaryTopMatch],
      hiddenGems: becauseWatched.map(toMedia),
      somethingDifferent: becauseLike.map(toMedia),
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
