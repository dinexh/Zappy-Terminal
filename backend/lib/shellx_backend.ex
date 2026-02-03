defmodule ShellxBackend do
  @moduledoc """
  ShellxBackend keeps the contexts that define your domain
  and business logic.
  """

  alias ShellxBackend.CommandDefinition
  alias ShellxBackend.Pipeline

  def run(input, %CommandDefinition{} = definition, context \\ %{}) do
    Pipeline.run(input, definition, context)
  end
end
