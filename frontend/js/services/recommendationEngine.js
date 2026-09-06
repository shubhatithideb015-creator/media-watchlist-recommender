// js/services/recommendationEngine.js
// Dynamic algorithmic recommendation engine for CinemaMatch

import { CURATED_MEDIA } from '../data/curatedMedia.js';
import { store } from '../state/store.js';

class RecommendationEngine {
  /**
   * Get personalized recommendations structured for the Match view (Screenshot 5)
   */
  getMatchViewRecommendations() {
    const media = store.getState().mediaList;

    // 1. Top Match (Featured large carousel card)
    const topMatches = media.filter(m => m.isTopMatch || m.matchScore >= 98);
    const primaryTopMatch = topMatches[0] || media.find(m => m.id === 'neon-shadows') || media[0];

    // 2. Hidden Gems (4 items with specific comparison tags)
    const hiddenGems = media.filter(m => m.isHiddenGem || (m.rating >= 4.5 && m.rating <= 4.8 && !m.isHero)).slice(0, 4);

    // 3. Something Different (Comfort Zone & Pacing Shift)
    const somethingDifferent = media.filter(m => m.isSomethingDifferent || m.categoryBadge).slice(0, 2);

    return {
      topMatch: primaryTopMatch,
      topMatchesList: topMatches.length > 0 ? topMatches : [primaryTopMatch],
      hiddenGems,
      somethingDifferent
    };
  }

  /**
   * Get Home recommendations: "Recommended for You" and "Because you liked [X]"
   */
  getHomeRecommendations() {
    const media = store.getState().mediaList;

    const hero = media.find(m => m.isHero) || media[0];
    const continueWatching = media.find(m => m.continueWatching) || media[1];
    const topToday = media.find(m => m.rankToday) || media[2];

    const recommendedForYou = media.filter(m => 
      !m.isHero && !m.continueWatching && !m.rankToday && m.id !== 'interstellar-echoes'
    ).slice(0, 6);

    const becauseYouLikedInterstellar = media.filter(m => 
      m.genres.includes('Sci-Fi') && m.id !== hero.id && !m.continueWatching
    ).slice(0, 4);

    return {
      hero,
      continueWatching,
      topToday,
      recommendedForYou,
      becauseYouLikedInterstellar
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
