import React from 'react';
import logo from '../../public/assets/img/white-logo.png';

const Footer = () => {
  return (
    <footer id="footer" className="footer-2">
      {/* Top Footer */}
      <div className="top-footer">
        <div className="logo-footer col-lg-12 text-center">
          <img
            src={logo}
            alt="GOAL4U Logo"
            style={{ height: '90px', objectFit: 'contain', marginBottom: '10px' }}
          />
        </div>

        <ul className="social">
          <li><div><a href="#" className="facebook"><i className="fa fa-facebook"></i></a></div></li>
          <li><div><a href="#" className="twitter-icon"><i className="fa fa-twitter"></i></a></div></li>
          <li><div><a href="#" className="youtube"><i className="fa fa-youtube"></i></a></div></li>
          <li><div><a href="#" className="instagram"><i className="fa fa-instagram"></i></a></div></li>
        </ul>
      </div>

      {/* Links Footer */}
      <div className="links-footer">
        <div className="container">
          {/* Desktop View: 3 Columns with Titles */}
          <div className="row d-none d-md-flex text-left">
            <div className="col-md-4 info-links">
              <h5>Explore</h5>
              <ul>
                <li><a href="#">Teams</a></li>
                <li><a href="#">Players</a></li>
                <li><a href="#">Stats</a></li>
              </ul>
            </div>
            <div className="col-md-4 info-links">
              <h5>Live</h5>
              <ul>
                <li><a href="#">Live</a></li>
                <li><a href="#">LiveTV</a></li>
                <li><a href="#">Fixtures</a></li>
              </ul>
            </div>
            <div className="col-md-4 info-links">
              <h5>Leagues</h5>
              <ul>
                <li><a href="/league/EPL">Premier League</a></li>
                <li><a href="/league/laliga">La Liga</a></li>
                <li><a href="/league/bundesliga">Bundesliga</a></li>
              </ul>
            </div>
          </div>

          {/* Mobile View: One title and 3-column grid */}
          <div className="row d-md-none text-center">
            <div className="col-12 info-links">
              <h5>Explore</h5>
              <div className="row">
                <div className="col-4">
                  <ul>
                    <li><a href="#">Teams</a></li>
                    <li><a href="#">Players</a></li>
                    <li><a href="#">Stats</a></li>
                  </ul>
                </div>
                <div className="col-4">
                  <ul>
                    <li><a href="#">Live</a></li>
                    <li><a href="#">LiveTV</a></li>
                    <li><a href="#">Fixtures</a></li>
                  </ul>
                </div>
                <div className="col-4">
                  <ul>
                    <li><a href="/league/EPL">Premier League</a></li>
                    <li><a href="/league/laliga">La Liga</a></li>
                    <li><a href="/league/bundesliga">Bundesliga</a></li>
                      </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-down">
        <div className="col-md-12 text-center py-3">
          <p>© {new Date().getFullYear()} GOAL4U. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
