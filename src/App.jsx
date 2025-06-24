import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MainMenu from './components/MainMenu';
import HeroSection from './components/HeroSection';
import ContentInfo from './components/ContentInfo';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import MobileFooter from './components/MobileFooter'; // ✅ Mobile-only footer
import LiveMatch from './components/live/livematch'; // ✅ LiveMatch details page
import Live from './components/live/live'; // ✅ Live match list page
import './App.css';

function App() {
  return (
    <Router>
      <div id="layout">
        <Header />
        

        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <ContentInfo />
                <Newsletter />
              </>
            }
          />
          {/* ✅ Live match listing */}
          <Route path="/live" element={<Live />} />

          {/* ✅ Live match detail via query params */}
          <Route path="/livematch" element={<LiveMatch />} />
        </Routes>

        {/* ✅ Mobile-only footer navigation */}
        <MobileFooter />

        {/* ✅ Main desktop footer */}
        <Footer />
        <div className="footer-down">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <p>&copy; 2018 SportsCup . All Rights Reserved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
