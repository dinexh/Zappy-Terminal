import React, { useState } from 'react';
import './Commands.css';

const commandCategories = [
  {
    name: 'Basic',
    commands: [
      { name: 'hi', desc: 'Say hello', usage: 'hi' },
      { name: 'help', desc: 'Show help', usage: 'help' },
      { name: 'clear', desc: 'Clear screen', usage: 'clear' },
      { name: 'pwd', desc: 'Current directory', usage: 'pwd' },
    ]
  },
  {
    name: 'Enhanced',
    commands: [
      { name: 'lsx', desc: 'Rich directory listing', usage: 'lsx [path] [--tree] [--long]' },
      { name: 'info', desc: 'File information', usage: 'info <path>' },
      { name: 'search', desc: 'Search files', usage: 'search <pattern> [-r]' },
      { name: 'du', desc: 'Disk usage', usage: 'du [path]' },
      { name: 'env', desc: 'Environment info', usage: 'env [--all]' },
    ]
  },
  {
    name: 'Files',
    commands: [
      { name: 'ls', desc: 'List files', usage: 'ls' },
      { name: 'cd', desc: 'Change directory', usage: 'cd <dir>' },
      { name: 'mkdir', desc: 'Create directory', usage: 'mkdir <name>' },
      { name: 'touch', desc: 'Create file', usage: 'touch <file>' },
      { name: 'rm', desc: 'Remove file/dir', usage: 'rm <file> | rm -rf <dir>' },
      { name: 'mv', desc: 'Move/rename', usage: 'mv <src> <dst>' },
      { name: 'cat', desc: 'View file', usage: 'cat <file>' },
    ]
  },
  {
    name: 'System',
    commands: [
      { name: 'git', desc: 'Git commands', usage: 'git <command>' },
      { name: 'exit', desc: 'Exit terminal', usage: 'exit' },
      { name: ':mode', desc: 'Switch mode', usage: ':mode <mode>' },
    ]
  }
];

const outputTypes = [
  'Text', 'Table', 'List', 'Tree', 'KeyValue', 'Progress',
  'Success', 'Error', 'Warning', 'Info', 'Diff', 'Composite'
];

const Commands: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <section id="commands" className="commands">
      <div className="container">
        <h2>Commands</h2>
        
        <div className="commands-layout">
          <div className="commands-main">
            <div className="category-tabs">
              {commandCategories.map((cat, index) => (
                <button
                  key={index}
                  className={`category-tab ${activeCategory === index ? 'active' : ''}`}
                  onClick={() => setActiveCategory(index)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            
            <div className="commands-list">
              {commandCategories[activeCategory].commands.map((cmd, index) => (
                <div key={index} className="command-item">
                  <code className="command-name">{cmd.name}</code>
                  <span className="command-desc">{cmd.desc}</span>
                  <code className="command-usage">{cmd.usage}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="output-types">
            <h3>Output Types</h3>
            <div className="output-list">
              {outputTypes.map((type, index) => (
                <span key={index} className="output-type">[{type}]</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Commands;
