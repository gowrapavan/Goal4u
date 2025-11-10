import React, { useState, useEffect, useRef } from "react"; // Added useRef
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";

// --- Provider short codes ---
const PROVIDER_CODES = {
  sportzonline: "sptz",
  Goal4u: "dxx",
  hesgoal: "hes",
  yallashooote: "yallashooote",
  livekora: "vip",
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
  { label: "yallashooote", keyword: "yallashooote" },
  { label: "livekora", keyword: "livekora" },
  { label: "Shahid-Koora", keyword: "shahidkoora" },
];

// --- JSON Sources ---
const JSON_MAP = {
  sportzonline: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/sportsonline.json",
  Goal4u: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/Goal4u.json",
  livekora: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/livekora.json",
  shahidkoora: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/shahidkoora.json",
  hesgoal: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/hesgoal.json",
  yallashooote: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/yallashooote.json"
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

const HomeTV = () => {
  const [channelsByProvider, setChannelsByProvider] = useState({});
  const [iframeURL, setIframeURL] = useState("");
  const [showAdAlert, setShowAdAlert] = useState(false);
  const [selectedStream, setSelectedStream] = useState("Goal4u");

  const location = useLocation();
  const navigate = useNavigate();

  // --- Refs for measuring elements ---
  const playerRef = useRef(null);
  const channelSectionRef = useRef(null);

  // --- Fetch provider JSON dynamically ---
  const fetchProviderJSON = async (provider, streamCode) => {
    
    // 1. Immediately clear the player
    setIframeURL(""); 
    // 2. Immediately clear the channels list for the new provider
    setChannelsByProvider((prev) => ({ ...prev, [provider]: [] }));
    
    const url = JSON_MAP[provider];
    if (!url) {
        return; // No URL, lists are already cleared
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      const annotated = data.map((c) => ({ ...c, provider }));
      
      // 3. Now, set the real data for the provider
      setChannelsByProvider((prev) => ({ ...prev, [provider]: annotated }));

      if (annotated.length > 0) {
        // 4. Try to find the channel from the ?stream= param
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
        // 5. If no streamCode or no match, load the first channel
        setIframeURL(annotated[0].url);
      }
    } catch (err) {
      setChannelsByProvider((prev) => ({ ...prev, [provider]: [] }));
    }
  };

  // --- Navigation handler ---
  const handleProviderClick = (providerKeyword) => {
    const providerCode = PROVIDER_CODES[providerKeyword];
    if (providerCode) {
      navigate(`${location.pathname}?provider=${providerCode}`, { replace: true });
    }
  };

  // --- Main useEffect (Driven by URL) ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const providerCode = params.get("provider");
    const streamCode = params.get("stream");

    const initialProvider = CODE_TO_PROVIDER[providerCode] || "Goal4u";
    
    // Set the active tab in the UI
    setSelectedStream(initialProvider); 
    
    // Fetch data for the provider in the URL
    fetchProviderJSON(initialProvider, streamCode);
    
  }, [location.search, location.pathname]);


  // --- useEffect to match sidebar height to player (with mobile check) ---
  useEffect(() => {
    const videoPlayer = playerRef.current;
    const sidebar = channelSectionRef.current;

    if (!videoPlayer || !sidebar) return;

    // This function measures the player and sets the sidebar's max-height
    const setSidebarHeight = () => {
      // CHECK if we are on mobile (breakpoint is 900px)
      if (window.innerWidth <= 900) {
        sidebar.style.maxHeight = 'none'; // RESET inline style on mobile
      } else {
        // Only run desktop logic if not mobile
        const playerHeight = videoPlayer.offsetHeight;
        if (playerHeight > 0) { // Only set if height is calculated
          sidebar.style.maxHeight = `${playerHeight}px`;
        }
      }
    };

    // Run on mount
    setSidebarHeight();

    // Re-run on window resize
    window.addEventListener('resize', setSidebarHeight);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', setSidebarHeight);
    };
  }, []); // Empty array means this runs only once on mount


  // --- Fullscreen ad alert ---
  useEffect(() => {
    const checkFullscreen = () => {
      const isFullscreen =
        document.fullscreenElement || document.webkitFullscreenElement;
      if (!isFullscreen && iframeURL) {
        setShowAdAlert(true);
        const timer = setTimeout(() => setShowAdAlert(false), 10000);
        return () => clearTimeout(timer);
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

  // --- URL Syncing ---
  useEffect(() => {
    if (!iframeURL || !selectedStream) return;
    
    const currentChannels = channelsByProvider[selectedStream] || [];
    const matchedChannel = currentChannels.find((c) => c.url === iframeURL);
    if (!matchedChannel) return;

    const providerCode = PROVIDER_CODES[selectedStream];
    const encodedLabel = encode(matchedChannel.label); 

    const params = new URLSearchParams(location.search);
    if (params.get("provider") !== providerCode || params.get("stream") !== encodedLabel) {
        navigate(
          `${location.pathname}?provider=${providerCode}&stream=${encodedLabel}`,
          { replace: true }
        );
    }
  }, [iframeURL, selectedStream, channelsByProvider, navigate, location.pathname]);

  const handleIframeClick = (url) => setIframeURL(url);
  const filteredChannels = channelsByProvider[selectedStream] || [];

  // --- Render Matchup Card ---
  const renderChannelCard = (server) => {
    const isActive = iframeURL === server.url;
    const cardClasses = `channelCard ${isActive ? "channelCardActive" : ""}`;

    const defaultLogo = "/assets/img/6.png"; 
    const homeLogo = server.home_logo && server.home_logo.trim() !== "" ? server.home_logo : defaultLogo;
    const awayLogo = server.away_logo && server.away_logo.trim() !== "" ? server.away_logo : defaultLogo;

    let displayTime = server.time || "";
    if (displayTime.includes(" ")) {
        const parts = displayTime.split(" ");
        if (parts.length > 1) {
          displayTime = parts[1] + (parts[2] ? " " + parts[2] : "");
        }
    }

    return (
      <div
        key={server.url}
        className={cardClasses}
        onClick={() => handleIframeClick(server.url)}
      >
        <span className="cardMatchTime">{displayTime.trim()}</span>
        <div className="cardLogos">
          <img src={homeLogo} alt={server.home_team || 'Home'} className="cardTeamLogo" />
          <span className="cardVs">vs</span>
          <img src={awayLogo} alt={server.away_team || 'Away'} className="cardTeamLogo" />
        </div>
        <div className="cardTeams">
          <span className="cardTeamName">{server.home_team || server.label}</span>
          <span className="cardTeamName">{server.away_team || "View"}</span>
        </div>
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
        <link rel="canonical" href="https://goal4u.live/livetv" />
      </Helmet>

      {/* --- STYLES (Updated) --- */}
      <style>{`
        /* --- Base & Scrollbar --- */
        :root {
          --primary-color: #00a94e;
          --body-bg: #f8f9fa;
          --card-bg: #ffffff;
          --text-color: #212529;
          --text-muted: #6c757d;
          --border-color: #dee2e6;
          --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
          --page-padding: 1.5rem; /* Define page padding as a variable */
        }
        
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #d0d0d0;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-track {
          background-color: var(--card-bg);
        }

        /* --- Page Layout --- */
        .livetvPageContainer {
          padding: var(--page-padding);
          background-color: var(--body-bg);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: var(--text-color);
        }

        .livetvMainLayout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
          align-items: start;
        }

        /* --- Video Player Section --- */
        .videoSection {
          flex: 1;
          min-width: 0;
        }

        .videoPlayerWrapper {
          width: 100%;
          aspect-ratio: 16 / 9;
          background-color: #000;
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .iframeContainer {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .iframeStream {
          width: 100%;
          height: 100%;
          border: none;
          position: absolute;
          top: 0;
          left: 0;
        }

        .streamPlaceholder {
          width: 100%;
          height: 100%;
          background: #222;
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #888;
          font-weight: 500;
        }
        
        .loadingSpinner {
          border: 4px solid #444;
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .adAlert {
          position: absolute;
          top: 12px;
          left: 12px;
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(5px);
          color: var(--text-color);
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          font-size: 12px;
          font-weight: 500;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .adAlertClose {
          margin-left: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
          line-height: 1;
          color: var(--text-muted);
        }

        /* --- Wrapper Class --- */
        .channelSectionWrapper {
          /* This wrapper isolates the sticky element */
        }
        
        /* --- Channel List Section (Sticky) --- */
        .channelSection {
          display: flex;
          flex-direction: column;
          background: var(--card-bg);
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
          overflow: hidden; /* <-- Correct for desktop */
          position: sticky;
          top: var(--page-padding); 
          /* max-height is set by JavaScript */
        }

        /* --- Provider Tabs --- */
        .providerTabs {
          padding: 10px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          flex-shrink: 0;
        }
        
        .providerTabButton {
          font-family: inherit;
          border: 1px solid var(--border-color);
          background: var(--card-bg);
          color: var(--text-muted);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .providerTabButton:hover {
          background-color: #f8f9fa;
          border-color: #c7c7c7;
          color: var(--text-color);
        }
        
        .providerTabButton.providerTabActive {
          background-color: var(--primary-color);
          color: #ffffff;
          border-color: var(--primary-color);
          box-shadow: 0 2px 4px rgba(0, 169, 78, 0.2);
        }

        /* --- Channel List --- */
        .channelList {
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
          padding: 12px;
          flex: 1;
          min-height: 0;
        }

        .noChannelsMessage {
          color: var(--text-muted);
          font-size: 13px;
          grid-column: 1 / -1;
          text-align: center;
          margin-top: 20px;
          padding: 0 16px;
        }

        /* --- Channel Card Styles --- */
        .channelCard {
          border-radius: 8px;
          border: 1px solid var(--border-color);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          background: #fdfdfd;
          padding: 12px 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          overflow: hidden;
          min-height: 130px;
        }

        .channelCard:hover {
          transform: scale(1.03);
          box-shadow: var(--shadow-sm);
          border-color: #c7c7c7;
        }

        .channelCardActive {
          border: 2px solid var(--primary-color);
          box-shadow: 0 0 10px rgba(0, 169, 78, 0.3);
        }

        .cardMatchTime {
          font-size: 11px;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 6px;
        }

        .cardLogos {
          display: flex;
          justify-content: space-around;
          align-items: center;
          width: 100%;
        }

        .cardTeamLogo {
          width: 36px;
          height: 36px;
          object-fit: contain;
        }

        .cardVs {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .cardTeams {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          margin-top: 8px;
        }
        
        .cardTeamName {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          text-align: center;
        }
        
        .cardTeamName + .cardTeamName {
          margin-top: 2px;
        }

        /* --- Responsive (Mobile) --- */
        @media (max-width: 900px) {
          .livetvPageContainer {
            padding: 1rem 0; 
            --page-padding: 1rem; 
          }
        
          .livetvMainLayout {
            grid-template-columns: 1fr;
            max-height: none;
            align-items: stretch; 
            gap: 0;
          }

          /* --- THIS IS THE FIX --- */
          .videoSection {
            min-width: 0; /* Prevents grid item from expanding */
          }
          /* --- END FIX --- */

          .videoPlayerWrapper {
            border-radius: 0;
            border: none;
            box-shadow: none;
          }
          
          .channelSectionWrapper {
             margin-top: 20px;
             padding: 0 1rem;
             /* --- THIS IS THE FIX --- */
             min-width: 0; /* Prevents grid item from expanding */
          }
          
          .channelSection {
            max-height: none;
            position: static;
            border: none;
            box-shadow: none;
            overflow: hidden; /* Keep this to contain children */
          }
          
          .channelList {
            flex: none; 
            min-height: auto;
            display: flex;
            flex-direction: row;
            overflow-x: auto; /* This will now work */
            overflow-y: hidden;
            grid-template-columns: none;
            gap: 10px;
            padding-bottom: 12px;
          }

          .providerTabs {
            flex-wrap: nowrap;
            overflow-x: auto; /* This will also work */
            padding-bottom: 10px;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .providerTabs::-webkit-scrollbar {
            display: none;
          }
          
          .providerTabButton {
            flex-shrink: 0;
          }

          .channelCard {
            width: 140px; 
            height: 130px;
            flex-shrink: 0;
          }

          .noChannelsMessage {
            text-align: left;
            margin: 0;
            white-space: nowrap;
          }
        }
        
        @media (max-width: 500px) {
            .livetvPageContainer {
                padding: 0.75rem 0 0 0;
                --page-padding: 0.75rem;
            }
            
            .channelSectionWrapper {
              padding: 0 0.75rem;
            }

            .adAlert {
                top: 8px;
                left: 8px;
                padding: 5px 10px;
                font-size: 11px;
            }
        }
      `}</style>

      {/* --- JSX --- */}
      <div className="livetvPageContainer">
        <div className="livetvMainLayout">
          {/* TV Section */}
          <div className="videoSection">
            {/* Added ref to the player wrapper */}
            <div className="videoPlayerWrapper" ref={playerRef}>
              {/* Alert inside video */}
              {showAdAlert && (
                <div className="adAlert">
                  📺 Use <strong>Fullscreen</strong> to avoid ads.
                  <span
                    className="adAlertClose"
                    onClick={() => setShowAdAlert(false)}
                  >
                    ×
                  </span>
                </div>
              )}

              {/* Iframe */}
              <div className="iframeContainer">
                {iframeURL ? (
                  <iframe
                    src={iframeURL}
                    title="Live Stream"
                    allow="autoplay"
                    allowFullScreen
                    scrolling="no"
                    sandbox="allow-scripts allow-same-origin"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="iframeStream"
                  />
                ) : (
                  <div className="streamPlaceholder">
                    <div className="loadingSpinner"></div>
                    <p>Select a channel to watch</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wrapper div for sticky isolation */}
          <div className="channelSectionWrapper">
            {/* Added ref to the channel section */}
            <div className="channelSection" ref={channelSectionRef}>
              {/* --- Provider Tabs (Now drive navigation) --- */}
              <div className="providerTabs">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.keyword}
                    className={`providerTabButton ${
                      selectedStream === p.keyword ? "providerTabActive" : ""
                    }`}
                    onClick={() => handleProviderClick(p.keyword)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Channel Cards */}
              <div className="channelList">
                {filteredChannels.length > 0 ? (
                  filteredChannels.map(renderChannelCard)
                ) : (
                  <p className="noChannelsMessage">
                    No channels found for this provider.
                  </p>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default HomeTV;