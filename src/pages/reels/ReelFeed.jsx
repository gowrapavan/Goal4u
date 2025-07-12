import React, { useState, useEffect, useRef } from 'react';

const InstaFeeds = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const containerRef = useRef(null);
  const playerRefs = useRef({});

  const reelsData = [
    {
      id: 1,
      type: 'youtube',
      src: 'https://www.youtube.com/embed/tgbNymZ7vqY?enablejsapi=1&controls=1&modestbranding=1&autoplay=0',
    },
    {
      id: 2,
      type: 'instagram',
      src: 'https://www.instagram.com/reel/DILP9NlRHfZ/embed',
    },
    {
      id: 3,
      type: 'youtube',
      src: 'https://www.youtube.com/embed/aqz-KE-bpKQ?enablejsapi=1&controls=1&modestbranding=1&autoplay=0',
    },
    {
      id: 4,
      type: 'instagram',
      src: 'https://www.instagram.com/reel/C6sEbupIhW7/embed',
    },
  ];

  useEffect(() => {
    document.body.classList.add('reels-page');
    return () => document.body.classList.remove('reels-page');
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const reelHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / reelHeight);
      setCurrentReel(newIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimeout = null;

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
    reelsData.forEach((reel, i) => {
      if (reel.type === 'youtube') {
        const iframe = playerRefs.current[reel.id];
        if (iframe && iframe.contentWindow) {
          const command = i === currentReel ? 'playVideo' : 'pauseVideo';
          iframe.contentWindow.postMessage(
            JSON.stringify({
              event: 'command',
              func: command,
              args: [],
            }),
            '*'
          );
        }
      }
    });
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

      <div className="reel-feed-wrapper" ref={containerRef}>
        {reelsData.map((reel, i) => (
          <div key={reel.id} className="reel-slide">
            <div className="reel-content">
              {reel.type === 'youtube' ? (
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
              ) : currentReel === i ? (
                <iframe
                  src={reel.src}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={`reel-${reel.id}`}
                ></iframe>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default InstaFeeds;
