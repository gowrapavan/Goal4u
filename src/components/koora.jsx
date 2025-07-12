import React, { useEffect, useRef, useState } from 'react';

const streams = [
  {
    id: 1,
    label: 'Server 1',
    url: 'https://dcb-fl-live.dtcdn.dazn.com/1u9ivr9koaj5718itvgfsa16da/mob25f/stream.m3u8?channel=2653&outlet=dazn-mena&plang=ar',
  },
  {
    id: 2,
    label: 'Server 2',
    url: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr-2/754931856515075b0aabf0e583495c68/index.m3u8',
  },
  {
    id: 3,
    label: 'Server 3',
    url: 'https://dcb-fl-live.dtcdn.dazn.com/zldbrzp8obsi1lolgbdmhnk0a/mob25f/stream.m3u8?channel=2650&outlet=dazn-mena&plang=ar',
  },
];

const Koora = () => {
  const playerRef = useRef(null);
  const [currentStream, setCurrentStream] = useState(streams[0].url);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    // Load Clappr script
    const clapprScript = document.createElement('script');
    clapprScript.src = 'https://cdn.jsdelivr.xyz/gh/clappr/clappr@latest/dist/clappr.min.js';
    clapprScript.async = true;

    // Load Level Selector plugin script
    const levelSelectorScript = document.createElement('script');
    levelSelectorScript.src = 'https://cdn.jsdelivr.xyz/gh/clappr/clappr-level-selector-plugin@latest/dist/level-selector.min.js';
    levelSelectorScript.async = true;

    document.body.appendChild(clapprScript);
    document.body.appendChild(levelSelectorScript);

    let loadedScripts = 0;
    const onScriptLoad = () => {
      loadedScripts += 1;
      if (loadedScripts === 2) {
        setScriptsLoaded(true);
      }
    };

    clapprScript.onload = onScriptLoad;
    levelSelectorScript.onload = onScriptLoad;

    return () => {
      document.body.removeChild(clapprScript);
      document.body.removeChild(levelSelectorScript);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!scriptsLoaded) return;

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    initializePlayer(currentStream);
  }, [currentStream, scriptsLoaded]);

  const initializePlayer = (source) => {
    const playerContainer = document.getElementById('video-frame');
    if (playerContainer) {
      playerContainer.innerHTML = ''; // Clear previous player DOM
    }

    playerRef.current = new window.Clappr.Player({
      source,
      parentId: '#video-frame',
      width: '100%',
      height: '100%',
      autoPlay: true,
      hideMediaControl: false,
      plugins: [window.LevelSelector],
    });
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '50px auto',
        backgroundColor: '#000',
        borderRadius: '10px',
        boxShadow: '0 0 20px #00ff88',
        padding: '10px',
      }}
    >
      {/* Server switch buttons */}
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        {streams.map((stream) => (
          <button
            key={stream.id}
            onClick={() => setCurrentStream(stream.url)}
            style={{
              cursor: 'pointer',
              padding: '8px 16px',
              margin: '0 5px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: currentStream === stream.url ? '#00ff88' : '#222',
              color: currentStream === stream.url ? '#000' : '#fff',
              fontWeight: 'bold',
            }}
          >
            {stream.label}
          </button>
        ))}
      </div>

      {/* Video frame */}
      <div
        id="video-frame"
        style={{
          width: '100%',
          height: '450px',
          border: '4px solid #00ff88',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      />
    </div>
  );
};

export default Koora;
