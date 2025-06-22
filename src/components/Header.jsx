import { Link } from 'react-router-dom';
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
  <Link to="/" title="Return Home">
    <img
      src="/assets/img/favicon.png"
      alt="Logo"
      className="logo_img"
    />
  </Link>
</div>
            </div>

            {/* Adds Header */}
            <div className="col">
             

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