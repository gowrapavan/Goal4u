import React, { useState } from 'react';

const ShareButton = ({ video }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const shareUrl = `${window.location.origin}/videos/${video.videoId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareMenu(false);
      }, 2000);
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: 'fa-link',
      action: handleCopyLink
    },
    {
      name: 'WhatsApp',
      icon: 'fa-whatsapp',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(video.title + ' ' + shareUrl)}`, '_blank')
    },
    {
      name: 'Twitter',
      icon: 'fa-twitter',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
    },
    {
      name: 'Facebook',
      icon: 'fa-facebook',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
    }
  ];

  return (
    <div className="share-button-container">
      <button 
        className="share-btn"
        onClick={() => setShowShareMenu(!showShareMenu)}
      >
        <i className="fa fa-share"></i>
        <span className="d-none d-md-inline">Share</span>
      </button>
      
      {showShareMenu && (
        <>
          <div 
            className="share-backdrop"
            onClick={() => setShowShareMenu(false)}
          />
          <div className="share-menu">
            {copySuccess && (
              <div className="copy-success">
                <i className="fa fa-check"></i> Link copied!
              </div>
            )}
            {shareOptions.map((option, index) => (
              <button
                key={index}
                className="share-option"
                onClick={option.action}
              >
                <i className={`fa ${option.icon}`}></i>
                <span>{option.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;