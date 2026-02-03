import React, { useState } from 'react';
import './Architecture.css';

const layers = [
  {
    name: 'Intent',
    description: 'Interpret what the user wants to do',
    details: 'Parse raw input, extract command name, arguments, and flags. Convert to structured intent object.',
    code: `on_intent fn input ->
  %{
    action: "list",
    targets: [List.first(input.args)],
    options: %{tree: input.flags.tree}
  }
end`
  },
  {
    name: 'Validate',
    description: 'Check if operation can be performed',
    details: 'Verify required parameters, validate types, check permissions, return warnings.',
    code: `on_validate fn intent, _ctx ->
  case intent.targets do
    [nil | _] -> {:error, "Path required"}
    [] -> {:error, "Path required"}
    _ -> :ok
  end
end`
  },
  {
    name: 'Plan',
    description: 'Create an execution plan',
    details: 'Build step-by-step plan, enable dry-run mode, estimate impact, define rollback.',
    code: `on_plan fn _intent, _ctx ->
  %{
    steps: [
      %{id: "read", action: "readdir"},
      %{id: "format", action: "format"}
    ],
    reversible: true
  }
end`
  },
  {
    name: 'Execute',
    description: 'Perform the actual operation',
    details: 'Run each step in the plan, emit events, handle errors, return structured output.',
    code: `on_execute fn plan, ctx ->
  items = File.ls!(ctx.path)
  Output.table(
    ["Name", "Type"],
    Enum.map(items, fn name -> [name, "file"] end)
  )
end`
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
          Commands flow through five logical layers for predictability and extensibility. The backend pipeline is implemented in Elixir for concurrency and fault tolerance. 
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
