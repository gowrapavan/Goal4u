import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";

const hlsServer = { label: "Server 3", streamId: 5 };

const iframeServers = [
  { label: "Server 1", url: "https://dcb-fl-live.dtcdn.dazn.com/1u9ivr9koaj5718itvgfsa16da/mob25f/stream.m3u8?channel=2653&outlet=dazn-mena&plang=ar" },
{ label: "Server 2", url: "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr-2/754931856515075b0aabf0e583495c68/index.m3u8" },
{ label: "Server 3 DAZN", url: "https://dcb-fl-live.dtcdn.dazn.com/zldbrzp8obsi1lolgbdmhnk0a/mob25f/stream.m3u8?channel=2650&outlet=dazn-mena&plang=ar" },

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
  "Server 1": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/DAZN_Logo_Master.svg/330px-DAZN_Logo_Master.svg.png",
"Server 2": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/BeIN-Sports-Logo.svg/640px-BeIN-Sports-Logo.svg.png",
"Server 3 DAZN": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/DAZN_Logo_Master.svg/330px-DAZN_Logo_Master.svg.png",

};
const loadHlsFromUrl = (url) => {
  setIframeURL("");
  const video = videoRef.current;
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


const HomeTV = () => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [iframeURL, setIframeURL] = useState("https://sportzonline.si/channels/hd/hd4.php");
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showAdAlert, setShowAdAlert] = useState(false);
  const allChannels = [hlsServer, ...iframeServers];

  // Update isMobile on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show "use fullscreen to avoid ads" hint
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

  // Load HLS from external URL
  const loadHlsFromUrl = (url) => {
    setIframeURL("");
    const video = videoRef.current;
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

  // Load HLS from internal ID
  const loadHlsStream = (serverId) => {
    const url = `https://nflarcadia.xyz:443/bRtT37sn3w/Sx5q6YTgCs/${serverId}.m3u8`;
    loadHlsFromUrl(url);
  };

  // HLS button handler
  const handleHlsClick = () => loadHlsStream(hlsServer.streamId);

  // iframe button handler
  const handleIframeClick = (url) => {
    setIframeURL(url);
    setIframeKey(Date.now());
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // Force iframe reload
  const handleIframeRefresh = () => setIframeKey(Date.now());

  // Render each server tile
  const renderChannelCard = (server) => {
    const isActive =
      (!iframeURL && server.label === "Server 3") || iframeURL === server.url;

    return (
      <div
        key={server.label}
        onClick={() => {
          if (server.url?.endsWith(".m3u8")) {
            loadHlsFromUrl(server.url);
          } else if (server.label === "Server 3") {
            handleHlsClick();
          } else {
            handleIframeClick(server.url);
          }
        }}
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
        }}
      >
        {/* Video container */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "1000px", width: "90vw" }}>
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
                🔄
              </button>
            )}

            {/* Ad alert */}
            {showAdAlert && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "50px",
                  backgroundColor: "#e6fff3",
                  color: "#105e2e",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #33ff88",
                  fontSize: "13px",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                📺 Use <strong>Fullscreen</strong> to avoid ads.
                <span
                  onClick={() => setShowAdAlert(false)}
                  style={{ cursor: "pointer", marginLeft: "6px", fontWeight: "bold" }}
                >
                  ×
                </span>
              </div>
            )}

            {/* Video or Iframe */}
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

          {/* Bottom shadow bar */}
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

        {/* Server list */}
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

      {/* Mobile channel scroll */}
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
          }}
        >
          {allChannels.map(renderChannelCard)}
        </div>
      )}

      {/* Refresh Button Styles */}
      <style>{`
        .button.green-refresh {
          color: #fff;
          background-color: rgb(18, 199, 115);
          font-weight: 600;
          border-radius: 0.5rem;
          font-size: 0.95rem;
          padding: 0.4rem 0.6rem;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(46, 210, 100, 0.9);
        }
        .button.green-refresh:hover {
          background-color: rgb(2, 160, 185);
        }
      `}</style>
    </div>
  );
};

export default HomeTV;