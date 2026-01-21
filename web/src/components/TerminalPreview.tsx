import React, { useState, useEffect } from 'react';
import './TerminalPreview.css';

const commands = [
  { input: 'lsx --tree src', output: `src/
  core/
    terminal.ts
    output.ts
    pipeline.ts
  commands/
    basic.ts
    enhanced.ts
  main.ts` },
  { input: 'env', output: `Node Version : v20.0.0
Platform     : darwin
Architecture : arm64
User         : developer` },
  { input: ':mode compact', output: 'Presentation mode set to: compact' },
  { input: 'help', output: `Commands: hi, help, clear, pwd, ls, cd, 
mkdir, touch, rm, mv, cat, lsx, info, 
search, du, env, git, exit, :mode` },
];

const TerminalPreview: React.FC = () => {
  const [currentCmd, setCurrentCmd] = useState(0);
  const [typing, setTyping] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    const cmd = commands[currentCmd];
    let charIndex = 0;
    setTyping('');
    setShowOutput(false);

    const typeInterval = setInterval(() => {
      if (charIndex < cmd.input.length) {
        setTyping(cmd.input.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => setShowOutput(true), 300);
        setTimeout(() => {
          setCurrentCmd((prev) => (prev + 1) % commands.length);
        }, 3000);
      }
    }, 80);

    return () => clearInterval(typeInterval);
  }, [currentCmd]);

  return (
    <div className="terminal-preview">
      <div className="terminal-header">
        <span className="terminal-title">shellx ~/project</span>
      </div>
      <div className="terminal-body">
        <div className="terminal-line">
          <span className="prompt">$</span>
          <span className="command">{typing}</span>
          <span className="cursor">|</span>
        </div>
        {showOutput && (
          <pre className="terminal-output">{commands[currentCmd].output}</pre>
        )}
      </div>
    </div>
  );
};

export default TerminalPreview;
