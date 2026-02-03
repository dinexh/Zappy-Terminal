defmodule ShellxBackend.ServicesTest do
  use ExUnit.Case, async: false

  setup_all do
    Application.ensure_all_started(:shellx_backend)
    :ok
  end

  test "service processes are running" do
    assert Process.whereis(ShellxBackend.Services.IntentService)
    assert Process.whereis(ShellxBackend.Services.ValidateService)
    assert Process.whereis(ShellxBackend.Services.PlanService)
    assert Process.whereis(ShellxBackend.Services.ExecuteService)
    assert Process.whereis(ShellxBackend.Services.PresentService)
  end
end
