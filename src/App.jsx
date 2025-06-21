// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MainMenu from './components/MainMenu';
import HeroSection from './components/HeroSection';
import ContentInfo from './components/ContentInfo';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import LiveMatch from './components/live/livematch'; // <-- Import your live match component
import './App.css';

function App() {
  return (
    <Router>
      <div id="layout">
        <Header />
        <div className="main-menu-wrapper">
          <MainMenu />
        </div>

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
          <Route path="/live" element={<LiveMatch />} />
        </Routes>

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
