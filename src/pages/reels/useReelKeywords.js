// hooks/useReelKeywords.js
import { useEffect, useState } from 'react';
import { MatchService } from '../../services/matchService';
import { FixtureService } from '../../services/fixture';
import { useNews } from '../../hooks/useNews-test';

export const useReelKeywords = () => {
  const [keywords, setKeywords] = useState([]);
  const { data: newsResponse } = useNews(1, 5); // Top 5 headlines
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collectKeywords = async () => {
      const resultKeywords = new Set();

      try {
        const recent = await MatchService.fetchRecentMatches(4);
        recent.forEach(match => {
          resultKeywords.add(`${match.HomeTeamKey} vs ${match.AwayTeamKey} highlights`);
        });

        const fixtureData = await FixtureService.fetchMatches();
        const now = new Date();
        const upcoming = fixtureData
          .filter(match => new Date(match.DateTime).getTime() > now.getTime())
          .slice(0, 4);

        upcoming.forEach(match => {
          resultKeywords.add(`${match.HomeTeamKey} vs ${match.AwayTeamKey} preview`);
        });

        if (Array.isArray(newsResponse?.articles)) {
          newsResponse.articles.slice(0, 5).forEach(article => {
            if (article.title) {
              resultKeywords.add(article.title);
            }
          });
        }
      } catch (err) {
        console.error('Failed to fetch reel keywords:', err);
      } finally {
        setKeywords([...resultKeywords]);
        setLoading(false);
      }
    };

    collectKeywords();
  }, [newsResponse]);

  return { keywords, loading };
};
