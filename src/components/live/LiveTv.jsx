import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import LiveNews from "./LiveNews";
import LiveMatchList from './LiveMatchList';


const hlsServer = { label: "Server 3", streamId: 6 };

const iframeServers = [
  { label: "HD 4", url: "https://sportzonline.si/channels/hd/hd4.php" },
  { label: "iServer 1", url: "https://letscast.pro/badir2.php?stream=HDGQZ2" },
  { label: "iServer 3", url: "https://vivosoccer.xyz/vivoall/1.php" },
  { label: "Vivo 5", url: "https://vivosoccer.xyz/vivoall/5.php" },
  { label: "HD 1", url: "https://sportzonline.si/channels/hd/hd1.php" },
  { label: "HD 2", url: "https://sportzonline.si/channels/hd/hd2.php" },
  { label: "HD 3", url: "https://sportzonline.si/channels/hd/hd3.php" },
  { label: "HD 5", url: "https://sportzonline.si/channels/hd/hd5.php" },
  { label: "Vivo 2", url: "https://vivosoccer.xyz/vivoall/2.php" },
  { label: "Vivo 3", url: "https://vivosoccer.xyz/vivoall/3.php" },
  { label: "Vivo 4", url: "https://vivosoccer.xyz/vivoall/4.php" },
  { label: "Vivo 6", url: "https://vivosoccer.xyz/vivoall/6.php" },
];

const channelLogos = {
  "Server 3": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/500px-ESPN_wordmark.svg.png",
  "iServer 1": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/DAZN_Logo_Master.svg/330px-DAZN_Logo_Master.svg.png",
  "iServer 3": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/TNT_%28TV_Channel%29.svg/330px-TNT_%28TV_Channel%29.svg.png",
  "HD 2": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/UEFA_logo.svg/330px-UEFA_logo.svg.png",
  "HD 4": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/FIFA_Club_World_Cup_logo.svg/300px-FIFA_Club_World_Cup_logo.svg.png",
  "HD 1": "/assets/img/6.png",
  "HD 3": "/assets/img/6.png",
  "HD 5": "/assets/img/6.png",
  "Vivo 2": "/assets/img/6.png",
  "Vivo 3": "/assets/img/6.png",
  "Vivo 4": "/assets/img/6.png",
  "Vivo 5": "/assets/img/6.png",
  "Vivo 6": "/assets/img/6.png",
};

const LiveTV = () => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [iframeURL, setIframeURL] = useState("");
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
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  useEffect(() => {
    setIframeURL("https://sportzonline.si/channels/hd/hd4.php");
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const renderChannelCard = (server) => {
    const isActive = (!iframeURL && server.label === "Server 3") || iframeURL === server.url;
    return (
      <div
        key={server.label}
        onClick={() =>
          server.label === "Server 3" ? handleHlsClick() : handleIframeClick(server.url)
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
      `}</style>

      <div
        style={{
          padding: "1.2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
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
                border: isMobile ? "9px solid #111" : "12px solid #111",
                borderRadius: isMobile ? "4px" : "18px",
                boxShadow: isMobile
                  ? "0 7px 32px rgba(21, 116, 29, 0.7)"
                  : "0 10px 40px rgba(21, 116, 29, 0.7)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Alert inside video */}
              {showAdAlert && (
                <div
                  style={{
                    position: "absolute",
                    top: isMobile ? "6px" : "12px",
                    left: isMobile ? "6px" : "12px",
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

              <div style={{ width: "100%", height: "100%", position: "relative" }}>
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
            </div>

            <div
              style={{
                width: isMobile ? "110px" : "160px",
                height: isMobile ? "9px" : "12px",
                background: "#2b2b2b",
                borderRadius: "4px",
                marginTop: "12px",
                boxShadow:
                  "inset 0 5px 6px rgba(0,0,0,0.6), 0 7px 10px rgba(0,0,0,0.5)",
              }}
            />
          </div>

          {!isMobile && (
            <div
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
