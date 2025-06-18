import React from 'react'

const Header = () => {
  return (
    <header>
      <div className="headerbox">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            {/* Logo */}
            <div className="col">
              <div className="logo">
                <a href="index.html" title="Return Home">
                  <img
                    src="https://html.iwthemes.com/sportscup/run/img/logo.png"
                    alt="Logo"
                    className="logo_img"
                  />
                </a>
              </div>
            </div>

            {/* Adds Header */}
            <div className="col">
              <div className="adds">
                <a
                  href="http://themeforest.net/user/iwthemes/portfolio?ref=iwthemes"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://html.iwthemes.com/sportscup/run/img/adds/banner.jpg"
                    alt=""
                    className="img-responsive"
                  />
                </a>
              </div>

              {/* Call Nav Menu */}
              <a className="mobile-nav" href="#mobile-nav">
                <i className="fa fa-bars"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header