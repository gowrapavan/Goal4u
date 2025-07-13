import React, { useState, useEffect, useRef } from 'react';
import { fetchYouTubeShorts } from './youtube.service';
import { MatchService } from '../../services/matchService';
import { FixtureService } from '../../services/fixture';
import { useNews } from '../../hooks/useNews-test';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);
const MAX_KEYWORD_ATTEMPTS = 6;

const InstaFeeds = () => {
  const [keywords, setKeywords] = useState([]);
  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const [reelsData, setReelsData] = useState([]);
  const [currentReel, setCurrentReel] = useState(0);
  const [nextPageToken, setNextPageToken] = useState(undefined);
  const containerRef = useRef(null);
  const playerRefs = useRef({});
  const keywordIndex = useRef(0);
  const { data: newsResponse } = useNews(1, 5);

  const collectKeywords = async () => {
    const resultKeywords = new Set();

    try {
      const recent = await MatchService.fetchRecentMatches(5);
      recent.forEach(match => {
        const key = `${match.HomeTeamKey} vs ${match.AwayTeamKey}`;
        resultKeywords.add(`${key} highlights`);
        resultKeywords.add(`${key} full match`);
        resultKeywords.add(`${key} review`);
      });

      const fixtureData = await FixtureService.fetchMatches();
      const now = new Date();
      const futureFixtures = fixtureData.filter(match => new Date(match.DateTime) > now).slice(0, 10);
      futureFixtures.forEach(match => {
        const key = `${match.HomeTeamKey} vs ${match.AwayTeamKey}`;
        resultKeywords.add(`${key} preview`);
        resultKeywords.add(`${key} match prediction`);
        resultKeywords.add(`${key} live stream`);
        resultKeywords.add(`${key} expected lineup`);
        resultKeywords.add(`${key} watch live`);
        resultKeywords.add(`${key} analysis`);
      });

      if (Array.isArray(newsResponse?.articles)) {
        newsResponse.articles.slice(0, 10).forEach(article => {
          if (article.title) resultKeywords.add(article.title);
        });
      }
    } catch (err) {
      console.error('Keyword fetch failed:', err);
    } finally {
      const defaultKeywords = [
        'latest football shorts 2025',
        'football match goals July 2025',
        'Messi highlights 2025',
        'Ronaldo 2025 goals',
        'EURO 2024 moments',
        'football shorts today',
        'ucl highlights 2025',
      ];

      const keywordArray = shuffleArray([
        ...resultKeywords.size ? resultKeywords : defaultKeywords
      ]);

      setKeywords(keywordArray);
      setLoadingKeywords(false);
    }
  };

  const getQuery = () => {
    if (keywords.length > 0 && keywordIndex.current < keywords.length) {
      return `${keywords[keywordIndex.current++]} football`;
    }
    return 'top football goals 2025';
  };

  const loadMoreReels = async (pageToken) => {
    let attempts = 0;
    let newVideos = [];

    while (attempts < MAX_KEYWORD_ATTEMPTS && newVideos.length === 0) {
      const query = getQuery();
      const response = await fetchYouTubeShorts(query, pageToken);

      if (!response || !Array.isArray(response.items) || response.items.length === 0) {
        console.warn(`No results for query: "${query}"`);
        attempts++;
        continue;
      }

      newVideos = response.items.map((item, index) => ({
        id: `${item.id.videoId}-${Date.now()}-${index}`,
        type: 'youtube',
        src: `https://www.youtube.com/embed/${item.id.videoId}?enablejsapi=1&controls=1&modestbranding=1&autoplay=0`,
      }));
      setNextPageToken(response.nextPageToken);
    }

    if (newVideos.length > 0) {
      setReelsData(prev => [...prev, ...newVideos]);
    } else {
      console.warn('❌ No reels found after trying multiple queries.');
    }
  };

  useEffect(() => {
    collectKeywords();
  }, [newsResponse]);

  useEffect(() => {
    if (!loadingKeywords) loadMoreReels();
  }, [loadingKeywords]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setCurrentReel(index);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.75,
      }
    );

    const slides = document.querySelectorAll('.reel-slide');
    slides.forEach(slide => observer.observe(slide));

    return () => {
      slides.forEach(slide => observer.unobserve(slide));
    };
  }, [reelsData]);

  useEffect(() => {
    const controlVideoPlayback = () => {
      reelsData.forEach((reel) => {
        const iframe = playerRefs.current[reel.id];
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'pauseVideo',
            args: [],
          }), '*');
          iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'mute',
            args: [],
          }), '*');
        }
      });

      const current = reelsData[currentReel];
      const currentIframe = current && playerRefs.current[current.id];
      if (document.visibilityState === 'visible' && currentIframe?.contentWindow) {
        currentIframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'playVideo',
          args: [],
        }), '*');
        currentIframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'unMute',
          args: [],
        }), '*');
      }
    };

    const delay = setTimeout(() => controlVideoPlayback(), 100);
    return () => clearTimeout(delay);
  }, [currentReel]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const reel = reelsData[currentReel];
        const iframe = reel && playerRefs.current[reel.id];
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'playVideo',
            args: [],
          }), '*');
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [currentReel, reelsData]);

  if (loadingKeywords) return <LoadingSpinner message="Fetching recommended reels..." />;

  if (!loadingKeywords && reelsData.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontSize: '18px' }}>
        😔 No reels found. Try refreshing later.
        <br />
        <button onClick={() => loadMoreReels()} style={{ marginTop: 20, padding: '10px 20px' }}>
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="reel-feed-wrapper reels-page" ref={containerRef}>
        {reelsData.map((reel, i) => (
          <div key={reel.id} className="reel-slide" data-index={i}>
            <div className="reel-content">
              <iframe
                ref={(el) => {
                  if (reel.type === 'youtube') {
                    playerRefs.current[reel.id] = el;
                  }
                }}
                src={reel.src}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title={`reel-${reel.id}`}
              ></iframe>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .reels-page {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: #fff;
        }
        .reel-feed-wrapper {
          height: 90vh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
        }
        .reel-feed-wrapper::-webkit-scrollbar {
          display: none;
        }
        .reel-slide {
          height: 90vh;
          scroll-snap-align: start;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .reel-content {
          width: 360px;
          height: 640px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        @media (max-width: 768px) {
          .reel-content {
            width: 100vw;
            height: 88vh;
            border-radius: 0;
            box-shadow: none;
            margin-top: 50px;
            margin-bottom: 50px;
          }
        }
      `}</style>
    </>
  );
};

export default InstaFeeds;
