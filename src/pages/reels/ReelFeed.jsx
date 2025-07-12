import React, { useState, useEffect, useRef } from 'react';
import { fetchYouTubeShorts } from './youtube.service'; // Update path if needed

const InstaFeeds = ({ keywords = [] }) => {
  const [reelsData, setReelsData] = useState([]);
  const [currentReel, setCurrentReel] = useState(0);
  const [nextPageToken, setNextPageToken] = useState(undefined);
  const containerRef = useRef(null);
  const playerRefs = useRef({});
  const keywordIndex = useRef(0);

  const getQuery = () => {
    if (keywords.length > 0 && keywordIndex.current < keywords.length) {
      return `${keywords[keywordIndex.current++]} match highlights`;
    }
    return 'recent football match highlights'; // default fallback
  };

  const loadMoreReels = async (pageToken) => {
    const query = getQuery();
    const response = await fetchYouTubeShorts(query, pageToken);
    const newVideos = response.items.map((item, index) => ({
      id: `${item.id.videoId}-${Date.now()}-${index}`,
      type: 'youtube',
      src: `https://www.youtube.com/embed/${item.id.videoId}?enablejsapi=1&controls=1&modestbranding=1&autoplay=0`,
    }));

    setReelsData((prev) => [...prev, ...newVideos]);
    setNextPageToken(response.nextPageToken);
  };

  useEffect(() => {
    loadMoreReels(); // Initial load
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const reelHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / reelHeight);
      setCurrentReel(newIndex);

      if (newIndex >= reelsData.length - 5 && nextPageToken) {
        loadMoreReels(nextPageToken); // Preload next 5
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [reelsData, nextPageToken]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimeout;

    const handleWheel = (e) => {
      e.preventDefault();
      if (isScrolling) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(reelsData.length - 1, currentReel + direction));

      if (newIndex !== currentReel) {
        isScrolling = true;
        container.scrollTo({
          top: newIndex * window.innerHeight,
          behavior: 'smooth',
        });

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 800);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, [currentReel, reelsData.length]);

  useEffect(() => {
    // Pause and mute all
    reelsData.forEach((reel) => {
      const iframe = playerRefs.current[reel.id];
      if (reel.type === 'youtube' && iframe?.contentWindow) {
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

    // Play and unmute only current
    const current = reelsData[currentReel];
    const currentIframe = current && playerRefs.current[current.id];
    if (current?.type === 'youtube' && currentIframe?.contentWindow) {
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
  }, [currentReel]);

  return (
    <>
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
          background: #fff;
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

      <div className="reel-feed-wrapper reels-page" ref={containerRef}>
        {reelsData.map((reel, i) => (
          <div key={reel.id} className="reel-slide">
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
    </>
  );
};

export default InstaFeeds;
