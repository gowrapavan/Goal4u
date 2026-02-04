import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MobileNav = ({ isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timeout = setTimeout(() => setAnimateOpen(true), 10); // smooth open
      return () => clearTimeout(timeout);
    } else {
      setAnimateOpen(false); // start closing animation
      const timeout = setTimeout(() => {
      setShouldRender(false);
      setKeepAnimating(false); // <--- delayed
    }, 400); // after animation
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'World Cup', path: '/worldcup' },
    { label: 'Teams', path: '/teams' },
    { label: 'Players', path: '/players' },
    { label: 'Fixtures', path: '/fixtures' },
    { label: 'Live', path: '/live' },
    { label: 'Table', path: '/table-point' },
    { label: 'Groups', path: '/groups' },
    { label: 'About', path: '/about' },
  ];

  if (!shouldRender) return null;

  return (
    <>
      <style>{`
        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          width: 60%;
          max-width: 300px;
          height: 100vh;
          background: #fff;
          box-shadow: -2px 0 10px rgba(8, 232, 79, 0.2);
          z-index: 1000;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.4s ease, opacity 0.4s ease;
          transform: translateX(100%);
          opacity: 0;
          pointer-events: none;
        }

        .mobile-menu.open {
          transform: translateX(0);
          opacity: 1;
          pointer-events: auto;
        }

        .toggle {
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: 0.5s;
        }

        .bars {
          width: 100%;
          height: 4px;
          background-color: rgb(65, 186, 0);
          border-radius: 4px;
          transition: 0.5s;
        }

        .bars#bar1, .bars#bar3 {
          width: 70%;
        }

        .toggle.animate .bars {
          position: absolute;
        }

        .toggle.animate #bar1 {
          width: 100%;
          transform: rotate(45deg);
        }

        .toggle.animate #bar2 {
          transform: scaleX(0);
        }

        .toggle.animate #bar3 {
          width: 100%;
          transform: rotate(-45deg);
        }

        .toggle.animate {
          transform: rotate(180deg);
        }
      `}</style>

      <div className={`mobile-menu ${animateOpen ? 'open' : ''}`}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <h4 style={{ fontWeight: 600, margin: 0 }}>MENU</h4>

          <div onClick={onClose}>
            <label className={`toggle ${animateOpen ? 'animate' : ''}`}>
              <div className="bars" id="bar1" />
              <div className="bars" id="bar2" />
              <div className="bars" id="bar3" />
            </label>
          </div>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navLinks.map(({ label, path }) => (
            <li key={path}>
              <Link
                to={path}
                onClick={onClose}
                style={{
                  display: 'block',
                  padding: '10px 0',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#858983',
                  textDecoration: 'none',
                  borderBottom: '1px solid #eee',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => (e.target.style.color = '#0cae4a')}
                onMouseOut={(e) => (e.target.style.color = '#0645AD')}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default MobileNav;
