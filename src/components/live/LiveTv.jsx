import React, { useState, useEffect } from "react";
import LiveNews from "./LiveNews";
import LiveMatchList from "./LiveMatchList";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";

// --- Short code mapping setup ---
const CODE_MAP_KEYS = {
  elixx: "livetv_code_map_elixx",
  sportzonline: "livetv_code_map_sportzonline",
  vivosoccer: "livetv_code_map_vivosoccer",
};
const PARAM_KEYS = {
  elixx: "elx",
  sportzonline: "sptz",
  vivosoccer: "viv",
};
function generateShortCode() {
  // 12-char alphanumeric
  return Math.random().toString(36).substring(2, 14);
}
function saveCodeMap(provider, map) {
  localStorage.setItem(CODE_MAP_KEYS[provider], JSON.stringify(map));
}
function loadCodeMap(provider) {
  try {
    return JSON.parse(localStorage.getItem(CODE_MAP_KEYS[provider])) || {};
  } catch {
    return {};
  }
}

// --- Providers ---
const PROVIDERS = [
  { label: "Sportzonline", keyword: "sportzonline" }, // ✅ fixed spelling
  { label: "Doublexx", keyword: "doublexx" },
];


// --- JSON Sources ---
const jsonFiles = [
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/sportsonline.json",
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/doublexx.json",
];


const encode = (str) => {
  // Simple base64 encoding, replace for more secure if needed
  return btoa(unescape(encodeURIComponent(str)));
};

const decode = (str) => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return "";
  }
};

const LiveTV = () => {
  const [channels, setChannels] = useState([]);
  const [iframeURL, setIframeURL] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showAdAlert, setShowAdAlert] = useState(false);
  const [selectedStream, setSelectedStream] = useState("doublexx");
  const location = useLocation();
  const navigate = useNavigate();

  // --- On mount, check for provider-specific param and set stream if present ---
useEffect(() => {
  const params = new URLSearchParams(location.search);

  const determineInitialStream = (channelList) => {
    const code = params.get("stream");
    if (code) {
      const decodedLabel = decode(code);
      const matched = channelList.find(
        (c) => c.label.toLowerCase() === decodedLabel.toLowerCase()
      );
      if (matched) {
        setIframeURL(matched.url);
        const matchedProvider = PROVIDERS.find((p) =>
          matched.url.toLowerCase().includes(p.keyword)
        );
        if (matchedProvider) setSelectedStream(matchedProvider.keyword);
        return true;
      }
    }
    return false;
  };

  let isMounted = true;
  Promise.all(
    jsonFiles.map((file) =>
      fetch(file)
        .then((res) => res.json())
        .catch(() => [])
    )
  ).then((results) => {
    if (!isMounted) return;
    const all = results.flat().filter(Boolean);
    setChannels(all);

    const matched = determineInitialStream(all);

    if (
      !matched &&
      location.pathname === "/livetv" &&
      Array.from(params.keys()).length === 0
    ) {
      const defaultProvider = "doublexx";
      setSelectedStream(defaultProvider);
      const defaultChannel = all.find((c) =>
        c.url.toLowerCase().includes(defaultProvider)
      );
      if (defaultChannel) {
        setIframeURL(defaultChannel.url);
      }
    }
  });

  // ✅ cleanup correctly here
  return () => {
    isMounted = false;
  };
}, [location.search, location.pathname]);


  // Fetch all channels from JSON files
  useEffect(() => {
    let isMounted = true;
    Promise.all(
      jsonFiles.map((file) =>
        fetch(file)
          .then((res) => res.json())
          .catch(() => [])
      )
    ).then((results) => {
      if (!isMounted) return;
      const all = results.flat().filter(Boolean);
      setChannels(all);

      // Only set default if no code param in URL and path is exactly /livetv (no params at all)
      const params = new URLSearchParams(location.search);
      let hasCode = false;
     hasCode = params.has("stream");

      if (
        !hasCode &&
        location.pathname === "/livetv" &&
        Array.from(params.keys()).length === 0
      ) {
        // Set default channel if available and matches default provider (DoubleXX)
        const defaultProvider = "doublexx";
        const defaultChannel = all.find((c) =>
          c.url.toLowerCase().includes(defaultProvider)
        );
        if (defaultChannel) setIframeURL(defaultChannel.url);
        else if (all.length > 0) setIframeURL(all[0].url);
      }
    });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, [location.search, location.pathname]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkFullscreen = () => {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
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
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
    };
  }, [iframeURL]);

  // --- When user changes stream/channel, update the URL with a short code ---
  useEffect(() => {
    if (!iframeURL) return;
    // Find provider for current stream
    const provider = PROVIDERS.find((p) =>
      iframeURL.toLowerCase().includes(p.keyword)
    )?.keyword;
    if (!provider) return;

    const matchedChannel = channels.find(c => c.url === iframeURL);
    if (!matchedChannel) return;

    // Encode the channel label
    const encodedLabel = encode(matchedChannel.label);

    // Determine correct param key
    navigate(`${location.pathname}?stream=${encodedLabel}`, { replace: true });



    // eslint-disable-next-line
  }, [iframeURL]);

  const handleIframeClick = (url) => {
    setIframeURL(url);
  };

  // Filter channels by selected provider
  const filteredChannels = channels.filter((c) =>
    c.url.toLowerCase().includes(selectedStream)
  );

  // If the current iframeURL is not in the filtered list, auto-select the first filtered channel
  useEffect(() => {
    if (
      filteredChannels.length > 0 &&
      !filteredChannels.some((c) => c.url === iframeURL)
    ) {
      setIframeURL(filteredChannels[0].url);
    }
    // eslint-disable-next-line
  }, [selectedStream, channels]);

  const renderChannelCard = (server) => {
    const isActive = iframeURL === server.url;
    return (
      <React.Fragment key={server.label}>
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
          <meta property="og:image" content="https://goal4u.live/assets/og-thumbnail.jpg" />
          <link rel="canonical" href="https://goal4u.live/livetv" />
        </Helmet>
        <div
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
            style={{
              width: "40px",
              height: "40px",
              objectFit: "contain",
              marginBottom: "6px",
            }}
          />
          <span>{server.label}</span>
        </div>
      </React.Fragment>
    );
  };

  return (
    <>
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
                    referrerPolicy="no-referrer"
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