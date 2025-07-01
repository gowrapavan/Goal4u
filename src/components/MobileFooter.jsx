import React from 'react';
import { Link } from 'react-router-dom';

const MobileFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #ddd',
    zIndex: 1000,
    height: '36px', // Very compact
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0 5px',
  };

  const itemStyle = {
    color: '#212529',
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
      <Link to="/players" style={itemStyle} onClick={scrollToTop}>
        <i className="fa fa-users" style={iconStyle}></i> Teams
      </Link>
      <Link to="/profile" style={itemStyle} onClick={scrollToTop}>
        <i className="fa fa-user" style={iconStyle}></i> Profile
      </Link>
      <Link to="/about" style={itemStyle} onClick={scrollToTop}>
        <i className="fa fa-about" style={iconStyle}></i> About
      </Link>
    </footer>
  );
};

export default MobileFooter;
