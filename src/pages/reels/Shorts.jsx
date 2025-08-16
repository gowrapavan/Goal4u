import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchNextReelsBatch, maybePrefetchMore, findVideoById } from './reelsFetcher';
import ShareButton from './SharePopup';
import './shorts.css';

const DUMMY_COMMENTS = [
  { author: '@john_doe', text: 'Amazing video! 🔥', likeCount: 12, publishedAt: '2025-07-20T12:00:00Z' },
  { author: '@footballfan', text: 'Love this moment 😍', likeCount: 7, publishedAt: '2025-07-20T12:01:00Z' },
  { author: '@soccerlife', text: 'Who else is watching in 2025?', likeCount: 3, publishedAt: '2025-07-20T12:02:00Z' },
];
if (typeof window !== 'undefined') {
  const { pathname } = window.location;
  if (/^\/shorts\/[^/]+$/.test(pathname)) {
    // Force redirect to /shorts on full page reload (not navigation)
    if (performance?.navigation?.type === 1 || performance?.getEntriesByType('navigation')[0]?.type === 'reload') {
      window.location.replace('/shorts');
    }
  }
}

const LOGO_URL = "/assets/img/favicon.ico";

const Shorts = () => {
  const [loading, setLoading] = useState(true);
  const [reelsData, setReelsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentReelIndex, setCommentReelIndex] = useState(null);
  const [liked, setLiked] = useState({});
  const [likeAnimating, setLikeAnimating] = useState({});
  const [playingIndex, setPlayingIndex] = useState(null); // index of currently playing reel
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { videoId: videoIdFromUrl } = useParams();
    useEffect(() => {
    const isShortsWithId = /^\/shorts\/[^/]+$/.test(location.pathname);
    const navEntries = performance.getEntriesByType('navigation');
    const isReload =
      performance?.navigation?.type === 1 || // legacy
      navEntries[0]?.type === 'reload'; // modern

    if (isShortsWithId && isReload) {
      navigate('/shorts', { replace: true });
    }
  }, [location]);

  // --- 1. Initial Reel Selection (on Page Load or Refresh) ---
  useEffect(() => {
    const initializeShorts = async () => {
      const { newVideos } = await fetchNextReelsBatch();
      let finalData = [...newVideos];

      if (videoIdFromUrl) {
        // Find the requested reel
        const foundIndex = finalData.findIndex(video => video.videoId === videoIdFromUrl);
        if (foundIndex !== -1) {
          // Place the requested reel at index 0, shuffle the rest
          const requested = finalData[foundIndex];
          const rest = finalData.filter((_, idx) => idx !== foundIndex);
          for (let i = rest.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rest[i], rest[j]] = [rest[j], rest[i]];
          }
          finalData = [requested, ...rest];
          setReelsData(finalData);
          setCurrentIndex(0);
          setPlayingIndex(null); // Don't autoplay
          setTimeout(() => {
            const slide = containerRef.current?.querySelector('.reel-slide[data-index="0"]');
            if (slide) slide.scrollIntoView({ behavior: 'auto', block: 'center' });
          }, 200);
        } else {
          // Try to fetch individually if not found
          try {
            const foundVideo = await findVideoById(videoIdFromUrl);
            if (foundVideo) {
              for (let i = finalData.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [finalData[i], finalData[j]] = [finalData[j], finalData[i]];
              }
              finalData = [foundVideo, ...finalData];
              setReelsData(finalData);
              setCurrentIndex(0);
              setPlayingIndex(null);
              setTimeout(() => {
                const slide = containerRef.current?.querySelector('.reel-slide[data-index="0"]');
                if (slide) slide.scrollIntoView({ behavior: 'auto', block: 'center' });
              }, 200);
            } else {
              setReelsData(finalData);
            }
          } catch (err) {
            setReelsData(finalData);
          }
        }
      } else {
        // No videoId: pick random as first, shuffle rest
        const randomIndex = Math.floor(Math.random() * finalData.length);
        const randomVideo = finalData[randomIndex];
        const rest = finalData.filter((_, idx) => idx !== randomIndex);
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rest[i], rest[j]] = [rest[j], rest[i]];
        }
        finalData = [randomVideo, ...rest];
        setReelsData(finalData);
        setCurrentIndex(0);
        setPlayingIndex(null);
        setTimeout(() => {
          const slide = containerRef.current?.querySelector('.reel-slide[data-index="0"]');
          if (slide) slide.scrollIntoView({ behavior: 'auto', block: 'center' });
        }, 200);
      }
      setLoading(false);
    };
    initializeShorts();
  }, [videoIdFromUrl, navigate]);

  // --- 2. Scroll/Play/Pause Control with Autoplay on Scroll ---
  useEffect(() => {
    if (!loading && containerRef.current && reelsData.length > 0) {
      const container = containerRef.current;
      let scrollTimeout;

      const disableIframePointerEvents = () => {
        const iframes = container.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          iframe.style.pointerEvents = 'none';
        });
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          iframes.forEach(iframe => {
            iframe.style.pointerEvents = 'auto';
          });
        }, 300);
      };

      const handleScroll = () => {
        disableIframePointerEvents();

        const slides = container.querySelectorAll('.reel-slide');
        let maxVisibility = 0;
        let bestIndex = -1;

        slides.forEach((slide, idx) => {
          const rect = slide.getBoundingClientRect();
          const visibleHeight = Math.max(0, Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top));
          if (visibleHeight > maxVisibility) {
            maxVisibility = visibleHeight;
            bestIndex = idx;
          }
        });

        // Autoplay the most visible reel, pause others
        slides.forEach((slide, idx) => {
          const iframe = slide.querySelector('iframe');
          if (idx === bestIndex) {
            iframe?.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
              '*'
            );
          } else {
            iframe?.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
              '*'
            );
          }
        });

        // Update URL and Helmet metadata for the most visible reel
        if (bestIndex !== -1) {
          const currentReel = reelsData[bestIndex];
          const currentVideoId = currentReel?.videoId;
          if (currentVideoId) {
            const newUrl = `/shorts/${currentVideoId}`;
            const currentUrl = location.pathname + location.search;
            if (currentUrl !== newUrl) {
              window.history.replaceState({}, '', newUrl);
            }
          }
          if (bestIndex !== currentIndex) {
            setCurrentIndex(bestIndex);
          }
        }
      };

      container.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => {
        container.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout);
      };
    }
  }, [loading, reelsData, location, currentIndex]);

  // --- 3. Prefetch logic ---
  useEffect(() => {
    maybePrefetchMore(currentIndex);
  }, [currentIndex]);

  // --- 4. Auto-load more videos when last reel is visible ---
  useEffect(() => {
    const loadMoreIfNeeded = async () => {
      if (currentIndex === reelsData.length - 1) {
        const { newVideos } = await fetchNextReelsBatch();
        setReelsData(prev => [...prev, ...newVideos]);
      }
    };
    loadMoreIfNeeded();
  }, [currentIndex, reelsData.length]);

  // --- 5. Comment popup open/close ---
  const openComments = (idx, e) => {
    if (e) e.stopPropagation();
    setCommentReelIndex(idx);
    setShowComments(true);
    document.body.style.overflow = 'hidden';
  };
  const closeComments = () => {
    setShowComments(false);
    setTimeout(() => setCommentReelIndex(null), 300);
    document.body.style.overflow = '';
  };

  // --- 6. Like button logic ---
  const handleLike = (idx, e) => {
    if (e) e.stopPropagation();
    setLiked(prev => ({ ...prev, [idx]: !prev[idx] }));
    setLikeAnimating(prev => ({ ...prev, [idx]: true }));
    setTimeout(() => {
      setLikeAnimating(prev => ({ ...prev, [idx]: false }));
    }, 600);
  };

  // --- 7. Play button logic ---
  const handlePlay = (idx, e) => {
    if (e) e.stopPropagation();
    setPlayingIndex(idx);
    setTimeout(() => {
      const slides = containerRef.current?.querySelectorAll('.reel-slide');
      slides?.forEach((slide, i) => {
        const iframe = slide.querySelector('iframe');
        if (i === idx) {
          iframe?.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
            '*'
          );
        } else {
          iframe?.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
            '*'
          );
        }
      });
    }, 100);
  };

  // --- 8. Get comments for a reel (dummy fallback) ---
  const getCommentsForReel = reel =>
    Array.isArray(reel?.comments) && reel.comments.length > 0
      ? reel.comments
      : DUMMY_COMMENTS;

  if (loading) return <LoadingSpinner message="Loading..." />;
  function formatLikeCount(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  }

  // --- 9. Dynamic Helmet metadata ---
  const activeReel = reelsData[currentIndex] || {};
  const currentTitle = activeReel.title || "Goal4U – Watch Football Highlights & Shorts";
  const currentThumbnail = activeReel.thumbnail || "/default-thumb.jpg";
  const currentVideoId = activeReel.videoId;
  const currentUrl = `https://goal4u.netlify.app/shorts/${currentVideoId || ""}`;

  return (
    <>
      <Helmet>
        <title>{currentTitle}</title>
        <meta name="description" content={`Watch: ${currentTitle}`} />
        <meta name="keywords" content="football, shorts, reels, highlights, real madrid, mbappe, messi, haaland, goals, goal4u" />
        <meta name="author" content="Goal4U" />
        <meta property="og:title" content={currentTitle} />
        <meta property="og:description" content={`Watch: ${currentTitle}`} />
        <meta property="og:image" content={currentThumbnail} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="video.other" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentTitle} />
        <meta name="twitter:description" content={`Watch: ${currentTitle}`} />
        <meta name="twitter:image" content={currentThumbnail} />
        {activeReel && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoObject",
              "name": currentTitle,
              "description": `Watch: ${currentTitle}`,
              "thumbnailUrl": currentThumbnail,
              "uploadDate": activeReel.uploadDate || new Date().toISOString(),
              "contentUrl": activeReel.src || activeReel.embedUrl,
              "embedUrl": activeReel.embedUrl,
              "publisher": {
                "@type": "Organization",
                "name": "Goal4U",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://goal4u.netlify.app/logo.png"
                }
              }
            })}
          </script>
        )}
      </Helmet>

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
            key={reel.videoId}
            className={`reel-slide${i === currentIndex ? ' active' : ''}`}
            data-index={i}
            style={i === currentIndex ? { outline: '2px solid #ff3b5c' } : {}}
          >
            <div className="reel-video-wrap" style={{ position: 'relative', width: '100%', height: '100%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${reel.videoId}?enablejsapi=1&controls=1&modestbranding=1&autoplay=0`}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                playsInline
                title={`reel-${reel.videoId}`}
                style={{ width: '100%', height: '100%' }}
              />
           
            </div>
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
                <p className="action-label">{formatLikeCount(reel.likeCount)}</p>
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
              <ShareButton videoId={reel.videoId} />
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
