defmodule ShellxBackend.Services.IntentService do
  @moduledoc """
  Interprets parsed input into a command intent.
  """

  use GenServer

  alias ShellxBackend.CommandDefinition

  def start_link(_args) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def interpret(parsed, %CommandDefinition{} = definition) do
    GenServer.call(__MODULE__, {:interpret, parsed, definition})
  end

  @impl true
  def init(state), do: {:ok, state}

  @impl true
  def handle_call({:interpret, parsed, %CommandDefinition{layers: %{intent: intent_fun}}}, _from, state)
      when is_function(intent_fun, 1) do
    {:reply, {:ok, intent_fun.(parsed)}, state}
  end

  def handle_call({:interpret, parsed, _definition}, _from, state) do
    intent = %{
      action: parsed.command,
      targets: parsed.args,
      options: Map.merge(parsed.flags, parsed.parameters)
    }

    {:reply, {:ok, intent}, state}
  end
end
