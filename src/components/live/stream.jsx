import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import ChatBox from './ChatBox'; // ✅ Make sure the path is correct

const hlsServers = [
  { label: 'Server 3', streamId: 6 },
  { label: 'Server 2', streamId: 2 },
  { label: 'Server 1', streamId: 1 },
];

const iframeServers = [
  { label: 'iServer 1', url: 'https://letscast.pro/badir2.php?stream=HDGQZ2' },
  { label: 'iServer 2', url: 'https://nativesurge.top/ai/ch2.php' },
  { label: 'iServer 3', url: 'https://vivosoccer.xyz/vivoall/1.php' },
  { label: 'HD 4', url: 'https://sportzonline.si/channels/hd/hd4.php' },
  { label: 'HD 2', url: 'https://sportzonline.si/channels/hd/hd2.php' },
  { label: 'HD 5', url: 'https://sportzonline.si/channels/hd/hd5.php' },
];

const Stream = ({ active, currentServer, setCurrentServer, manualSelection, setManualSelection }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [iframeURL, setIframeURL] = useState('');

  const showInlineAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(''), 3000);
  };

  const loadHlsStream = (serverId, fallback = false, index = 0) => {
    setIframeURL('');
    const video = videoRef.current;
    const url = `https://nflarcadia.xyz:443/bRtT37sn3w/Sx5q6YTgCs/${serverId}.m3u8`;

    if (!video) return;

    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      const onLoaded = () => {
        const duration = video.duration;
        video.removeEventListener('loadedmetadata', onLoaded);

        if (duration && duration <= 11) {
          if (fallback) {
            showInlineAlert(`Server ${serverId} offline. Trying next...`);
            const nextIndex = (index + 1) % hlsServers.length;
            const nextStreamId = hlsServers[nextIndex].streamId;
            setTimeout(() => loadHlsStream(nextStreamId, true, nextIndex), 2000);
          }
        } else {
          setCurrentServer(serverId);
        }
      };

      video.addEventListener('loadedmetadata', onLoaded);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal && fallback) {
          showInlineAlert(`HLS error on Server ${serverId}. Trying next...`);
          hls.destroy();
          const nextIndex = (index + 1) % hlsServers.length;
          const nextStreamId = hlsServers[nextIndex].streamId;
          setTimeout(() => loadHlsStream(nextStreamId, true, nextIndex), 2000);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    }
  };

  const handleHlsClick = (streamId, index) => {
    setManualSelection(true);
    loadHlsStream(streamId, true, index);
  };

  const handleIframeClick = (url) => {
    setIframeURL(url);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  useEffect(() => {
    if (!active || !videoRef.current) return;

    const index = hlsServers.findIndex(s => s.streamId === currentServer);
    if (!manualSelection && index !== -1) {
      loadHlsStream(currentServer, true, index);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [active]);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .stream-layout {
            flex-direction: column;
          }
        }
      `}</style>

      <div className={`tab-pane ${active ? 'active' : ''}`} id="stream">
        <div className="panel-box">
          <div className="titles">
            <h4>Live Match Stream</h4>
            {alertMessage && (
              <div style={{ backgroundColor: '#ffe9e9', color: '#c0392b', padding: '10px', borderRadius: '5px' }}>
                {alertMessage}
              </div>
            )}
          </div>

          <div className="text-center mb-3">
            {hlsServers.map((server, i) => (
              <button
                key={server.label}
                onClick={() => handleHlsClick(server.streamId, i)}
                style={{
                  margin: '4px',
                  padding: '6px 14px',
                  background: currentServer === server.streamId && !iframeURL ? '#33FFC9' : '#eee',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {server.label}
              </button>
            ))}

            {iframeServers.map((server) => (
              <button
                key={server.label}
                onClick={() => handleIframeClick(server.url)}
                style={{
                  margin: '4px',
                  padding: '6px 14px',
                  background: iframeURL === server.url ? '#33FFC9' : '#eee',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {server.label}
              </button>
            ))}
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-12 d-flex stream-layout" style={{ gap: '16px', flexWrap: 'wrap' }}>
              {/* 🎥 Stream Section */}
              <div style={{ flex: 2, width: '100%' }}>
                {iframeURL ? (
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    overflow: 'hidden',
                    borderRadius: '10px',
                    backgroundColor: '#000'
                  }}>
                    <iframe
                      id="streamFrame"
                      src={iframeURL}
                      allowFullScreen
                      scrolling="no"
                      sandbox="allow-scripts allow-same-origin"
                      referrerPolicy="no-referrer"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                      title="Live Stream"
                    />
                  </div>
                ) : (
                  <div style={{ width: '100%' }}>
                    <video
                      ref={videoRef}
                      controls
                      autoPlay
                      muted
                      style={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        backgroundColor: '#000',
                        borderRadius: '10px'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 💬 Chat Section */}
              <div style={{
                flex: 1,
                width: '100%',
                maxWidth: '800px'
              }}>
                <ChatBox />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Stream;
