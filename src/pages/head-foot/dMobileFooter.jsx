import React from 'react';
import { Link } from 'react-router-dom';

const DMobileFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#121212',
    borderTop: '1px solid #333',
    zIndex: 1000,
    height: '40px',
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0 5px',
  };

  const itemStyle = {
    color: '#f1f1f1',
    textDecoration: 'none',
    fontWeight: 500,
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const iconStyle = {
    fontSize: '15px',
    lineHeight: '1',
  };

  return (
    <footer className="d-md-none d-lg-none d-xl-none" style={footerStyle}>
      <Link to="/" style={itemStyle} onClick={scrollToTop}>
        <i className="fa fa-home" style={iconStyle}></i> Home
      </Link>
      <Link to="/livetv" style={itemStyle} onClick={scrollToTop}>
        <i className="fa fa-tv" style={iconStyle}></i> Live
      </Link>
      <Link to="/shorts" style={itemStyle} onClick={scrollToTop}>
        <i className="fa fa-play-circle" style={iconStyle}></i> Reels
      </Link>
      <Link to="/clubs" style={itemStyle} onClick={scrollToTop}>
        <i className="fa fa-users" style={iconStyle}></i> Teams
      </Link>
      <Link to="/profile" style={itemStyle} onClick={scrollToTop}>
        <i className="fa fa-user" style={iconStyle}></i> Profile
      </Link>
    </footer>
  );
};

export default DMobileFooter;
