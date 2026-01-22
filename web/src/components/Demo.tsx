import React, { useState } from 'react';
import './Demo.css';

const modes = [
  { name: 'default', desc: 'Standard formatting' },
  { name: 'compact', desc: 'Reduced whitespace' },
  { name: 'detailed', desc: 'Full details + timing' },
  { name: 'json', desc: 'Raw JSON output' },
  { name: 'minimal', desc: 'Essential only' },
];

const demoOutputs: Record<string, string> = {
  default: `[OK] Analysis complete for: ./src

Overview
Total Files      : 22
Total Directories: 4
Total Size       : 115.2 KB

Files by Type
Extension | Count | Size    
----------+-------+---------
.ts       | 22    | 115.2 KB`,
  
  compact: `[OK] Analysis complete
Files: 22 | Dirs: 4 | Size: 115.2 KB
.ts: 22 files (115.2 KB)`,
  
  detailed: `[OK] Analysis complete for: ./src

Overview
Total Files      : 22
Total Directories: 4
Total Size       : 115.2 KB
Scan Depth       : 3

Files by Type
Extension | Count | Size    
----------+-------+---------
.ts       | 22    | 115.2 KB

Completed in 45ms`,
  
  json: `{
  "type": "composite",
  "children": [
    { "type": "success", "message": "Analysis complete" },
    { "type": "keyValue", "pairs": [
      { "key": "Total Files", "value": 22 },
      { "key": "Total Size", "value": 117964 }
    ]}
  ]
}`,
  
  minimal: `22 files, 4 dirs, 115.2 KB`
};

const Demo: React.FC = () => {
  const [activeMode, setActiveMode] = useState('default');

  return (
    <section id="demo" className="demo">
      <div className="container">
        <h2>Demo</h2>
        <p className="demo-intro">
          Switch between display modes to control how output is rendered. 
          Use <code>:mode &lt;name&gt;</code> in the terminal.
        </p>

        <div className="demo-content">
          <div className="mode-selector">
            {modes.map((mode) => (
              <button
                key={mode.name}
                className={`mode-btn ${activeMode === mode.name ? 'active' : ''}`}
                onClick={() => setActiveMode(mode.name)}
              >
                {mode.name}
              </button>
            ))}
          </div>

          <div className="demo-terminal">
            <div className="terminal-header">
              <span className="terminal-title">shellx</span>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="prompt">$</span>
                <span className="command">:mode {activeMode}</span>
              </div>
              <div className="terminal-response">
                Presentation mode set to: {activeMode}
              </div>
              <div className="terminal-line">
                <span className="prompt">$</span>
                <span className="command">lsx --analyze src</span>
              </div>
              <pre className="terminal-output">{demoOutputs[activeMode]}</pre>
            </div>
          </div>
        </div>

        <div className="demo-install">
          <p>Get started:</p>
          <pre><code>git clone https://github.com/dinexh/ShellX.git && cd ShellX && bun install && bun start</code></pre>
        </div>
      </div>
    </section>
  );
};

export default Demo;
