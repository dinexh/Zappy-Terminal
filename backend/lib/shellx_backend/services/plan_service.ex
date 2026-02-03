defmodule ShellxBackend.Services.PlanService do
  @moduledoc """
  Builds an execution plan from the validated intent.
  """

  use GenServer

  alias ShellxBackend.CommandDefinition

  def start_link(_args) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def plan(intent, %CommandDefinition{} = definition, context \\ %{}) do
    GenServer.call(__MODULE__, {:plan, intent, definition, context})
  end

  @impl true
  def init(state), do: {:ok, state}

  @impl true
  def handle_call({:plan, intent, %CommandDefinition{layers: %{plan: plan_fun}}, context}, _from, state)
      when is_function(plan_fun, 2) do
    {:reply, {:ok, plan_fun.(intent, context)}, state}
  end

  def handle_call({:plan, intent, _definition, _context}, _from, state) do
    plan = %{
      steps: [%{id: "execute", action: intent.action, params: intent.options}],
      reversible: false
    }

    {:reply, {:ok, plan}, state}
  end
end
