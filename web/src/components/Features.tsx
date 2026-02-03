import React from 'react';
import './Features.css';

const features = [
  {
    title: 'Custom Commands',
    description: 'Create fully customizable commands with parameters, flags, validation, and documentation.',
    tags: ['Elixir', 'Pattern Matching']
  },
  {
    title: 'Layer Architecture',
    description: 'Commands flow through Intent, Validate, Plan, Execute, and Present layers.',
    tags: ['5 Layers', 'Dry-Run']
  },
  {
    title: 'Multi-Modal Output',
    description: 'Return structured data as tables, trees, lists, key-value pairs, and more.',
    tags: ['12+ Types', 'Composable']
  },
  {
    title: 'Smart Presentation',
    description: 'Terminal renders output with multiple display modes and consistent styling.',
    tags: ['5 Modes', 'Auto-Format']
  },
  {
    title: 'Composable',
    description: 'Chain commands together, create workflows, and build complex operations.',
    tags: ['Compose', 'Reusable']
  },
  {
    title: 'Self-Documenting',
    description: 'Commands include usage examples and descriptions for automatic help generation.',
    tags: ['Auto-Help', 'Examples']
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="features">
      <div className="container">
        <h2>Features</h2>
        <div className="features-list">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-header">
                <h3>{feature.title}</h3>
                <div className="feature-tags">
                  {feature.tags.map((tag, i) => (
                    <span key={i} className="tag">[{tag}]</span>
                  ))}
                </div>
              </div>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
