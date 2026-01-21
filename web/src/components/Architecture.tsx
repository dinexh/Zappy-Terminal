import React, { useState } from 'react';
import './Architecture.css';

const layers = [
  {
    name: 'Intent',
    description: 'Interpret what the user wants to do',
    details: 'Parse raw input, extract command name, arguments, and flags. Convert to structured intent object.',
    code: `onIntent((input) => ({
  action: "list",
  targets: [input.args[0]],
  options: { tree: input.flags.tree }
}))`
  },
  {
    name: 'Validate',
    description: 'Check if operation can be performed',
    details: 'Verify required parameters, validate types, check permissions, return warnings.',
    code: `onValidate(async (intent, ctx) => {
  if (!intent.targets[0]) {
    return { valid: false, error: "Path required" };
  }
  return { valid: true };
})`
  },
  {
    name: 'Plan',
    description: 'Create an execution plan',
    details: 'Build step-by-step plan, enable dry-run mode, estimate impact, define rollback.',
    code: `onPlan((intent, ctx) => ({
  steps: [
    { id: "read", action: "readdir" },
    { id: "format", action: "format" }
  ],
  reversible: true
}))`
  },
  {
    name: 'Execute',
    description: 'Perform the actual operation',
    details: 'Run each step in the plan, emit events, handle errors, return structured output.',
    code: `onExecute(async (plan, ctx) => {
  const items = await fs.readdir(path);
  return Output.table(
    ["Name", "Type"],
    items.map(i => [i.name, i.type])
  );
})`
  },
  {
    name: 'Present',
    description: 'Format output for display',
    details: 'Terminal renders output based on mode (default, compact, detailed, json, minimal).',
    code: `// Terminal handles automatically
// Based on :mode setting

:mode json     // Raw JSON output
:mode detailed // Full details
:mode minimal  // Essential only`
  }
];

const Architecture: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState(0);

  return (
    <section id="architecture" className="architecture">
      <div className="container">
        <h2>Architecture</h2>
        <p className="architecture-intro">
          Commands flow through five logical layers for predictability and extensibility. 
          Click each layer to see details.
        </p>
        
        <div className="architecture-content">
          <div className="layer-tabs">
            {layers.map((layer, index) => (
              <button
                key={index}
                className={`layer-tab ${activeLayer === index ? 'active' : ''}`}
                onClick={() => setActiveLayer(index)}
              >
                <span className="layer-number">{index + 1}</span>
                <span className="layer-name">{layer.name}</span>
              </button>
            ))}
          </div>

          <div className="layer-content">
            <div className="layer-header">
              <h3>{layers[activeLayer].name}</h3>
              <p className="layer-desc">{layers[activeLayer].description}</p>
            </div>
            <p className="layer-details">{layers[activeLayer].details}</p>
            <pre className="layer-code">
              <code>{layers[activeLayer].code}</code>
            </pre>
          </div>
        </div>

        <div className="architecture-benefits">
          <div className="benefit">
            <strong>Dry-Run</strong> — Preview without executing
          </div>
          <div className="benefit">
            <strong>Validation</strong> — Prevent destructive mistakes
          </div>
          <div className="benefit">
            <strong>Tracing</strong> — Track every step
          </div>
          <div className="benefit">
            <strong>Rollback</strong> — Undo operations
          </div>
        </div>
      </div>
    </section>
  );
};

export default Architecture;
