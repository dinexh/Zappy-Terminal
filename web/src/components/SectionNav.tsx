import React from 'react';
import './SectionNav.css';

const sections = [
  { id: 'top', label: 'Top' },
  { id: 'features', label: 'Features' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'commands', label: 'Commands' },
  { id: 'demo', label: 'Demo' },
];

const SectionNav: React.FC = () => {
  return (
    <nav className="section-nav" aria-label="Section navigation">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} aria-label={section.label} className="section-dot" />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SectionNav;

