import { Link } from 'react-router-dom';

import React from 'react'
import LiveMatch from './live/livematch';

const MainMenu = () => {
  return (
    <nav className="mainmenu">
      <div className="container">
        <ul className="sf-menu" id="menu">
          <li className="current">
            <a href="index.html">Home</a>
          </li>

          <li>
            <a href="#">World Cup</a>
            <div className="sf-mega">
              <div className="row">
                <div className="col-md-3">
                  <h5><i className="fa fa-trophy" aria-hidden="true"></i>World Cup</h5>
                  <ul>
                    {/* Point Table removed */}
                    <li><a href="fixtures.html">Fixtures</a></li>
                    <li><a href="groups.html">Groups</a></li>
                    <li><a href="news-left-sidebar.html">News</a></li>
                    <li><a href="contact.html">Contact Us</a></li>
                  </ul>
                </div>

                <div className="col-md-3">
                  <h5><i className="fa fa-users" aria-hidden="true"></i> Teams List</h5>
                  <div className="img-hover">
                    <img
                      src="https://html.iwthemes.com/sportscup/run/img/blog/1.jpg"
                      alt=""
                      className="img-responsive"
                    />
                    <div className="overlay"><a href="teams.html">+</a></div>
                  </div>
                </div>

                <div className="col-md-3">
                  <h5><i className="fa fa-futbol-o" aria-hidden="true"></i> Players List</h5>
                  <div className="img-hover">
                    <img
                      src="https://html.iwthemes.com/sportscup/run/img/blog/2.jpg"
                      alt=""
                      className="img-responsive"
                    />
                    <div className="overlay"><a href="players.html">+</a></div>
                  </div>
                </div>

                <div className="col-md-3">
                  <h5><i className="fa fa-gamepad" aria-hidden="true"></i> Results Info</h5>
                  <div className="img-hover">
                    <img
                      src="https://html.iwthemes.com/sportscup/run/img/blog/3.jpg"
                      alt=""
                      className="img-responsive"
                    />
                    <div className="overlay"><a href="results.html">+</a></div>
                  </div>
                </div>
              </div>
            </div>
          </li>

          <li className="current">
            <a href="teams.html">Teams</a>
            <ul className="sub-current">
              <li><a href="teams.html">Teams List</a></li>
              <li><a href="single-team.html">Single Team</a></li>
            </ul>
          </li>

          <li className="current">
            <a href="players.html">Players</a>
            <ul className="sub-current">
              <li><a href="players.html">Players List</a></li>
              <li><a href="single-player.html">Single Player</a></li>
            </ul>
          </li>

          <li><a href="fixtures.html">Fixtures</a></li>

          <li className="current">
            <a href="results.html">Results</a>
            <ul className="sub-current">
              <li><a href="results.html">Results List</a></li>
              <li><a href="single-result.html">Single Result</a></li>
            </ul>
          </li>

          {/* Removed: <li><a href="table-point.html">Point Table</a></li> */}
          <li><a href="groups.html">Groups</a></li>

          {/* ✅ New Live menu item */}
          <li><a ><Link to="/live">Live</Link></a></li>

          <li>
            <a href="#">Features</a>
            <div className="sf-mega">
              <div className="row">
                <div className="col-md-3">
                  <h5>Features</h5>
                  <ul>
                    <li><a href="page-full-width.html">Full Width</a></li>
                    <li><a href="page-left-sidebar.html">Left Sidebar</a></li>
                    <li><a href="page-right-sidebar.html">Right Sidebar</a></li>
                    <li><a href="page-404.html">404 Page</a></li>
                    <li><a href="page-faq.html">FAQ</a></li>
                    <li><a href="sitemap.html">Sitemap</a></li>
                    <li><a href="page-pricing.html">Pricing</a></li>
                    <li><a href="page-register.html">Register Form</a></li>
                  </ul>
                </div>
                <div className="col-md-3">
                  <h5>Headers & Footers</h5>
                  <ul>
                    <li><a href="feature-header-footer-1.html">Header Version 1</a></li>
                    <li><a href="feature-header-footer-2.html">Header Version 2</a></li>
                    <li><a href="feature-header-footer-3.html">Header Version 3</a></li>
                    <li><a href="index-5.html">Header Version 4</a></li>
                    <li><a href="feature-header-footer-1.html#footer">Footer Version 1</a></li>
                    <li><a href="feature-header-footer-2.html#footer">Footer Version 2</a></li>
                    <li><a href="feature-header-footer-3.html#footer">Footer Version 3</a></li>
                  </ul>
                </div>

                <div className="col-md-3">
                  <h5>Pages</h5>
                  <ul>
                    <li><a href="page-about.html">About Us</a></li>
                    <li><a href="single-player.html">About Me</a></li>
                    <li><a href="services.html">Services</a></li>
                    <li><a href="single-team.html">Club Info</a></li>
                    <li><a href="single-result.html">Match Result</a></li>
                    <li><a href="table-point.html">Positions</a></li>
                  </ul>
                </div>

                <div className="col-md-3">
                  <h5>News</h5>
                  <ul>
                    <li><a href="news-left-sidebar.html">News Lef Sidebar</a></li>
                    <li><a href="news-right-sidebar.html">News Right Sidebar</a></li>
                    <li><a href="news-no-sidebar.html">News No Sidebar</a></li>
                    <li><a href="single-news.html">Single News</a></li>
                  </ul>
                </div>
                <i className="fa fa-trophy big-icon" aria-hidden="true"></i>
              </div>
            </div>
          </li>

          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}

export default MainMenu
