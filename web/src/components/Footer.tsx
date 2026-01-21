import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          Built with [<a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">TypeScript</a>] and [<a href="https://bun.sh/" target="_blank" rel="noopener noreferrer">Bun</a>]. 
          View [<a href="https://github.com/user/shellx-terminal" target="_blank" rel="noopener noreferrer">source</a>].
        </p>
        <p>
          Made by [<a href="https://dineshkorukonda.in" target="_blank" rel="noopener noreferrer">Dinesh Korukonda</a>]
        </p>
      </div>
    </footer>
  );
};

export default Footer;
