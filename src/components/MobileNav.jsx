import React, { useEffect } from 'react'; // ✅ Must include useEffect
import { Link } from 'react-router-dom';



const MobileNav = () => {
  return (

    
    <div id="mobile-nav" className="mobile-nav-wrapper">
      <ul className="mm-listview">
        <li>
          <Link to="/">Home</Link>
          <ul>
            <li><Link to="/index-1">Home 1</Link></li>
            <li><Link to="/index-2">Home 2</Link></li>
            <li><Link to="/index-3">Home 3</Link></li>
            <li><Link to="/index-4">Home 4</Link></li>
            <li><Link to="/index-5">Home 5</Link></li>
            <li><Link to="/index-6">Home 6</Link></li>
          </ul>
        </li>

        <li>
          <Link to="#">World Cup</Link>
          <ul>
            <li>
              <Link to="#">World Cup</Link>
              <ul>
                <li><Link to="/table-point">Point Table</Link></li>
                <li><Link to="/fixtures">Fixtures</Link></li>
                <li><Link to="/groups">Groups</Link></li>
                <li><Link to="/news-left-sidebar">News</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </li>
            <li><Link to="/teams">Teams List</Link></li>
            <li><Link to="/players">Players List</Link></li>
            <li><Link to="/results">Results List</Link></li>
          </ul>
        </li>

        <li>
          <Link to="/teams">Teams</Link>
          <ul>
            <li><Link to="/teams">Teams List</Link></li>
            <li><Link to="/single-team">Single Team</Link></li>
          </ul>
        </li>

        <li>
          <Link to="/players">Players</Link>
          <ul>
            <li><Link to="/players">Players List</Link></li>
            <li><Link to="/single-player">Single Player</Link></li>
          </ul>
        </li>

        <li><Link to="/fixtures">Fixtures</Link></li>

        <li>
          <Link to="/live">Live</Link>
          
        </li>

        <li><Link to="/table-point">Point Table</Link></li>
        <li><Link to="/groups">Groups</Link></li>

        <li>
          <Link to="#">Features</Link>
          <ul>
            <li>
              <Link to="#">Features</Link>
              <ul>
                <li><Link to="/page-full-width">Full Width</Link></li>
                <li><Link to="/page-left-sidebar">Left Sidebar</Link></li>
                <li><Link to="/page-right-sidebar">Right Sidebar</Link></li>
                <li><Link to="/page-404">404 Page</Link></li>
                <li><Link to="/page-faq">FAQ</Link></li>
                <li><Link to="/sitemap">Sitemap</Link></li>
                <li><Link to="/page-pricing">Pricing</Link></li>
                <li><Link to="/page-register">Register Form</Link></li>
              </ul>
            </li>

            <li>
              <Link to="#">Headers & Footers</Link>
              <ul>
                <li><Link to="/feature-header-footer-1">Header Version 1</Link></li>
                <li><Link to="/feature-header-footer-2">Header Version 2</Link></li>
                <li><Link to="/feature-header-footer-3">Header Version 3</Link></li>
                <li><Link to="/index-5">Header Version 4</Link></li>
              </ul>
            </li>

            <li>
              <Link to="#">Pages</Link>
              <ul>
                <li><Link to="/page-about">About Us</Link></li>
                <li><Link to="/single-player">About Me</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/single-team">Club Info</Link></li>
                <li><Link to="/single-result">Match Result</Link></li>
                <li><Link to="/table-point">Positions</Link></li>
              </ul>
            </li>

            <li>
              <Link to="#">News</Link>
              <ul>
                <li><Link to="/news-left-sidebar">News Left Sidebar</Link></li>
                <li><Link to="/news-right-sidebar">News Right Sidebar</Link></li>
                <li><Link to="/news-no-sidebar">News No Sidebar</Link></li>
                <li><Link to="/single-news">Single News</Link></li>
              </ul>
            </li>
          </ul>
        </li>

        <li><Link to="/contact">Contact</Link></li>
      </ul>
    </div>
  );
};

export default MobileNav;
