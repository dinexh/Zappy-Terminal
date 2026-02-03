defmodule ShellxBackend.Services.ExecuteService do
  @moduledoc """
  Executes a plan and returns structured output.
  """

  use GenServer

  alias ShellxBackend.CommandDefinition
  alias ShellxBackend.Output

  def start_link(_args) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def execute(plan, %CommandDefinition{} = definition, context \\ %{}) do
    GenServer.call(__MODULE__, {:execute, plan, definition, context})
  end

  @impl true
  def init(state), do: {:ok, state}

  @impl true
  def handle_call({:execute, plan, %CommandDefinition{layers: %{execute: execute_fun}}, context}, _from, state)
      when is_function(execute_fun, 2) do
    {:reply, {:ok, execute_fun.(plan, context)}, state}
  end

  def handle_call({:execute, _plan, _definition, context}, _from, state) do
    action = get_in(context, [:intent, :action]) || "command"
    {:reply, {:ok, Output.text("Executed #{action}")}, state}
  end
end
