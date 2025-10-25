import React, { useState, useEffect } from "react"; 
import LiveNews from "./LiveNews";
import LiveMatchList from "./LiveMatchList";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";

// --- Provider short codes ---
const PROVIDER_CODES = {
  sportzonline: "sptz",
  Goal4u: "dxx",
    hesgoal: "hes",

  koora10: "ko",
  shahidkoora: "shk",
};
const CODE_TO_PROVIDER = Object.fromEntries(
  Object.entries(PROVIDER_CODES).map(([k, v]) => [v, k])
);

// --- Providers ---
const PROVIDERS = [
  { label: "Sportzonline", keyword: "sportzonline" },
  { label: "Goal4u", keyword: "Goal4u" },
    { label: "hesgoal", keyword: "hesgoal" },

  { label: "Koora10", keyword: "koora10" },
  { label: "Shahid-Koora", keyword: "shahidkoora" },
];

// --- JSON Sources ---
const JSON_MAP = {
  sportzonline: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/sportsonline.json",
  Goal4u: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/Goal4u.json",
  koora10: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/koora10.json",
  shahidkoora: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/shahidkoora.json",
  hesgoal: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/hesgoal.json"

};

// --- Helpers ---
const encode = (str) => btoa(unescape(encodeURIComponent(str)));
const decode = (str) => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return "";
  }
};

