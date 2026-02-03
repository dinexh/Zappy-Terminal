defmodule ShellxBackend.CommandDefinition do
  @moduledoc """
  Defines a command's schema and optional layer overrides.
  """

  defstruct name: "",
            parameters: [],
            flags: [],
            layers: %{}
end
