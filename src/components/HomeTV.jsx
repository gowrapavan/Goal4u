import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";

const hlsServer = { label: "Server 3", streamId: 6 };

const iframeServers = [
  // HD Channels
  { label: "HD1 Eng", url: "https://sportzonline.si/channels/hd/hd1.php" },
  { label: "HD2 Eng", url: "https://sportzonline.si/channels/hd/hd2.php" },
  { label: "HD3 Ger", url: "https://sportzonline.si/channels/hd/hd3.php" },
  { label: "HD4 Fr", url: "https://sportzonline.si/channels/hd/hd4.php" },
  { label: "HD5 Eng", url: "https://sportzonline.si/channels/hd/hd5.php" },
  { label: "HD6 Spn", url: "https://sportzonline.si/channels/hd/hd6.php" },
  { label: "HD7 Itl", url: "https://sportzonline.si/channels/hd/hd7.php" },
  { label: "HD8 Arb", url: "https://sportzonline.si/channels/hd/hd8.php" },
  { label: "HD9 Eng", url: "https://sportzonline.si/channels/hd/hd9.php" },
  { label: "HD10 Dut", url: "https://sportzonline.si/channels/hd/hd10.php" },
  { label: "HD Eng", url: "https://sportzonline.si/channels/hd/hd11.php" },

  // Brazilian Channels
  { label: "BR1 Brazil", url: "https://sportzonline.si/channels/bra/br1.php" },
  { label: "BR2 Brazil", url: "https://sportzonline.si/channels/bra/br2.php" },
  { label: "BR3 Brazil", url: "https://sportzonline.si/channels/bra/br3.php" },
  { label: "BR4 Brazil", url: "https://sportzonline.si/channels/bra/br4.php" },
  { label: "BR5 Brazil", url: "https://sportzonline.si/channels/bra/br5.php" },
  { label: "BR6 Brazil", url: "https://sportzonline.si/channels/bra/br6.php" },

  // Portuguese SPORT TV
  { label: "SPORT TV 1", url: "https://sportsonline.si/channels/pt/sporttv1.php" },
  { label: "SPORT TV 2", url: "https://sportsonline.si/channels/pt/sporttv2.php" },
  { label: "SPORT TV 3", url: "https://sportsonline.si/channels/pt/sporttv3.php" },
  { label: "SPORT TV 4", url: "https://sportsonline.si/channels/pt/sporttv4.php" },
  { label: "SPORT TV 5", url: "https://sportsonline.si/channels/pt/sporttv5.php" },

  // Portuguese ELEVEN SPORTS
  { label: "11Sports 1", url: "https://sportsonline.si/channels/pt/eleven1.php" },
  { label: "11Sports 2", url: "https://sportsonline.si/channels/pt/eleven2.php" },
  { label: "11Sports 3", url: "https://sportsonline.si/channels/pt/eleven3.php" },

  // Portuguese Benfica TV
  { label: "Benfica TV", url: "https://sportsonline.si/channels/pt/btv.php" },

  // External fallback or third-party servers
  { label: "iServer 1", url: "https://letscast.pro/badir2.php?stream=HDGQZ2" },
  { label: "Vivo 1", url: "https://vivosoccer.xyz/vivoall/1.php" },
  { label: "Vivo 2", url: "https://vivosoccer.xyz/vivoall/2.php" },
  { label: "Vivo 3", url: "https://vivosoccer.xyz/vivoall/3.php" },
  { label: "Vivo 4", url: "https://vivosoccer.xyz/vivoall/4.php" },
  { label: "Vivo 5", url: "https://vivosoccer.xyz/vivoall/5.php" },
  { label: "Vivo 6", url: "https://vivosoccer.xyz/vivoall/6.php" },
];