const LiveTV = () => {
  const [channelsByProvider, setChannelsByProvider] = useState({});
  const [iframeURL, setIframeURL] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showAdAlert, setShowAdAlert] = useState(false);
  const [selectedStream, setSelectedStream] = useState("Goal4u");

  const location = useLocation();
  const navigate = useNavigate();

  // --- Fetch provider JSON dynamically ---
  const fetchProviderJSON = async (provider, streamCode) => {
    const url = JSON_MAP[provider];
    try {
      const res = await fetch(url);
      const data = await res.json();
      const annotated = data.map((c) => ({ ...c, provider }));
      setChannelsByProvider((prev) => ({ ...prev, [provider]: annotated }));

      if (annotated.length > 0) {
        if (streamCode) {
          const decodedLabel = decode(streamCode);
          const matched = annotated.find(
            (c) => c.label.toLowerCase() === decodedLabel.toLowerCase()
          );
          if (matched) {
            setIframeURL(matched.url);
            return;
          }
        }
        setIframeURL(annotated[0].url);
      }
    } catch (err) {
      setChannelsByProvider((prev) => ({ ...prev, [provider]: [] }));
      setIframeURL("");
    }
  };

  // --- On mount / URL change ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const providerCode = params.get("provider");
    const streamCode = params.get("stream");

    const initialProvider = CODE_TO_PROVIDER[providerCode] || "Goal4u";
    setSelectedStream(initialProvider);

    fetchProviderJSON(initialProvider, streamCode);
  }, [location.search, location.pathname]);

  // --- When selectedStream changes via dropdown ---
  useEffect(() => {
    fetchProviderJSON(selectedStream);
  }, [selectedStream]);

  // --- Resize listener ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Fullscreen ad alert ---
  useEffect(() => {
    const checkFullscreen = () => {
      const isFullscreen =
        document.fullscreenElement || document.webkitFullscreenElement;
      if (!isFullscreen && iframeURL) {
        setShowAdAlert(true);
        setTimeout(() => setShowAdAlert(false), 10000);
      } else {
        setShowAdAlert(false);
      }
    };
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    checkFullscreen();
    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener(
        "webkitfullscreenchange",
        checkFullscreen
      );
    };
  }, [iframeURL]);

  // --- Update URL when iframe changes ---
  useEffect(() => {
    if (!iframeURL || !selectedStream) return;
    const currentChannels = channelsByProvider[selectedStream] || [];
    const matchedChannel = currentChannels.find((c) => c.url === iframeURL);
    if (!matchedChannel) return;

    const providerCode = PROVIDER_CODES[selectedStream];
    const encodedLabel = encode(matchedChannel.label);

    navigate(
      `${location.pathname}?provider=${providerCode}&stream=${encodedLabel}`,
      { replace: true }
    );
  }, [iframeURL, selectedStream, channelsByProvider, navigate, location.pathname]);

  const handleIframeClick = (url) => setIframeURL(url);
  const filteredChannels = channelsByProvider[selectedStream] || [];

  const renderChannelCard = (server) => {
    const isActive = iframeURL === server.url;
    return (
      <div
        key={server.url}
        onClick={() => handleIframeClick(server.url)}
        style={{
          width: "80px",
          height: "100px",
          borderRadius: "10px",
          border: isActive ? "2px solid #33ffc9" : "1px solid #ccc",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          padding: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          fontSize: "12px",
          flexShrink: 0,
        }}
      >
        <img
          src={server.Logo && server.Logo.trim() !== "" ? server.Logo : "/assets/img/6.png"}
          alt={server.label}
          style={{ width: "40px", height: "40px", objectFit: "contain", marginBottom: "6px" }}
        />
        <span>{server.label}</span>
      </div>
    );
  };

  return (
    <>
      <Helmet>
      <title>Live Football Streaming | Goal4U</title>
      <meta
        name="description"
        content="Watch live football matches from around the world including HD channels, sport TV, and more. Stay updated with the latest matches on Goal4U."
      />
      <meta property="og:title" content="Live Football Streaming | Goal4U" />
      <meta
        property="og:description"
        content="Stream live football matches from HD, Brazil, Portugal, and more. All live, all in one place."
      />
      <meta property="og:type" content="video.other" />
      <meta property="og:url" content="https://goal4u.live/livetv" />
      <meta
        property="og:image"
        content="https://goal4u.live/assets/og-thumbnail.jpg"
      />
      <link rel="canonical" href="https://goal4u.live/livetv" />
    </Helmet>
      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: rgba(0, 255, 0, 0.6);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-track {
          background-color: #111;
        }
        .livetv-provider-select {
          padding: 10px 16px;
          border-radius: 6px;
          border: 1px solid #444;
          background: rgba(6, 138, 6, 0.6);
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          min-width: 140px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          appearance: none;
          background-image: url("/assets/img/icon/live.png");
          background-position: right 12px center;
          background-repeat: no-repeat, no-repeat;
          background-size: 16px;
          padding-right: 40px;
        }
        
        .livetv-provider-select:hover {
          background: #238210c5;
          border-color: #555;
        }
        
        .livetv-provider-select:focus {
          border-color: #666;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
        }
        
        .livetv-provider-select option {
          background: #12ac1fff;
          color: #ffffff;
          padding: 8px 12px;
          border: none;
          font-weight: 500;
        }
        
        .livetv-provider-select option:hover {
          background: #333;
        }
        .livetv-channel-label {
          color: #33ffc9;
          font-weight: 700;
          font-size: 1.08rem;
          margin-bottom: 8px;
          margin-right: 12px;
          letter-spacing: 0.5px;
        }
        @media (max-width: 768px) {
          .livetv-provider-select {
            min-width: 120px;
            font-size: 13px;
            padding: 8px 12px;
            padding-right: 36px;
            background-size: 14px;
            background-position: right 10px center;
          }
          .livetv-channel-label {
            margin-bottom: 0;
            margin-right: 8px;
            font-size: 1rem;
          }
        }
      `}</style>

      <div
        style={{
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '20px',
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {/* TV Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '1000px',
              width: '90vw',
            }}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                backgroundColor: '#000',
                border: isMobile ? '9px solid #111' : '12px solid #111',
                borderRadius: isMobile ? '4px' : '18px',
                boxShadow: isMobile
                  ? '0 7px 32px rgba(21, 116, 29, 0.7)'
                  : '0 10px 40px rgba(21, 116, 29, 0.7)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Alert inside video */}
              {showAdAlert && (
                <div
                  style={{
                    position: 'absolute',
                    top: isMobile ? '6px' : '12px',
                    left: isMobile ? '6px' : '12px',
                    backgroundColor: '#e6fff3',
                    color: '#105e2e',
                    padding: isMobile ? '4px 8px' : '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #33ff88',
                    fontSize: isMobile ? '10px' : '13px',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  📺 Use <strong style={{ fontWeight: 600 }}>Fullscreen</strong>{' '}
                  to avoid ads.
                  <span
                    style={{
                      marginLeft: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                    onClick={() => setShowAdAlert(false)}
                  >
                    ×
                  </span>
                </div>
              )}

              <div
                style={{ width: '100%', height: '100%', position: 'relative' }}
              >
                {iframeURL ? (
                  <iframe
                    src={iframeURL}
                    title="Live Stream"
                    allow="autoplay"
                    allowFullScreen
                    scrolling="no"
                    sandbox="allow-scripts allow-same-origin"
                    referrerPolicy="no-referrer-when-downgrade" // default & safer

                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: '#000',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
              </div>
            </div>

            <div
              style={{
                width: isMobile ? '110px' : '160px',
                height: isMobile ? '9px' : '12px',
                background: '#2b2b2b',
                borderRadius: '4px',
                marginTop: '12px',
                boxShadow:
                  'inset 0 5px 6px rgba(0,0,0,0.6), 0 7px 10px rgba(0,0,0,0.5)',
              }}
            />
          </div>

          {/* Channel Cards + Dropdown Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'column',
              alignItems: isMobile ? 'stretch' : 'center',
              marginTop: isMobile ? '20px' : '0',
              width: isMobile ? '100%' : '220px',
              maxWidth: isMobile ? '100vw' : '220px',
            }}
          >
            {/* Channel label and dropdown */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: isMobile ? 'flex-start' : 'center',
                marginBottom: isMobile ? '10px' : '10px',
                marginLeft: isMobile ? '6px' : 0,
                marginTop: isMobile ? 0 : '0',
                gap: isMobile ? '6px' : '0',
              }}
            >
              <select
                className="livetv-provider-select"
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                style={{
                  marginTop: isMobile ? '0' : undefined,
                  marginLeft: isMobile ? '0' : undefined,
                  width: isMobile ? '100%' : "200px",
                }}
              >
                {PROVIDERS.map((p) => (
                  <option key={p.keyword} value={p.keyword}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel Cards */}
            {isMobile ? (
              <div
                style={{
                  display: 'grid',
                  gridAutoFlow: 'column',
                  gridTemplateRows: 'repeat(2, 1fr)',
                  gap: '12px',
                  overflowX: 'auto',
                  paddingBottom: '14px',
                  paddingRight: '16px',
                  width: '100%',
                }}
              >
                {filteredChannels.map(renderChannelCard)}
              </div>
            ) : (
              <div
                style={{
                  maxHeight: '500px',
                  overflowY: 'auto',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  flex: 1,
                  paddingRight: '16px',
                  padding: '16px',
                }}
              >
                {filteredChannels.map(renderChannelCard)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-5">
        <LiveMatchList />
      </div>

      <div style={{ padding: isMobile ? "0 1rem" : "0 3rem" }}>
        <LiveNews />
      </div>
    </>
  );
};

export default LiveTV;