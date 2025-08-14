import React, { useEffect } from 'react';

const formatTimeAgo = (isoDate) => {
  const now = new Date();
  const date = new Date(isoDate);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

const CommentPopup = ({ isOpen, onClose, comments, commentCount }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={`comment-v-popup-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`comment-v-popup-drawer-video ${isOpen ? 'open' : ''}`}>
        <button className="comment-v-popup-close" onClick={onClose}>
          ×
        </button>
        
        <div className="comment-v-popup-header">
          <h3 className="comment-v-popup-title">
            {commentCount} Comments
          </h3>
        </div>
        
        <div className="comment-v-popup-list">
          {comments && comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="comment-v-item">
                <div className="comment-v-author">{comment.author}</div>
                <div className="comment-v-text">{comment.text}</div>
                <div className="comment-v-meta">
                  <span className="comment-v-like">👍 {comment.likeCount}</span>
                  <span className="comment-v-date">{formatTimeAgo(comment.publishedAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="comment-v-item comment-v-empty">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommentPopup;