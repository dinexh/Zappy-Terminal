defmodule ShellxBackend.ParserTest do
  use ExUnit.Case, async: true

  alias ShellxBackend.CommandDefinition
  alias ShellxBackend.Parser

  test "parses quoted args, flags, and parameters" do
    definition = %CommandDefinition{
      name: "lsx",
      parameters: [%{name: "path", type: :string, required: true}],
      flags: [
        %{name: "tree", short: "t", type: :boolean, default: false},
        %{name: "depth", short: "d", type: :number}
      ]
    }

    parsed = Parser.parse(~s(lsx "My Files" --tree -d 3), definition)

    assert parsed.command == "lsx"
    assert parsed.args == ["My Files"]
    assert parsed.flags["tree"] == true
    assert parsed.flags["depth"] == 3
    assert parsed.parameters["path"] == "My Files"
  end

  test "applies flag defaults when absent" do
    definition = %CommandDefinition{
      name: "lsx",
      parameters: [%{name: "path", type: :string, required: true}],
      flags: [%{name: "tree", short: "t", type: :boolean, default: false}]
    }

    parsed = Parser.parse("lsx /tmp", definition)

    assert parsed.flags["tree"] == false
  end
end
