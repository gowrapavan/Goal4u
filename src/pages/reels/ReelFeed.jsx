import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchNextReelsBatch } from './reelsFetcher'; // ← Use updated batching fetcher

const InstaFeeds = () => {
  const [loading, setLoading] = useState(true);
  const [reelsData, setReelsData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentReel, setCurrentReel] = useState(0);
  const containerRef = useRef(null);
  const playerRefs = useRef({});

  const loadInitialBatch = async () => {
    setLoading(true);
    const { newVideos, hasMore } = await fetchNextReelsBatch();
    setReelsData(newVideos);
    setHasMore(hasMore);
    setLoading(false);
  };

  const loadMoreBatch = async () => {
    if (!hasMore) return;
    const { newVideos, hasMore: moreLeft } = await fetchNextReelsBatch();
    setReelsData((prev) => [...prev, ...newVideos]);
    setHasMore(moreLeft);
  };

  useEffect(() => {
    loadInitialBatch();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setCurrentReel(index);

            // 🧠 Trigger load more when near the end
            if (index >= reelsData.length - 5 && hasMore) {
              loadMoreBatch();
            }
          }
        });
      },
      { root: containerRef.current, threshold: 0.75 }
    );

    const slides = document.querySelectorAll('.reel-slide');
    slides.forEach((slide) => observer.observe(slide));

    return () => slides.forEach((slide) => observer.unobserve(slide));
  }, [reelsData, hasMore]);

  useEffect(() => {
    const controlVideoPlayback = () => {
      reelsData.forEach((reel) => {
        const iframe = playerRefs.current[reel.id];
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
        }
      });

      const current = reelsData[currentReel];
      const currentIframe = current && playerRefs.current[current.id];
      if (document.visibilityState === 'visible' && currentIframe?.contentWindow) {
        currentIframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
        currentIframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
      }
    };

    const delay = setTimeout(controlVideoPlayback, 100);
    return () => clearTimeout(delay);
  }, [currentReel]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const reel = reelsData[currentReel];
      const iframe = reel && playerRefs.current[reel.id];
      if (document.visibilityState === 'visible' && iframe?.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [currentReel, reelsData]);

  if (loading) return <LoadingSpinner message="Loading football shorts..." />;

  return (
    <>
      <div className="reel-feed-wrapper reels-page" ref={containerRef}>
        {reelsData.map((reel, i) => (
          <div key={reel.id} className="reel-slide" data-index={i}>
            <div className="reel-content">
              <iframe
                ref={(el) => {
                  if (reel.type === 'youtube') playerRefs.current[reel.id] = el;
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
          background-image: url('assets/img/demonews.png');
          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
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
