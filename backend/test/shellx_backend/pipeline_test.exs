defmodule ShellxBackend.PipelineTest do
  use ExUnit.Case, async: true

  alias ShellxBackend.CommandDefinition
  alias ShellxBackend.Output
  alias ShellxBackend.Pipeline

  test "returns error when required parameter missing" do
    definition = %CommandDefinition{
      name: "info",
      parameters: [%{name: "path", type: :string, required: true}]
    }

    assert {:error, "Required parameter 'path' is missing"} = Pipeline.run("info", definition)
  end

  test "uses default pipeline behavior" do
    definition = %CommandDefinition{name: "hi"}

    assert {:ok, %Output{type: :text, payload: "Executed hi"}} = Pipeline.run("hi", definition)
  end

  test "supports custom layer overrides" do
    definition = %CommandDefinition{
      name: "demo",
      layers: %{
        intent: fn parsed -> %{action: "custom", targets: parsed.args, options: parsed.parameters} end,
        validate: fn _intent, _ctx -> :ok end,
        plan: fn intent, _ctx -> %{steps: [%{id: "#{intent.action}-step"}], reversible: true} end,
        execute: fn _plan, ctx ->
          Output.text("ran #{ctx.intent.action} with #{Enum.join(ctx.input.args, ",")}")
        end,
        present: fn output, _ctx -> Output.text("presented: #{output.payload}") end
      }
    }

    assert {:ok, %Output{payload: "presented: ran custom with 1,2"}} =
             Pipeline.run("demo 1 2", definition)
  end
end
