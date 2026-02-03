defmodule ShellxBackend.Parser do
  @moduledoc """
  Parses raw input into a structured command payload.
  """

  alias ShellxBackend.CommandDefinition

  def parse(input, %CommandDefinition{} = definition) when is_binary(input) do
    tokens = tokenize(input)
    command = List.first(tokens) || ""
    raw_args = Enum.drop(tokens, 1)

    {flags, positional_args} = parse_flags(raw_args, definition.flags || [])
    flags = apply_flag_defaults(flags, definition.flags || [])
    parameters = build_parameters(positional_args, definition.parameters || [])

    %{
      command: command,
      args: positional_args,
      flags: flags,
      raw_input: input,
      parameters: parameters
    }
  end

  def tokenize(input) do
    {tokens, current, _quote} =
      input
      |> String.graphemes()
      |> Enum.reduce({[], "", nil}, fn char, {tokens, current, quote} ->
        cond do
          quote != nil ->
            if char == quote do
              {tokens, current, nil}
            else
              {tokens, current <> char, quote}
            end

          char in ["\"", "'"] ->
            {tokens, current, char}

          char in [" ", "\t"] ->
            if current == "" do
              {tokens, current, quote}
            else
              {[current | tokens], "", quote}
            end

          true ->
            {tokens, current <> char, quote}
        end
      end)

    tokens = if current == "", do: tokens, else: [current | tokens]
    Enum.reverse(tokens)
  end

  defp parse_flags(args, flag_defs) do
    parse_flags(args, flag_defs, %{}, [])
  end

  defp parse_flags([], _flag_defs, flags, positional) do
    {flags, Enum.reverse(positional)}
  end

  defp parse_flags([arg | rest], flag_defs, flags, positional) do
    cond do
      String.starts_with?(arg, "--") ->
        flag_name = String.slice(arg, 2, String.length(arg) - 2)
        {flags, rest} = apply_long_flag(flag_name, rest, flag_defs, flags)
        parse_flags(rest, flag_defs, flags, positional)

      String.starts_with?(arg, "-") and String.length(arg) > 1 ->
        {flags, rest} = apply_short_flags(String.slice(arg, 1, String.length(arg) - 1), rest, flag_defs, flags)
        parse_flags(rest, flag_defs, flags, positional)

      true ->
        parse_flags(rest, flag_defs, flags, [arg | positional])
    end
  end

  defp apply_long_flag(flag_name, rest, flag_defs, flags) do
    case Enum.find(flag_defs, fn defn -> defn.name == flag_name end) do
      %{type: :boolean} ->
        {Map.put(flags, flag_name, true), rest}

      %{type: type} ->
        case rest do
          [value | tail] ->
            {Map.put(flags, flag_name, cast_value(value, type)), tail}

          [] ->
            {flags, rest}
        end

      _ ->
        {flags, rest}
    end
  end

  defp apply_short_flags(shorts, rest, flag_defs, flags) do
    chars = String.graphemes(shorts)

    Enum.reduce(chars, {flags, rest}, fn char, {flags, remaining} ->
      case Enum.find(flag_defs, fn defn -> defn.short == char end) do
        %{name: name, type: :boolean} ->
          {Map.put(flags, name, true), remaining}

        %{name: name, type: type} ->
          case remaining do
            [value | tail] ->
              {Map.put(flags, name, cast_value(value, type)), tail}

            [] ->
              {flags, remaining}
          end

        _ ->
          {flags, remaining}
      end
    end)
  end

  defp apply_flag_defaults(flags, flag_defs) do
    Enum.reduce(flag_defs, flags, fn defn, acc ->
      default = Map.get(defn, :default)

      if Map.has_key?(acc, defn.name) or is_nil(default) do
        acc
      else
        Map.put(acc, defn.name, default)
      end
    end)
  end

  defp build_parameters(positional_args, param_defs) do
    Enum.reduce(Enum.with_index(param_defs), %{}, fn {param_def, index}, acc ->
      param_type = Map.get(param_def, :type)
      default = Map.get(param_def, :default)

      cond do
        param_type == :array ->
          value = Enum.drop(positional_args, index)
          Map.put(acc, param_def.name, apply_transform(value, param_def))

        index < length(positional_args) ->
          value = Enum.at(positional_args, index)
          Map.put(acc, param_def.name, apply_transform(cast_value(value, param_type), param_def))

        not is_nil(default) ->
          Map.put(acc, param_def.name, default)

        true ->
          acc
      end
    end)
  end

  defp cast_value(value, :number) do
    case Integer.parse(value) do
      {int, ""} -> int
      _ -> value
    end
  end

  defp cast_value(value, :boolean) do
    value in ["true", "1", "yes"]
  end

  defp cast_value(value, _type), do: value

  defp apply_transform(value, %{transform: transform}) when is_function(transform, 1) do
    transform.(value)
  end

  defp apply_transform(value, _param_def), do: value
end
