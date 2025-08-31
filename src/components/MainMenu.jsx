import { Link } from 'react-router-dom';
import React, { useEffect } from 'react';

const MainMenu = () => {

    useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadAllScripts = async () => {
      try {
        await loadScript('/assets/js/jquery.js'); // local jQuery
        await loadScript('https://code.jquery.com/jquery-3.6.4.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jQuery.mmenu/8.5.24/mmenu.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery.sticky/1.0.4/jquery.sticky.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/superfish/1.7.10/js/superfish.min.js');
        await loadScript('/assets/js/theme-main.js'); // your theme script

        // Optionally, initialize any menu logic here if needed
        if (window.$) {
          $('.mainmenu').sticky({ topSpacing: 0 });
          $('ul.sf-menu').superfish();
        }
      } catch (error) {
        console.error('Failed to load one or more scripts:', error);
      }
    };

    loadAllScripts();
  }, []);
  return (
    <>
      {/* Desktop Mainmenu */}
      <nav className="mainmenu">
        <div className="container">
          <ul className="sf-menu" id="menu">
            <li className="current">
              <a href="index.html">Home</a>
            </li>
                        <li><a href="/videos">Video4u</a></li>


{            /*<li>
              <a href="#">World Cup</a>
              <div className="sf-mega">
                <div className="row">
                  <div className="col-md-3">
                    <h5><i className="fa fa-trophy" aria-hidden="true"></i>World Cup</h5>
                    <ul>
                      <li><a href="table-point.html">Point Table</a></li>
                      <li><a href="fixtures.html">Fixtures</a></li>
                      <li><a href="groups.html">Groups</a></li>
                      <li><a href="news-left-sidebar.html">News</a></li>
                      <li><a href="contact.html">Contact Us</a></li>
                    </ul>
                  </div>
                  <div className="col-md-3">
                    <h5><i className="fa fa-users" aria-hidden="true"></i> Teams List</h5>
                    <div className="img-hover">
                      <img src="img/blog/1.jpg" alt="" className="img-responsive" />
                      <div className="overlay"><a href="teams.html">+</a></div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <h5><i className="fa fa-futbol-o" aria-hidden="true"></i> Players List</h5>
                    <div className="img-hover">
                      <img src="img/blog/2.jpg" alt="" className="img-responsive" />
                      <div className="overlay"><a href="players.html">+</a></div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <h5><i className="fa fa-gamepad" aria-hidden="true"></i> Results Info</h5>
                    <div className="img-hover">
                      <img src="img/blog/3.jpg" alt="" className="img-responsive" />
                      <div className="overlay"><a href="results.html">+</a></div>
                    </div>
                  </div>
                </div>
              </div>
            </li>*/}

            <li className="current">
              <a href="/clubs">Teams</a>
              <ul className="sub-current">
                <li><a href="/league/laliga">LaLiga</a></li>
                <li><a href="single-team.html">Single Team</a></li>
              </ul>
            </li>

            <li className="current">
              <a href="/players">Players</a>
              
            </li>

            <li><a href="/fixtures">Fixtures</a></li>

            <li className="current">
              <a href="/livetv">Live</a>
            </li>

            <li><a href="table-point.html">Point Table</a></li>
            <li><a href="groups.html">Groups</a></li>

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
                    <h5>Headers &amp; Footers</h5>
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
                      <li><a href="news-left-sidebar.html">News Left Sidebar</a></li>
                      <li><a href="news-right-sidebar.html">News Right Sidebar</a></li>
                      <li><a href="news-no-sidebar.html">News No Sidebar</a></li>
                      <li><a href="single-news.html">Single News</a></li>
                    </ul>
                  </div>

                  <i className="fa fa-trophy big-icon" aria-hidden="true"></i>
                </div>
              </div>
            </li>

            <li><Link to="/about">About</Link></li>

          </ul>
        </div>
      </nav>
    </>
  );
};

export default MainMenu;
