defmodule ShellxBackend.Pipeline do
  @moduledoc """
  Executes the ShellX command pipeline using supervised service processes.
  """

  alias ShellxBackend.CommandDefinition
  alias ShellxBackend.Parser
  alias ShellxBackend.Services.ExecuteService
  alias ShellxBackend.Services.IntentService
  alias ShellxBackend.Services.PlanService
  alias ShellxBackend.Services.PresentService
  alias ShellxBackend.Services.ValidateService

  def run(input, %CommandDefinition{} = definition, context \\ %{}) do
    parsed = Parser.parse(input, definition)

    with {:ok, intent} <- IntentService.interpret(parsed, definition),
         :ok <- ValidateService.validate(intent, definition, context),
         {:ok, plan} <- PlanService.plan(intent, definition, context),
         {:ok, output} <- ExecuteService.execute(plan, definition, build_context(context, parsed, intent, plan)),
         {:ok, presented} <- PresentService.present(output, definition, build_context(context, parsed, intent, plan)) do
      {:ok, presented}
    else
      {:error, reason} -> {:error, reason}
    end
  end

  defp build_context(context, parsed, intent, plan) do
    Map.merge(context, %{input: parsed, intent: intent, plan: plan})
  end
end
