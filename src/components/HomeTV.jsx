import React, { useState, useEffect, useRef } from "react";
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
  sirtv: "sirtv",
  soccerhd: "socchd",
  ovogoals: "ovogoals"
};
const CODE_TO_PROVIDER = Object.fromEntries(
  Object.entries(PROVIDER_CODES).map(([k, v]) => [v, k])
);

// --- Providers ---
const PROVIDERS = [
  { label: "Goal4u", keyword: "Goal4u" },
  { label: "Sportzonline", keyword: "sportzonline" },
  { label: "HesGoal", keyword: "hesgoal" },
  { label: "Yalla Shoot", keyword: "yallashooote" },
  { label: "Live Koora", keyword: "livekora" },
  { label: "Shahid", keyword: "shahidkoora" },
  { label: "Sir TV", keyword: "sirtv" },
  { label: "SoccerHD", keyword: "soccerhd" },
  { label: "OvoGoals", keyword: "ovogoals" }
];

// --- JSON Sources ---
const JSON_MAP = {
  sportzonline: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/sportsonline.json",
  Goal4u: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/Goal4u.json",
  livekora: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/livekora.json",
  shahidkoora: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/shahidkoora.json",
  hesgoal: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/hesgoal.json",
  yallashooote: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/yallashooote.json",
  sirtv: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/siiir.json",
  soccerhd: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/soccerhd.json",
  ovogoals: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/ovogoal.json"
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
  const [currentChannel, setCurrentChannel] = useState(null); 
  const [showAdAlert, setShowAdAlert] = useState(false);
  const [selectedStreamProvider, setSelectedStreamProvider] = useState("Goal4u");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const playerRef = useRef(null);
  const channelSectionRef = useRef(null);

  // --- Fetch provider JSON dynamically ---
  const fetchProviderJSON = async (provider, streamCode) => {
    setLoading(true);
    setCurrentChannel(null);
    setChannelsByProvider((prev) => ({ ...prev, [provider]: [] }));
    
    const url = JSON_MAP[provider];
    if (!url) {
        setLoading(false);
        return;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      const annotated = data.map((c) => ({ ...c, provider }));
      
      setChannelsByProvider((prev) => ({ ...prev, [provider]: annotated }));

      if (annotated.length > 0) {
        let targetChannel = annotated[0]; 

        if (streamCode) {
          const decodedLabel = decode(streamCode);
          const matched = annotated.find(
            (c) => c.label.toLowerCase() === decodedLabel.toLowerCase()
          );
          if (matched) {
            targetChannel = matched;
          }
        }
        setCurrentChannel(targetChannel);
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
      setChannelsByProvider((prev) => ({ ...prev, [provider]: [] }));
    }
    setLoading(false);
  };

  const handleProviderChange = (e) => {
    const providerKeyword = e.target.value;
    const providerCode = PROVIDER_CODES[providerKeyword];
    if (providerCode) {
      navigate(`${location.pathname}?provider=${providerCode}`, { replace: true });
    }
  };

  // --- Main useEffect ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const providerCode = params.get("provider");
    const streamCode = params.get("stream");

    const initialProvider = CODE_TO_PROVIDER[providerCode] || "Goal4u";
    
    setSelectedStreamProvider(initialProvider); 
    fetchProviderJSON(initialProvider, streamCode);
    
  }, [location.search, location.pathname]);


  // --- Height Synchronization Logic ---
  useEffect(() => {
    const videoPlayer = playerRef.current;
    const sidebar = channelSectionRef.current;

    if (!videoPlayer || !sidebar) return;

    const setSidebarHeight = () => {
      if (window.innerWidth <= 900) {
        sidebar.style.height = 'auto';
        sidebar.style.maxHeight = 'none';
      } else {
        const playerHeight = videoPlayer.offsetHeight;
        if (playerHeight > 0) { 
          sidebar.style.height = `${playerHeight}px`;
        }
      }
    };

    setSidebarHeight();
    const observer = new ResizeObserver(setSidebarHeight);
    observer.observe(videoPlayer);
    window.addEventListener('resize', setSidebarHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', setSidebarHeight);
    };
  }, []); 

  // --- Fullscreen ad alert ---
  useEffect(() => {
    const checkFullscreen = () => {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
      
      // Show alert if not fullscreen AND we have a valid URL
      if (!isFullscreen && currentChannel && currentChannel.url) {
        setShowAdAlert(true);
        const timer = setTimeout(() => setShowAdAlert(false), 10000); // 10 seconds
        return () => clearTimeout(timer);
      } else {
        setShowAdAlert(false);
      }
    };
    
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    
    // Initial check
    checkFullscreen();
    
    return () => {
        document.removeEventListener("fullscreenchange", checkFullscreen);
        document.removeEventListener("webkitfullscreenchange", checkFullscreen);
    };
  }, [currentChannel]);

  // --- URL Syncing ---
  useEffect(() => {
    if (!currentChannel || !selectedStreamProvider) return;
    if (currentChannel.provider !== selectedStreamProvider && currentChannel.provider !== undefined) return;

    const providerCode = PROVIDER_CODES[selectedStreamProvider];
    const encodedLabel = encode(currentChannel.label); 

    const params = new URLSearchParams(location.search);
    if (params.get("provider") !== providerCode || params.get("stream") !== encodedLabel) {
        navigate(
          `${location.pathname}?provider=${providerCode}&stream=${encodedLabel}`,
          { replace: true }
        );
    }
  }, [currentChannel, selectedStreamProvider, navigate, location.pathname]);

  const handleChannelSelect = (channel) => setCurrentChannel(channel);
  const filteredChannels = channelsByProvider[selectedStreamProvider] || [];

  const getPlayerState = () => {
      if (loading) return "LOADING";
      if (!currentChannel) return "IDLE";
      if (!currentChannel.url || currentChannel.url.trim() === "") return "EMPTY";
      return "ACTIVE";
  };
  const playerState = getPlayerState();

  const renderChannelCard = (server) => {
    const isActive = currentChannel && currentChannel.label === server.label;
    
    const defaultLogo = "https://cdn-icons-png.flaticon.com/512/33/33736.png"; 
    const homeLogo = server.home_logo && server.home_logo.trim() !== "" ? server.home_logo : defaultLogo;
    const awayLogo = server.away_logo && server.away_logo.trim() !== "" ? server.away_logo : defaultLogo;

    let displayTime = server.time || "LIVE";
    if (displayTime.includes(" ")) {
        const parts = displayTime.split(" ");
        if (parts.length > 1) displayTime = parts[1];
    }

    return (
      <div
        key={server.label + server.url} 
        className={`matchCard ${isActive ? "active" : ""}`}
        onClick={() => handleChannelSelect(server)}
      >
        <div className="matchHeader">
           <span className={`statusBadge ${isActive ? "live" : ""}`}>
             {isActive ? "WATCHING" : displayTime}
           </span>
        </div>
        
        <div className="teamsContainer">
            <div className="teamCol">
                <img src={homeLogo} alt="" className="teamLogo" onError={(e)=>{e.target.src=defaultLogo}} />
                <span className="teamName">{server.home_team || server.label}</span>
            </div>
            <div className="vsText">vs</div>
            <div className="teamCol">
                <img src={awayLogo} alt="" className="teamLogo" onError={(e)=>{e.target.src=defaultLogo}} />
                <span className="teamName">{server.away_team || "Guest"}</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Live Football | Goal4U</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Helmet>

      {/* --- STYLES --- */}
      <style>{`
        :root {
          --primary: #10b981;
          --bg-page: #f1f5f9;
          --bg-card: #ffffff;
          --border: #e2e8f0;
          --text-main: #1e293b;
          --text-sub: #64748b;
        }

        body {
            background-color: var(--bg-page);
            margin: 0;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            overflow-x: hidden;
        }

        .tv-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            display: grid;
            grid-template-columns: 1fr 360px;
            gap: 20px;
            align-items: start;
        }

        .video-wrapper {
            position: relative;
            width: 100%;
            padding-top: 56.25%; /* 16:9 */
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .iframe-embed {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
        }

        .sidebar-container {
            background: var(--bg-card);
            border-radius: 12px;
            border: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .sidebar-header {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border);
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .header-label {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-sub);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .provider-select {
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid var(--border);
            background: #fff;
            color: var(--text-main);
            font-weight: 600;
            font-size: 14px;
            outline: none;
            cursor: pointer;
            width: 60%;
            transition: border-color 0.2s;
        }
        .provider-select:focus {
            border-color: var(--primary);
        }

        .sidebar-body {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            background: #fcfcfc;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            align-content: start;
        }

        .sidebar-body::-webkit-scrollbar { width: 5px; }
        .sidebar-body::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }

        .matchCard {
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 90px;
        }

        .matchCard:hover {
            border-color: #94a3b8;
            transform: translateY(-2px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .matchCard.active {
            border: 1px solid var(--primary);
            background: #f0fdf4;
            box-shadow: 0 0 0 1px var(--primary);
        }

        .matchHeader {
            text-align: center;
            margin-bottom: 6px;
        }

        .statusBadge {
            font-size: 9px;
            font-weight: 700;
            background: #f1f5f9;
            color: #64748b;
            padding: 2px 6px;
            border-radius: 4px;
        }
        .statusBadge.live {
            background: var(--primary);
            color: #fff;
        }

        .teamsContainer {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .teamCol {
            width: 40%;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .teamLogo {
            width: 24px;
            height: 24px;
            object-fit: contain;
            margin-bottom: 4px;
        }

        .teamName {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-main);
            line-height: 1.1;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .vsText {
            font-size: 9px;
            color: #cbd5e1;
            font-weight: 700;
        }

        .placeholder-screen {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            background: #111;
            text-align: center;
            padding: 20px;
        }
        
        .placeholder-icon {
            font-size: 32px;
            margin-bottom: 12px;
            opacity: 0.7;
        }
        
        .placeholder-text {
            font-size: 14px;
            font-weight: 500;
            color: #ccc;
        }

        .spinner {
            width: 30px;
            height: 30px;
            border: 3px solid #334155;
            border-top: 3px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
        }
        
        .loading-text {
            grid-column: 1 / -1;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            padding: 20px;
        }
        
        .ad-alert {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 20;
            background: rgba(255,255,255,0.95);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .ad-close { cursor: pointer; font-size: 14px; color: #64748b; }

        @keyframes spin { 100% { transform: rotate(360deg); } }

        @media (max-width: 900px) {
            .tv-container {
                display: block;
                padding: 0;
                max-width: 100%;
            }
            .video-wrapper {
                border-radius: 0;
                width: 100vw; 
                box-shadow: none;
            }
            .sidebar-container {
                margin: 0;
                border-radius: 0;
                border: none;
                height: auto !important; 
                box-shadow: none;
            }
            .sidebar-header {
                padding: 10px 16px;
                border-top: 1px solid var(--border);
            }
            .provider-select {
                width: 100%;
            }
            .header-label {
                display: none; 
            }
            .sidebar-body {
                display: flex;
                flex-direction: row;
                overflow-x: auto;
                grid-template-columns: none;
                gap: 12px;
                padding: 12px 16px;
                background: #fff;
                min-height: 120px;
                align-items: stretch;
            }
            .matchCard {
                min-width: 140px;
                width: 140px;
                flex-shrink: 0;
                height: auto;
            }
        }
      `}</style>

      {/* --- MARKUP --- */}
      <div className="tv-container">
        {/* Left: Video Player */}
        <div className="video-section">
            <div className="video-wrapper" ref={playerRef}>
                {showAdAlert && (
                    <div className="ad-alert">
                        <span>Use <b>Fullscreen</b> to skip ads</span>
                        <span className="ad-close" onClick={() => setShowAdAlert(false)}>✕</span>
                    </div>
                )}
                
                {/* Conditionals based on playerState */}
                {playerState === "ACTIVE" && (
                    <iframe
                        src={currentChannel.url}
                        title="Live Stream"
                        className="iframe-embed"
                        // --- IMPORTANT: Restored Ad Protection (Sandbox) ---
                        sandbox="allow-scripts allow-same-origin"
                        referrerPolicy="no-referrer-when-downgrade"
                        // ----------------------------------------------------
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        allowFullScreen
                        scrolling="no"
                    />
                )}

                {playerState === "EMPTY" && (
                    <div className="placeholder-screen">
                        <div className="placeholder-icon">⏰</div>
                        <div className="placeholder-text">Available only at match time</div>
                    </div>
                )}

                {playerState === "LOADING" && (
                    <div className="placeholder-screen">
                        <div className="spinner"></div>
                        <div className="placeholder-text">Loading Stream...</div>
                    </div>
                )}

                {playerState === "IDLE" && (
                    <div className="placeholder-screen">
                        <div className="placeholder-text">Select a match to start watching</div>
                    </div>
                )}
            </div>
        </div>

        {/* Right: Sidebar */}
        <div className="sidebar-container" ref={channelSectionRef}>
            
            {/* 1. Header with Picklist */}
            <div className="sidebar-header">
                <span className="header-label">Source:</span>
                <select 
                    className="provider-select" 
                    value={selectedStreamProvider}
                    onChange={handleProviderChange}
                >
                    {PROVIDERS.map((p) => (
                        <option key={p.keyword} value={p.keyword}>
                            {p.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* 2. Body Grid (Desktop: 2-Col, Mobile: Horizontal) */}
            <div className="sidebar-body">
                {filteredChannels.length > 0 ? (
                    filteredChannels.map(renderChannelCard)
                ) : (
                    <div className="loading-text">
                        {loading ? "Fetching data..." : "No channels found."}
                    </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
};

export default HomeTV;