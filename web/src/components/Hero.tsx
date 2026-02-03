import React from 'react';
import './Hero.css';
import TerminalPreview from './TerminalPreview';

const Hero: React.FC = () => {
  return (
    <section id="top" className="hero">
      <div className="container">
        <div className="hero-header">
          <h1>ShellX Terminal</h1>
          <p className="hero-tagline">
            A modern terminal framework with an [<a href="https://elixir-lang.org/" target="_blank" rel="noopener noreferrer">Elixir</a>] backend and a [<a href="https://bun.sh/" target="_blank" rel="noopener noreferrer">Bun</a>]-powered CLI. 
            Features custom commands as first-class citizens, layer-wise architecture, and multi-modal output.
          </p>
          <p className="hero-description">
            Commands flow through five logical layers: Intent, Validate, Plan, Execute, and Present. 
            This enables dry-run support, execution tracing, and intelligent presentation across multiple display modes.
          </p>
          <div className="hero-actions">
            <p className="hero-links">
              View the [<a href="https://github.com/dinexh/ShellX" target="_blank" rel="noopener noreferrer">source code</a>] or try the [<a href="#demo">live demo</a>] below.
            </p>
            <a
              href="https://github.com/dinexh/ShellX"
              target="_blank"
              rel="noopener noreferrer"
              className="github-star-button"
            >
              ★ Star on GitHub
            </a>
          </div>
        </div>
        
        <div className="hero-terminal">
          <TerminalPreview />
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-value">5</span>
            <span className="stat-label">Command Layers</span>
          </div>
          <div className="stat">
            <span className="stat-value">12+</span>
            <span className="stat-label">Output Types</span>
          </div>
          <div className="stat">
            <span className="stat-value">5</span>
            <span className="stat-label">Display Modes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
