ExUnit.start()
if Application.get_env(:shellx_backend, :start_repo, false) do
  Ecto.Adapters.SQL.Sandbox.mode(ShellxBackend.Repo, :manual)
end
