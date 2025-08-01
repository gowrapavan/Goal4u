import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchNextReelsBatch, maybePrefetchMore } from './reelsFetcher';

// Dummy fallback comments for demonstration
const DUMMY_COMMENTS = [
  {
    author: '@john_doe',
    text: 'Amazing video! 🔥',
    likeCount: 12,
    publishedAt: '2025-07-20T12:00:00Z',
  },
  {
    author: '@footballfan',
    text: 'Love this moment 😍',
    likeCount: 7,
    publishedAt: '2025-07-20T12:01:00Z',
  },
  {
    author: '@soccerlife',
    text: 'Who else is watching in 2025?',
    likeCount: 3,
    publishedAt: '2025-07-20T12:02:00Z',
  },
];

const LOGO_URL = "/assets/img/6.png"; // Change to your logo path

const Shorts = () => {
  const [loading, setLoading] = useState(true);
  const [reelsData, setReelsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentReelIndex, setCommentReelIndex] = useState(null);
  const [liked, setLiked] = useState({});
  const [likeAnimating, setLikeAnimating] = useState({});
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Load first batch of videos
  useEffect(() => {
    const loadInitialBatch = async () => {
      const { newVideos } = await fetchNextReelsBatch();
      setReelsData(prev => [...prev, ...newVideos]);
      setLoading(false);
    };
    loadInitialBatch();
  }, []);

  // Scroll autoplay behavior
  useEffect(() => {
    if (!loading && containerRef.current) {
      const container = containerRef.current;

      const handleScroll = () => {
        const slides = container.querySelectorAll('.reel-slide');
        let activeIndex = -1;

        slides.forEach((slide, idx) => {
          const rect = slide.getBoundingClientRect();
          const iframe = slide.querySelector('iframe');

          if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            activeIndex = idx;
            iframe?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          } else {
            iframe?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        });

        if (activeIndex !== -1) {
          setCurrentIndex(activeIndex);
        }
      };

      container.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [loading]);

  // Optional: prefetch logic
  useEffect(() => {
    maybePrefetchMore(currentIndex);
  }, [currentIndex]);

  // 🚀 Auto-load more videos when last reel is visible
  useEffect(() => {
    const loadMoreIfNeeded = async () => {
      if (currentIndex === reelsData.length - 1) {
        const { newVideos } = await fetchNextReelsBatch();
        setReelsData(prev => [...prev, ...newVideos]);
      }
    };
    loadMoreIfNeeded();
  }, [currentIndex]);

  // Handle comment popup open/close
  const openComments = (idx, e) => {
    if (e) e.stopPropagation();
    setCommentReelIndex(idx);
    setShowComments(true);
    document.body.style.overflow = 'hidden';
  };
  const closeComments = () => {
    setShowComments(false);
    setTimeout(() => setCommentReelIndex(null), 300); // after animation
    document.body.style.overflow = '';
  };

  // Like button logic
  const handleLike = (idx, e) => {
    if (e) e.stopPropagation();
    setLiked(prev => ({ ...prev, [idx]: !prev[idx] }));
    setLikeAnimating(prev => ({ ...prev, [idx]: true }));
    setTimeout(() => {
      setLikeAnimating(prev => ({ ...prev, [idx]: false }));
    }, 600);
  };

  // Get comments for a reel (dummy fallback)
  const getCommentsForReel = reel =>
    Array.isArray(reel?.comments) && reel.comments.length > 0
      ? reel.comments
      : DUMMY_COMMENTS;

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <>
      <div className="shorts-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span className="arrow">←</span>
          <span className="back-text">Back To Home</span>
        </button>
        <div className="shorts-logo-wrap">
  <a href="/">
    <img src={LOGO_URL} alt="Logo" className="shorts-logo" />
  </a>
</div>

      </div>

      <div className="reel-feed-wrapper" ref={containerRef}>
        {reelsData.map((reel, i) => (
          <div key={`${reel.id || reel.videoId || i}-${i}`} className="reel-slide" data-index={i}>
            <iframe
              src={`${reel.src || reel.embedUrl}?enablejsapi=1`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              playsInline
              title={`reel-${reel.id || reel.videoId || i}`}
            />
            <div
              className="reel-actions"
              onClick={e => e.stopPropagation()} // Prevent click-through to video
            >
              <button
                className={`action-btn like-btn${liked[i] ? ' liked' : ''}${likeAnimating[i] ? ' animate' : ''}`}
                title="Like"
                onClick={e => handleLike(i, e)}
                tabIndex={0}
              >
                <span className="action-icon">
                  <svg
                    className={`like-heart-svg${liked[i] ? ' filled' : ''}${likeAnimating[i] ? ' pop' : ''}`}
                    width="32"
                    height="32"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="like-heart"
                      d="M24 42s-1.7-1.5-6.1-5.1C12.2 33.1 6 27.7 6 20.8 6 15.2 10.5 11 16 11c3.1 0 5.6 1.5 7 3.7C24.4 12.5 26.9 11 30 11c5.5 0 10 4.2 10 9.8 0 6.9-6.2 12.3-11.9 16.1C25.7 40.5 24 42 24 42z"
                      stroke="#fff"
                      strokeWidth="2"
                      fill={liked[i] ? "#ff3b5c" : "none"}
                    />
                  </svg>
                </span>
                <span className="action-label">Like</span>
              </button>
              <button
                className="action-btn share-btn"
                title="Share"
                onClick={e => e.stopPropagation()}
                tabIndex={0}
              >
                <span className="action-icon">🔗</span>
                <span className="action-label">Share</span>
              </button>
              <button
                className="action-btn comment-btn"
                title="Comments"
                onClick={e => openComments(i, e)}
                tabIndex={0}
              >
                <span className="action-icon">💬</span>
                <span className="action-label">Comment</span>
              </button>
              {reel.channelLogo && (
                <img
                  src={reel.channelLogo}
                  alt={reel.channelName}
                  className="channel-logo"
                  draggable={false}
                  onClick={e => e.stopPropagation()}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comment Drawer Popup */}
      <div
        className={`comment-popup-backdrop${showComments ? ' open' : ''}`}
        onClick={closeComments}
        style={{ pointerEvents: showComments ? 'auto' : 'none' }}
      >
        <div
          className={`comment-popup-drawer${showComments ? ' open' : ''}`}
          onClick={e => e.stopPropagation()}
        >
          <button className="comment-popup-close" onClick={closeComments} aria-label="Close comments">
            <span>×</span>
          </button>
          <div className="comment-popup-header">
            <span className="comment-popup-title">Comments</span>
          </div>
          <div className="comment-popup-list">
            {commentReelIndex !== null && reelsData[commentReelIndex] ? (
              getCommentsForReel(reelsData[commentReelIndex]).map((c, idx) => (
                <div className="comment-item" key={idx}>
                  <div className="comment-author">{c.author}</div>
                  <div className="comment-text" dangerouslySetInnerHTML={{ __html: c.text }} />
                  <div className="comment-meta">
                    <span className="comment-like">❤️ {c.likeCount || 0}</span>
                    <span className="comment-date">
                      {c.publishedAt
                        ? new Date(c.publishedAt).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="comment-item comment-empty">No comments yet.</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #000;
          overflow: hidden;
        }
        .shorts-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 48px;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .back-btn {
          display: flex;
          align-items: center;
          color: white;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          transition: background 0.2s ease;
        }
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .back-btn .arrow {
          font-size: 20px;
          line-height: 1;
        }
        .back-btn .back-text {
          font-size: 9px;
          line-height: 1;
          padding-top: 5px;
        }
        .shorts-logo-wrap {
          display: flex;
          align-items: center;
          height: 100%;
        }
        .shorts-logo {
          height: 36px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px #0008);
          background: transparent;
          border-radius: 8px;
        }
        .reel-feed-wrapper {
          position: fixed;
          top: 2.5%;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          background-color: #000;
        }
        .reel-feed-wrapper::-webkit-scrollbar {
          display: none;
        }
        .reel-slide {
          scroll-snap-align: start;
          height: calc(100vh - 20px);
          width: 100vw;
          position: relative;
          overflow: hidden;
        }
        .reel-slide iframe {
          width: 100%;
          height: 100%;
          border: none;
          object-fit: cover;
        }
        .reel-actions {
          position: absolute;
          right: 10px;
          bottom: 60px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          align-items: center;
          z-index: 2;
        }
        .action-btn {
          background: rgba(30,30,30,0.7);
          border: none;
          color: white;
          font-size: 22px;
          padding: 0;
          border-radius: 50%;
          cursor: pointer;
          width: 48px;
          height: 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: background 0.18s;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.12);
          position: relative;
          outline: none;
        }
        .action-btn:active {
          background: rgba(255,255,255,0.18);
        }
        .action-btn:focus {
          outline: 2px solid #33ffc9;
        }
        .action-icon {
          font-size: 24px;
          display: block;
          margin-bottom: 2px;
        }
        .like-btn .action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .like-heart-svg {
          width: 28px;
          height: 28px;
          display: block;
          transition: transform 0.18s cubic-bezier(.4,0,.2,1);
          filter: drop-shadow(0 2px 8px #0008);
        }
        .like-heart {
          transition: fill 0.25s cubic-bezier(.4,0,.2,1), stroke 0.18s;
        }
        .like-btn.liked .like-heart {
          fill: #ff3b5c;
          stroke: #ff3b5c;
        }
        .like-btn .like-heart {
          fill: none;
          stroke: #fff;
        }
        .like-btn.liked .like-heart-svg {
          animation: like-pop 0.6s cubic-bezier(.4,0,.2,1);
        }
        .like-btn.animate .like-heart-svg {
          animation: like-pop 0.6s cubic-bezier(.4,0,.2,1);
        }
        @keyframes like-pop {
          0% { transform: scale(1);}
          20% { transform: scale(1.3);}
          40% { transform: scale(0.95);}
          60% { transform: scale(1.1);}
          80% { transform: scale(0.98);}
          100% { transform: scale(1);}
        }
        .action-label {
          font-size: 10px;
          color: #fff;
          opacity: 0.7;
          font-weight: 400;
          letter-spacing: 0.01em;
          margin-top: 0;
          margin-bottom: 0;
          line-height: 1;
        }
        .share-btn .action-icon { color: #00bfff; }
        .comment-btn .action-icon { color: #fff; }
        .channel-logo {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: contain;
          background: white;
          margin-top: 10px;
          border: 2px solid #fff2;
        }

        /* Comment Popup Drawer */
        .comment-popup-backdrop {
          position: fixed;
          left: 0; top: 0; right: 0; bottom: 0;
          z-index: 100;
          background: rgba(0,0,0,0.0);
          opacity: 0;
          transition: opacity 0.25s;
          pointer-events: none;
        }
        .comment-popup-backdrop.open {
          background: rgba(0,0,0,0.45);
          opacity: 1;
          pointer-events: auto;
        }
        .comment-popup-drawer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          max-width: 480px;
          margin: 0 auto;
          background: #181818;
          border-radius: 18px 18px 0 0;
          min-height: 40vh;
          max-height: 70vh;
          box-shadow: 0 -4px 32px 0 rgba(0,0,0,0.18);
          transform: translateY(100%);
          transition: transform 0.28s cubic-bezier(.4,0,.2,1);
          z-index: 101;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .comment-popup-drawer.open {
          transform: translateY(0);
        }
        .comment-popup-close {
          position: absolute;
          top: 10px;
          right: 18px;
          background: none;
          border: none;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
          z-index: 2;
          opacity: 0.7;
          transition: opacity 0.15s;
        }
        .comment-popup-close:hover { opacity: 1; }
        .comment-popup-header {
          padding: 18px 0 10px 0;
          text-align: center;
          border-bottom: 1px solid #222;
          background: transparent;
        }
        .comment-popup-title {
          color: #fff;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .comment-popup-list {
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 10px 18px 18px 18px;
          background: transparent;
        }
        .comment-item {
          margin-bottom: 18px;
          padding-bottom: 10px;
          border-bottom: 1px solid #232323;
        }
        .comment-item:last-child {
          border-bottom: none;
        }
        .comment-author {
          color: #b3e5fc;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 2px;
        }
        .comment-text {
          color: #fff;
          font-size: 15px;
          margin-bottom: 4px;
          word-break: break-word;
        }
        .comment-meta {
          font-size: 11px;
          color: #aaa;
          display: flex;
          gap: 12px;
        }
        .comment-like {
          color: #d71616ff;
        }
        .comment-date {
          color: #888;
        }
        .comment-empty {
          color: #aaa;
          text-align: center;
          border-bottom: none;
        }

        /* Responsive adjustments */
        @media (max-width: 600px) {
          .shorts-header {
            padding: 0 8px;
          }
          .shorts-logo {
            height: 28px;
          }
          .comment-popup-drawer {
            max-width: 100vw;
            min-height: 45vh;
            max-height: 80vh;
            border-radius: 16px 16px 0 0;
          }
          .comment-popup-header {
            padding: 14px 0 8px 0;
          }
          .comment-popup-list {
            padding: 8px 10px 14px 10px;
          }
        }
        @media (max-width: 400px) {
          .comment-popup-drawer {
            min-height: 55vh;
          }
        }
      `}</style>
    </>
  );
};

export default Shorts;
