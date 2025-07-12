import React from "react";

const servers = [
  { label: "HD1 Eng", url: "https://sportzonline.si/channels/hd/hd1.php" },
  { label: "HD2 Eng", url: "https://sportzonline.si/channels/hd/hd2.php" },
  { label: "HD3 Ger", url: "https://sportzonline.si/channels/hd/hd3.php" },
  { label: "HD4 Fr", url: "https://sportzonline.si/channels/hd/hd4.php" },
  // ⚠️ Stream that redirects to wgstream — open in new tab instead of iframe
  { label: "HD5 Eng", url: "https://cordneutral.net/embed/6jr6f01p2", external: true },
  { label: "HD6 Spn", url: "https://sportzonline.si/channels/hd/hd6.php" },
  { label: "HD7 Itl", url: "https://sportzonline.si/channels/hd/hd7.php" },
  { label: "HD8 Arb", url: "https://sportzonline.si/channels/hd/hd8.php" },
  { label: "HD9 Eng", url: "https://sportzonline.si/channels/hd/hd9.php" },
  { label: "HD10 Dut", url: "https://sportzonline.si/channels/hd/hd10.php" },
  { label: "HD Eng", url: "https://sportzonline.si/channels/hd/hd11.php" },
  { label: "BR1 Brazil", url: "https://sportzonline.si/channels/bra/br1.php" },
  { label: "SPORT TV 1", url: "https://sportsonline.si/channels/pt/sporttv1.php" },
  { label: "Benfica TV", url: "https://sportsonline.si/channels/pt/btv.php" },
  { label: "iServer 1", url: "https://letscast.pro/badir2.php?stream=HDGQZ2", external: true },
  { label: "Vivo 1", url: "https://vivosoccer.xyz/vivoall/1.php", external: true },
];

const TVFrame = ({ label, url, external }) => {
  const [key, setKey] = React.useState(Date.now());

  const handleOpen = () => {
    window.open(url, "_blank");
  };

  const refresh = () => setKey(Date.now());

  return (
    <div className="tv-card">
      <div className="tv-header">
        <span className="tv-label">{label}</span>
        {external ? (
          <button onClick={handleOpen} className="watch-btn">▶️ Watch</button>
        ) : (
          <button onClick={refresh} className="refresh-btn">🔄</button>
        )}
      </div>

      {external ? (
        <div className="preview-box">
          <p>🔐 Stream protected</p>
          <p>Click "Watch" to open in new tab</p>
        </div>
      ) : (
        <iframe
          key={key}
          src={url}
          allowFullScreen
          title={label}
          allow="autoplay"
          sandbox="allow-scripts allow-same-origin"
          className="tv-iframe"
        ></iframe>
      )}
    </div>
  );
};

const MultipleTV = () => (
  <div className="multi-tv-wrapper">
    {servers.map((server) => (
      <TVFrame key={server.label} {...server} />
    ))}

    <style jsx>{`
      .multi-tv-wrapper {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        padding: 16px;
        background: #0f0f0f;
      }
      .tv-card {
        background: #1a1a1a;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 0 8px #00ff77;
        display: flex;
        flex-direction: column;
        border: 1px solid #222;
        justify-content: space-between;
      }
      .tv-header {
        padding: 10px;
        background: #222;
        display: flex;
        justify-content: space-between;
        color: #33ffc9;
        font-weight: bold;
      }
      .refresh-btn,
      .watch-btn {
        background: none;
        border: 1px solid #33ffc9;
        cursor: pointer;
        padding: 5px 10px;
        font-size: 0.9rem;
        color: #33ffc9;
        border-radius: 6px;
      }
      .refresh-btn:hover,
      .watch-btn:hover {
        background: #33ffc920;
      }
      .tv-iframe {
        width: 100%;
        aspect-ratio: 16 / 9;
        border: none;
      }
      .preview-box {
        text-align: center;
        padding: 20px;
        color: #aaa;
        font-size: 14px;
      }
    `}</style>
  </div>
);

export default MultipleTV;
