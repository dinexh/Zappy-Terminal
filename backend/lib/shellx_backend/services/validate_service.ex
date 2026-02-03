defmodule ShellxBackend.Services.ValidateService do
  @moduledoc """
  Validates the command intent and parameters.
  """

  use GenServer

  alias ShellxBackend.CommandDefinition

  def start_link(_args) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def validate(intent, %CommandDefinition{} = definition, context \\ %{}) do
    GenServer.call(__MODULE__, {:validate, intent, definition, context})
  end

  @impl true
  def init(state), do: {:ok, state}

  @impl true
  def handle_call({:validate, intent, %CommandDefinition{layers: %{validate: validate_fun}}, context}, _from, state)
      when is_function(validate_fun, 2) do
    reply =
      case validate_fun.(intent, context) do
        :ok -> :ok
        {:ok, _warnings} -> :ok
        {:error, reason} -> {:error, reason}
        %{valid: false, error: reason} -> {:error, reason}
        _ -> :ok
      end

    {:reply, reply, state}
  end

  def handle_call({:validate, intent, %CommandDefinition{parameters: param_defs}, _context}, _from, state) do
    param_defs = param_defs || []

    reply =
      Enum.reduce_while(param_defs, :ok, fn param_def, _acc ->
        value = Map.get(intent.options, param_def.name)
        required = Map.get(param_def, :required, false)
        choices = Map.get(param_def, :choices)
        validate_fun = Map.get(param_def, :validate)

        cond do
          required && (is_nil(value) || value == "") ->
            {:halt, {:error, "Required parameter '#{param_def.name}' is missing"}}

          choices && not is_nil(value) && value not in choices ->
            {:halt,
             {:error,
              "Invalid value '#{value}' for parameter '#{param_def.name}'. Valid options: #{Enum.join(choices, ", ")}"}}

          is_function(validate_fun, 1) ->
            case validate_fun.(value) do
              :ok -> {:cont, :ok}
              {:ok, _warnings} -> {:cont, :ok}
              {:error, reason} -> {:halt, {:error, reason}}
              %{valid: false, error: reason} -> {:halt, {:error, reason}}
              _ -> {:cont, :ok}
            end

          true ->
            {:cont, :ok}
        end
      end)

    {:reply, reply, state}
  end
end