const channelLogos = {
  // Core servers
  "Server 3": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/500px-ESPN_wordmark.svg.png",
  "iServer 1": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/DAZN_Logo_Master.svg/330px-DAZN_Logo_Master.svg.png",
  "iServer 3": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Star_Sports_1_HD.png/640px-Star_Sports_1_HD.png",

  // HD Channels
  "HD1 Eng": "/assets/img/6.png",
  "HD2 Eng": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/FIFA_Club_World_Cup_logo.svg/640px-FIFA_Club_World_Cup_logo.svg.png",
  "HD3 Ger": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/BeIN-Sports-Logo.svg/640px-BeIN-Sports-Logo.svg.png",
  "HD4 Fr": "/assets/img/6.png",
  "HD5 Eng": "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg",
  "HD6 Spn": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/DAZN_Logo_Master.svg/330px-DAZN_Logo_Master.svg.png",
  "HD7 Itl": "https://i.insider.com/67d86789b8b41a9673faddca?width=700&format=jpeg&auto=webp",
  "HD8 Arb": "/assets/img/6.png",
  "HD9 Eng": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Star_Sports_1_HD.png/640px-Star_Sports_1_HD.png ",
  "HD10 Dut": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/DAZN_Logo_Master.svg/330px-DAZN_Logo_Master.svg.png",
  "HD Eng": "/assets/img/6.png",

  // BR Channels
  "BR1 Brazil": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/BandSports_logo.svg/640px-BandSports_logo.svg.png",
  "BR2 Brazil": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/2025_FIFA_Club_World_Cup_%28Spanish_and_Portuguese_version%29.svg/640px-2025_FIFA_Club_World_Cup_%28Spanish_and_Portuguese_version%29.svg.png",
  "BR3 Brazil": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/SporTV3_2021.png/640px-SporTV3_2021.png",
  "BR4 Brazil": "/assets/img/6.png",
  "BR5 Brazil": "/assets/img/6.png",
  "BR6 Brazil": "/assets/img/6.png",

  // SPORT TV (Portugal)
  "SPORT TV 1": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZPKSRvFyYHOBkGxISpGKmkJ7rU7S_l2AZaQ&s",
  "SPORT TV 2": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZPKSRvFyYHOBkGxISpGKmkJ7rU7S_l2AZaQ&s",
  "SPORT TV 3": "https://upload.wikimedia.org/wikipedia/commons/9/97/SportTV1.png?20100825202042",
  "SPORT TV 4": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZPKSRvFyYHOBkGxISpGKmkJ7rU7S_l2AZaQ&s",
  "SPORT TV 5": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZPKSRvFyYHOBkGxISpGKmkJ7rU7S_l2AZaQ&s",

  // ELEVEN SPORTS (Portugal)
  "11Sports 1": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/UEFA_Champions_League_logo_no_text.svg/640px-UEFA_Champions_League_logo_no_text.svg.png",
  "11Sports 2": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/DAZN_Logo_Master.svg/330px-DAZN_Logo_Master.svg.png",
  "11Sports 3": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/DAZN_Logo_Master.svg/330px-DAZN_Logo_Master.svg.png",

  // Benfica TV
  "Benfica TV": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/BTV_Red.svg/640px-BTV_Red.svg.png",

  // Vivo servers fallback
  "Vivo 1": "/assets/img/6.png",
  "Vivo 2": "/assets/img/6.png",
  "Vivo 3": "/assets/img/6.png",
  "Vivo 4": "/assets/img/6.png",
  "Vivo 5": "/assets/img/6.png",
  "Vivo 6": "/assets/img/6.png",
};


