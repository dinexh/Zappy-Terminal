defmodule ShellxBackend.Output do
  @moduledoc """
  Structured output values returned by commands.
  """

  defstruct type: :text, payload: nil

  def text(content) when is_binary(content) do
    %__MODULE__{type: :text, payload: content}
  end

  def table(headers, rows) when is_list(headers) and is_list(rows) do
    %__MODULE__{type: :table, payload: %{headers: headers, rows: rows}}
  end

  def list(items) when is_list(items) do
    %__MODULE__{type: :list, payload: items}
  end
end
