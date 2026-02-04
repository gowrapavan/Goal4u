import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainMenu from './MainMenu';
import MobileNav from './MobileNav';

const Header = () => {
  const isMobile = window.innerWidth <= 768;

  const [checked, setChecked] = useState(false);
  const location = useLocation(); // ✅ get current path

  const toggleMenu = () => setChecked((prev) => !prev);
  const closeMenu = () => setChecked(false);

  return (
    <>
      <style>{`
        .my-toggle-wrapper {
          position: relative;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition-duration: 0.5s;
        }

        .my-bar {
          width: 100%;
          height: 4px;
          background-color: rgb(65, 186, 0);
          border-radius: 4px;
          transition: all 0.5s ease;
        }

        .my-bar1, .my-bar3 {
          width: 70%;
        }

        .my-check {
          display: none;
        }

        .my-check:checked + .my-toggle-wrapper .my-bar2 {
          transform: scaleX(0);
        }

        .my-check:checked + .my-toggle-wrapper .my-bar1 {
          width: 100%;
          transform: rotate(45deg);
        }

        .my-check:checked + .my-toggle-wrapper .my-bar3 {
          width: 100%;
          transform: rotate(-45deg);
        }

        .my-check:checked + .my-toggle-wrapper {
          transform: rotate(180deg);
        }
      `}</style>
<header
        className="header-3"
        style={{
          position: 'relative', // ✅ Changed from 'fixed' to 'relative'
          width: '100%',
          zIndex: 999,
          // ✅ Keeps your color logic
          backgroundColor:
            location.pathname === "/livematch" ? "#111" : "#fff",
          color: location.pathname === "/livematch" ? "#fff" : "#000",
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
                      src={location.pathname === "/livematch" 
                            ? "/assets/img/site-logo/bg-noblk.png" 
                            : "/assets/img/site-logo/bg-white.png"}
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
              <div className="col-6 text-end d-lg-none">
                <div className="d-flex justify-content-end align-items-center">
                  <input
                    type="checkbox"
                    id="my-check"
                    className="my-check"
                    checked={checked}
                    onChange={toggleMenu}
                  />
                  <label htmlFor="my-check" className="my-toggle-wrapper">
                    <div className="my-bar my-bar1"></div>
                    <div className="my-bar my-bar2"></div>
                    <div className="my-bar my-bar3"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <MobileNav isOpen={checked} onClose={closeMenu} />

      
     
    </>
  );
};

export default Header;