const HomeTV = () => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [iframeURL, setIframeURL] = useState("https://sportzonline.si/channels/hd/hd4.php");
  const [iframeKey, setIframeKey] = useState(Date.now()); // key to force iframe reload
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showAdAlert, setShowAdAlert] = useState(false);

  const allChannels = [hlsServer, ...iframeServers];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkFullscreen = () => {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
      setShowAdAlert(!isFullscreen && !!iframeURL);
    };
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
    };
  }, [iframeURL]);

  const loadHlsStream = (serverId) => {
    setIframeURL("");
    const video = videoRef.current;
    const url = `https://nflarcadia.xyz:443/bRtT37sn3w/Sx5q6YTgCs/${serverId}.m3u8`;

    if (!video) return;

    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      hls.on(Hls.Events.ERROR, (_, data) => data.fatal && hls.destroy());
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play();
    }
  };

  const handleHlsClick = () => loadHlsStream(hlsServer.streamId);

  const handleIframeClick = (url) => {
    setIframeURL(url);
    setIframeKey(Date.now()); // refresh key to force reload
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const handleIframeRefresh = () => {
    setIframeKey(Date.now());
  };

  const renderChannelCard = (server) => {
    const isActive =
      (!iframeURL && server.label === "Server 3") || iframeURL === server.url;
    return (
      <div
        key={server.label}
        onClick={() =>
          server.label === "Server 3"
            ? handleHlsClick()
            : handleIframeClick(server.url)
        }
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
          src={channelLogos[server.label]}
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
    );
  };

  return (
    <div style={{ padding: "1rem 1rem 2rem" }}>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "20px",
          alignItems: "flex-start",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "1000px",
            width: "90vw",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              backgroundColor: "#000",
              border: isMobile ? "8px solid #111" : "12px solid #111",
              borderRadius: isMobile ? "4px" : "14px",
              boxShadow: "0 8px 30px rgba(0,255,30,0.4)",
              overflow: "hidden",
              position: "relative",
            }}
          >
  {/* Refresh button */}
{iframeURL && (
  <button
    className="button green-refresh"
    onClick={handleIframeRefresh}
    style={{
      position: "absolute",
      top: isMobile ? "6px" : "10px",
      right: isMobile ? "6px" : "10px",
      zIndex: 20,
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-arrow-repeat"
      viewBox="0 0 16 16"
    >
      <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
      <path
        fillRule="evenodd"
        d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
      />
    </svg>
    
  </button>
)}



            {showAdAlert && (
              <div
                style={{
                  position: "absolute",
                  top: isMobile ? "6px" : "12px",
                  left: isMobile ? "50px" : "50px",
                  backgroundColor: "#e6fff3",
                  color: "#105e2e",
                  padding: isMobile ? "4px 8px" : "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #33ff88",
                  fontSize: isMobile ? "10px" : "13px",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                📺 Use <strong style={{ fontWeight: 600 }}>Fullscreen</strong> to avoid ads.
                <span
                  style={{ marginLeft: "6px", cursor: "pointer", fontWeight: "bold" }}
                  onClick={() => setShowAdAlert(false)}
                >
                  ×
                </span>
              </div>
            )}

            {iframeURL ? (
              <iframe
                key={iframeKey}
                src={iframeURL}
                title="Live Stream"
                allow="autoplay"
                allowFullScreen
                scrolling="no"
                sandbox="allow-scripts allow-same-origin"
                referrerPolicy="no-referrer"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  background: "#000",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            )}
          </div>

          <div
            style={{
              width: isMobile ? "110px" : "160px",
              height: isMobile ? "9px" : "12px",
              background: "#2b2b2b",
              borderRadius: "4px",
              marginTop: "10px",
              boxShadow: "inset 0 5px 6px rgba(0,0,0,0.6), 0 7px 10px rgba(0,0,0,0.5)",
            }}
          />
        </div>

        {!isMobile && (
          <div
            className="custom-scroll"
            style={{
              width: "200px",
              maxHeight: "500px",
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {allChannels.map(renderChannelCard)}
          </div>
        )}
      </div>

      {isMobile && (
        <div
          className="custom-scroll"
          style={{
            marginTop: "20px",
            overflowX: "auto",
            padding: "10px 0",
            display: "grid",
            gridAutoFlow: "column",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "12px",
            width: "100%",
          }}
        >
          {allChannels.map(renderChannelCard)}
        </div>
      )}

      <style>{`
      .button.green-refresh {
        color: #fff;
        background-color:rgb(18, 199, 115);
        font-weight: 600;
        border-radius: 0.5rem;
        font-size: 0.95rem;
        line-height: 2rem;
        padding: 0.6rem 1.2rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        border: none;
        box-shadow: 0 2px 6px rgba(46, 210, 100, 0.9);
        transition: background 0.5s ease-in-out;
      }

      .button.green-refresh:hover {
        background-color:rgb(2, 160, 185);
      }

      .button.green-refresh svg {
        width: 1.3rem;
        height: 1.3rem;
        color: white;
      }

      .button.green-refresh:focus svg {
        animation: spin_357 0.5s linear;
      }

      @keyframes spin_357 {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `}</style>
    </div>
  );
};

export default HomeTV;
