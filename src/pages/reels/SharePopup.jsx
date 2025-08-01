import React, { useState } from "react";
import "./SharePopup.css"; // Create this CSS file or use Tailwind if preferred

const ShareButton = ({ videoId }) => {
  const [showPopup, setShowPopup] = useState(false);

  const shareUrl = `${window.location.origin}/shorts?video=${videoId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch (err) {
      alert("Failed to copy!");
    }
  };

  const togglePopup = (e) => {
    e.stopPropagation();
    setShowPopup(!showPopup);
  };

  return (
    <>
      <button className="action-btn share-btn" onClick={togglePopup}>
        <img src="/assets/img/club-logo/share.png" alt="Share" className="action-icon-share" />
        <span className="action-label-share">Share</span>
      </button>

      {showPopup && (
        <div className="share-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="share-popup" onClick={(e) => e.stopPropagation()}>
            <h4>Share</h4>
            <div className="share-icons">
              <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/WhatsApp_Logo_green.svg/330px-WhatsApp_Logo_green.svg.png" alt="WhatsApp" />
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" />
              </a>
              <a href={`https://t.me/share/url?url=${shareUrl}`} target="_blank">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Telegram_2019_Logo.svg/330px-Telegram_2019_Logo.svg.png" alt="Telegram" />
              </a>
              <a href={`mailto:?subject=Check this video&body=${shareUrl}`} target="_blank">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/250px-Gmail_icon_%282020%29.svg.png" alt="Gmail" />
              </a>
              <a href={`sms:?body=${shareUrl}`} target="_blank">
                <img src="/assets/img/message.png" alt="Messages" />
              </a>
              <a href={`https://www.instagram.com/`} target="_blank">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/330px-Instagram_logo_2022.svg.png" alt="Instagram" />
              </a>
            </div>

            <button onClick={handleCopy} className="copy-link-btn">Copy link</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;
