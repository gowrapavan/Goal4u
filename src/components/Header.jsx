import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainMenu from './MainMenu';
import MobileNav from './MobileNav';
import About from './About';

// ❌ Remove import: import MobileNav from './MobileNav';

const Header = () => {
  const headerHeight = '110px';

  return (
    <>
      <header
        className="header-3"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 999,
          backgroundColor: '#fff',
          boxShadow: '0 10px 10px rgba(12, 255, 20, 0.1)',
        }}
      >
        <div className="headerbox">
          <div className="container">
            <div className="row align-items-center justify-content-between">
              {/* Logo */}
              <div className="col-6 col-lg-3">
                <div className="logo">
                  <Link to="/" title="Return Home">
                    <img
                      src="/assets/img/fav2.png"
                      alt="Logo"
                      className="logo_img"
                    />
                  </Link>
                </div>
              </div>

              {/* Desktop Menu */}
              <div className="col-lg-9 d-none d-lg-block">
                <MainMenu />
              </div>

              {/* Mobile Hamburger Icon */}
              <div className="col-6 text-right d-lg-none">
                <a href="#mobile-nav" className="mobile-nav">
                  <i className="fa fa-bars" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Removed: <MobileNav /> */}

      <div style={{ height: headerHeight }}></div>
    </>
  );
};

export default Header;
