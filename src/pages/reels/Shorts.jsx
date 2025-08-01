import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchNextReelsBatch, maybePrefetchMore, findVideoById } from './reelsFetcher';
import ShareButton from './SharePopup'; // adjust path if needed

import './shorts.css'
// Dummy fallback comments for demonstration

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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- 1. Handle video param from URL ---
  useEffect(() => {
    const handleVideoFromUrl = async () => {
      const videoIdFromUrl = searchParams.get('video');
      if (!videoIdFromUrl) return;

      // First check if video is already in loaded data
      if (reelsData.length > 0) {
        const idx = reelsData.findIndex(
          v => {
            const videoId = v.videoId || (v.id && v.id.split('-')[0]);
            return videoId === videoIdFromUrl;
          }
        );
        
        if (idx !== -1) {
          setCurrentIndex(idx);
          setTimeout(() => {
            const slide = containerRef.current?.querySelector(`.reel-slide[data-index="${idx}"]`);
            if (slide) {
              slide.scrollIntoView({ behavior: 'auto', block: 'start' });
              // Autoplay the video
              const iframe = slide.querySelector('iframe');
              iframe?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            }
          }, 300);
          return;
        }
      }

      // If video not found in loaded data, search in all available videos
      try {
        const foundVideo = await findVideoById(videoIdFromUrl);
        if (foundVideo) {
          // Add the found video to the beginning of reelsData
          setReelsData(prev => {
            // Check if video is already in the list to avoid duplicates
            const exists = prev.some(v => {
              const videoId = v.videoId || (v.id && v.id.split('-')[0]);
              return videoId === videoIdFromUrl;
            });
            
            if (!exists) {
              return [foundVideo, ...prev];
            }
            return prev;
          });
          
          // Set current index to 0 (the newly added video)
          setCurrentIndex(0);
          
          setTimeout(() => {
            const slide = containerRef.current?.querySelector(`.reel-slide[data-index="0"]`);
            if (slide) {
              slide.scrollIntoView({ behavior: 'auto', block: 'start' });
              // Autoplay the video
              const iframe = slide.querySelector('iframe');
              iframe?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            }
          }, 300);
        }
      } catch (error) {
        console.error('Error finding video by ID:', error);
      }
    };

    handleVideoFromUrl();
  }, [reelsData, searchParams]);

  // --- 2. Load first batch of videos ---
  useEffect(() => {
    const loadInitialBatch = async () => {
      const { newVideos } = await fetchNextReelsBatch();
      setReelsData(prev => [...prev, ...newVideos]);
      setLoading(false);
    };
    loadInitialBatch();
  }, []);

  // --- 3. Scroll autoplay behavior ---
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
          const currentReel = reelsData[activeIndex];
          const currentVideoId = currentReel?.videoId || (currentReel?.id && currentReel.id.split('-')[0]);
          
          // Update URL with current video ID
          if (currentVideoId) {
            const newUrl = `/shorts?video=${currentVideoId}`;
            const currentUrl = location.pathname + location.search;
            if (currentUrl !== newUrl) {
              window.history.replaceState(null, '', newUrl);
            }
          }
          
          setCurrentIndex(activeIndex);
        }

      };

      container.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [loading, reelsData, location]);

  // --- 4. Prefetch logic ---
  useEffect(() => {
    maybePrefetchMore(currentIndex);
  }, [currentIndex]);

  // --- 5. Auto-load more videos when last reel is visible ---
  useEffect(() => {
    const loadMoreIfNeeded = async () => {
      if (currentIndex === reelsData.length - 1) {
        const { newVideos } = await fetchNextReelsBatch();
        setReelsData(prev => [...prev, ...newVideos]);
      }
    };
    loadMoreIfNeeded();
  }, [currentIndex]);


  // --- 7. Comment popup open/close ---
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

  // --- 8. Like button logic ---
  const handleLike = (idx, e) => {
    if (e) e.stopPropagation();
    setLiked(prev => ({ ...prev, [idx]: !prev[idx] }));
    setLikeAnimating(prev => ({ ...prev, [idx]: true }));
    setTimeout(() => {
      setLikeAnimating(prev => ({ ...prev, [idx]: false }));
    }, 600);
  };

  // --- 9. Get comments for a reel (dummy fallback) ---
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
          <div
            key={`${reel.id || reel.videoId || i}-${i}`}
            className={`reel-slide${i === currentIndex ? ' active' : ''}`}
            data-index={i}
            style={i === currentIndex ? { outline: '2px solid #ff3b5c' } : {}}
          >
            <iframe
              src={`${reel.src || reel.embedUrl}?enablejsapi=1`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              playsInline
              title={`reel-${reel.id || reel.videoId || i}`}
            />
            <div
              className="reel-actions"
              onClick={e => e.stopPropagation()}
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

              <ShareButton videoId={reel.videoId} />

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

    </>
  );
};

export default Shorts;
