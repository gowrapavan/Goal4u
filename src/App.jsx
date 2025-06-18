import React from 'react'
import Header from './components/Header'
import MainMenu from './components/MainMenu'
import HeroSection from './components/HeroSection'
import ContentInfo from './components/ContentInfo'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div id="layout">
      <Header />
<div className="main-menu-wrapper">
  <MainMenu />
</div>
      <HeroSection />
      <ContentInfo />
      <Newsletter />
      <Footer />
      
      {/* Footer Down */}
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
  )
}

export default App