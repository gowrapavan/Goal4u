import React, { useState, useEffect } from 'react';
import Video from './Video';
import Shorts from './Shorts';

const InstaFeeds = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className={`instafeeds-container ${isMobile ? 'mobile' : ''}`}>
        {!isMobile && (
          <>
            <div className="video-section">
              <Video />
            </div>
            <div className="shorts-section">
              <Shorts />
            </div>
          </>
        )}

        {isMobile && (
          <div className="shorts-section mobile-only">
            <Shorts />
          </div>
        )}
      </div>

      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100%;
          width: 100%;
          touch-action: pan-y;
        }

        .instafeeds-container {
  display: flex;
  height: calc(100vh - 95px); /* adjust to your actual header height */
  width: 100vw;
  overflow: hidden;
  margin-top: 60px; /* to avoid being under header */
}


        .video-section {
          flex: 6;
          height: 100%;
          overflow-y: auto;
        }

        .shorts-section {
          flex: 2.5;
          height: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          scrollbar-width: none;
        }

        .shorts-section::-webkit-scrollbar {
          display: none;
        }

        /* Mobile view - show only shorts fullscreen */
        @media (max-width: 768px) {
          .instafeeds-container.mobile {
            flex-direction: column;
          }

          .video-section {
            display: none;
          }

          .shorts-section.mobile-only {
            width: 100%;
            height: 100vh;
            overflow-x: scroll;
            overflow-y: hidden;
            white-space: nowrap;
          }
        }
      `}</style>
    </>
  );
};

export default InstaFeeds;
