import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchNextReelsBatch } from './reelsFetcher';

const Shorts = () => {
  const [loading, setLoading] = useState(true);
  const [reelsData, setReelsData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentReel, setCurrentReel] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const containerRef = useRef(null);
  const playerRefs = useRef({});

  // Handle mobile detection on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsMuted(!mobile); // unmute if mobile
    };
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Observe current slide
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setCurrentReel(index);
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

  // Play current reel & pause others
  const controlVideoPlayback = () => {
    reelsData.forEach((reel) => {
      const iframe = playerRefs.current[reel.id];
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
      }
    });

    const current = reelsData[currentReel];
    const currentIframe = current && playerRefs.current[current.id];
    if (document.visibilityState === 'visible' && currentIframe?.contentWindow) {
      currentIframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
      currentIframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: isMuted ? 'mute' : 'unMute', args: [] }),
        '*'
      );
    }
  };

  useEffect(() => {
    const delay = setTimeout(controlVideoPlayback, 100);
    return () => clearTimeout(delay);
  }, [currentReel, isMuted]);

  // Handle tab visibility change (pause/resume)
  useEffect(() => {
    const onVisibilityChange = () => {
      const reel = reelsData[currentReel];
      const iframe = reel && playerRefs.current[reel.id];
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: document.visibilityState === 'visible' ? 'playVideo' : 'pauseVideo',
            args: [],
          }),
          '*'
        );
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [currentReel, reelsData]);

  const scrollToReel = (index) => {
    const slide = document.querySelector(`[data-index="${index}"]`);
    if (slide) {
      slide.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleMute = () => setIsMuted((prev) => !prev);

  if (loading) return <LoadingSpinner message="Loading football shorts..." />;

return (
  <>
    {!isMobile && (
      <div className="slide-nav-buttons fixed-buttons">
        <button
          onClick={() => scrollToReel(currentReel - 1)}
          disabled={currentReel === 0}
          className={`arrow-btn ${currentReel === 0 ? "disabled" : ""}`}
        >
          <img
            src="/assets/img/up-arrow.png"
            alt="Up"
            className="nav-arrow"
            style={{ opacity: currentReel === 0 ? 0.25 : 0.75 }}
          />
        </button>

        <button
          onClick={() => scrollToReel(currentReel + 1)}
          disabled={currentReel >= reelsData.length - 1}
          className="arrow-btn"
        >
          <img
            src="/assets/img/down-arrow.png"
            alt="Down"
            className="nav-arrow"
          />
        </button>
      </div>
    )}

    <div className="reel-feed-wrapper" ref={containerRef}>
      {reelsData.map((reel, i) => (
        <div key={reel.id} className="reel-slide" data-index={i}>
          <div className="reel-wrapper-container">
            <div className="reel-wrapper">
              <div className="reel-content">
                <iframe
                  ref={(el) => {
                    if (reel.type === 'youtube') playerRefs.current[reel.id] = el;
                  }}
                  src={reel.src}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={`reel-${reel.id}`}
                />
                <div className="channel-overlay">
                  {reel.logo && <img src={reel.logo} alt="logo" />}
                  <span>{reel.channelName}</span>
                </div>

                {!isMobile && (
                  <button className="mute-toggle-btn" onClick={toggleMute}>
                    {isMuted ? '🔊' : '🔇'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>


      <style>{`
      .fixed-buttons {
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 12px;
        z-index: 1000;
      }

      .arrow-btn:disabled {
        cursor: default;
      }

      .arrow-btn.disabled .nav-arrow {
        pointer-events: none;
      }

        .reel-feed-wrapper {
          height: 100vh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
          background-color: #fff;
        }

        .reel-feed-wrapper::-webkit-scrollbar {
          display: none;
        }

        .reel-slide {
          scroll-snap-align: start;
          height: 90vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .reel-wrapper {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
            transform: translateX(-30px); /* shift video left */

        }
          .reel-wrapper-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          position: relative;
        }


          .slide-nav-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }


        .slide-nav-buttons button {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
        }


        .nav-arrow {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(0, 255, 170, 0.15);
          backdrop-filter: blur(6px);
          border: 2px solid rgba(0, 255, 170, 0.4);
          box-shadow: 0 0 10px rgba(0, 255, 170, 0.6);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .nav-arrow:hover {
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(0, 255, 170, 0.8);
        }
                  .nav-arrow {
          opacity: 0.75; /* 25% visible by default */
          transition: opacity 0.3s ease, transform 0.2s, box-shadow 0.2s;
        }

        .nav-arrow:hover {
          opacity: 1; /* fully visible on hover */
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(0, 255, 170, 0.8);
        }




        .reel-content {
          width: 344px;
          height: 611px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 18px 24px rgba(0, 0, 0, 0.4);
          background: black;
        }

        .reel-content iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .channel-overlay {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: rgba(0, 0, 0, 0.4);
          padding: 5px 10px;
          border-radius: 20px;
          color: white;
          font-size: 14px;
        }

        .channel-overlay img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .mute-toggle-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 18px;
          cursor: pointer;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-60%);
          }
          to {
            opacity: 1;
            transform: translateY(-50%);
          }
        }


        .desktop-only {
          display: flex;
        }

        @media (max-width: 768px) {
          .reel-content {
            width: 100vw;
            height: 97vh;
            border-radius: 0;
            padding-top: 50px;
            box-shadow: none;
          }

          .nav-buttons.desktop-only {
            display: none;
          }

          .channel-overlay {
            top: 6%;
            left: 10px;
            font-size: 15px;
          }

          .mute-toggle-btn {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Shorts;
