import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { initGA, trackPageView } from './services/gmanger-tag/GA_Measurement';
import { HelmetProvider } from 'react-helmet-async';
import InstaFeeds from "./pages/reels/ReelFeed";
import Shorts from "./pages/reels/Shorts";

// Components
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ContentInfo from './components/ContentInfo';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import MobileFooter from './components/MobileFooter';
import LiveMatch from './components/live/livematch';
import Live from './components/live/live';
import FixturesPage from './components/Fixture';
import About from './components/About';
import Bracket from './components/Bracket';
import NotFound404 from './components/NotFound404';
import MobileNav from './components/MobileNav';
import LiveTV from './components/live/LiveTv';
import ScrollToTop from './components/common/ScrollToTop';
import FloatButton from './components/common/FloatButton';
import PlayersByClub from './pages/Players/Player';
import Team from './components/team/Team';
import TeamProfile from './components/team/TeamProfile';
import LaLiga from './pages/leagues/LaLiga';
import EPL from './pages/leagues/EPL';
import Bundesliga from './pages/leagues/DEB';
import Standings from './pages/leagues/Standings';
import MultipleTV from './pages/TV/MultipleTV';
import Koora from './components/koora';

import './App.css';

function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
}

function AppWrapper() {
  usePageTracking();
  const location = useLocation();

  // Pages where footer should be hidden
  const noFooterPages = ['/shorts', '/shorts4u'];

  return (
    <>
      <MobileNav />
      <ScrollToTop />
      <div id="layout">
        {/* Header should be shown on all pages except '/shorts' */}
        {location.pathname !== '/shorts' && <Header />}

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
          <Route path="/shorts4u" element={<InstaFeeds />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/MultipleTV" element={<MultipleTV />} />
          <Route path="/players" element={<PlayersByClub />} />
          <Route path="/koora" element={<Koora />} />
          <Route path="/livetv" element={<LiveTV />} />
          <Route path="/about" element={<About />} />
          <Route path="/live" element={<Live />} />
          <Route path="/clubs" element={<Team />} />
          <Route path="/club" element={<TeamProfile />} />
          <Route path="/livematch" element={<LiveMatch />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/bracket" element={<Bracket />} />
          <Route path="*" element={<NotFound404 />} />
          <Route path="/league/laliga" element={<LaLiga />} />
          <Route path="/league/EPL" element={<EPL />} />
          <Route path="/league/bundesliga" element={<Bundesliga />} />
          <Route path="/league/standings" element={<Standings />} />
        </Routes>

        <MobileFooter />

        {/* Hide Footer on /shorts and /shorts4u */}
        {!noFooterPages.includes(location.pathname) && <Footer />}

        <FloatButton />
      </div>
    </>
  );
}


function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <AppWrapper />
      </Router>
    </HelmetProvider>
  );
}

export default App;
