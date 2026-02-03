defmodule ShellxBackend.Services.PresentService do
  @moduledoc """
  Formats output based on presentation context.
  """

  use GenServer

  alias ShellxBackend.CommandDefinition

  def start_link(_args) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def present(output, %CommandDefinition{} = definition, context \\ %{}) do
    GenServer.call(__MODULE__, {:present, output, definition, context})
  end

  @impl true
  def init(state), do: {:ok, state}

  @impl true
  def handle_call({:present, output, %CommandDefinition{layers: %{present: present_fun}}, context}, _from, state)
      when is_function(present_fun, 2) do
    {:reply, {:ok, present_fun.(output, context)}, state}
  end

  def handle_call({:present, output, _definition, _context}, _from, state) do
    {:reply, {:ok, output}, state}
  end
end
