import React from 'react';
import './App.css';
import Hero from './components/Hero';
import Features from './components/Features';
import Architecture from './components/Architecture';
import Commands from './components/Commands';
import Demo from './components/Demo';
import Footer from './components/Footer';
import SectionNav from './components/SectionNav';

function App() {
  return (
    <div className="App">
      <SectionNav />
      <main>
        <Hero />
        <Features />
        <Architecture />
        <Commands />
        <Demo />
      </main>
      <Footer />
    </div>
  );
}

export default App;
