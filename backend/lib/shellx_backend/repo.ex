defmodule ShellxBackend.Repo do
  use Ecto.Repo,
    otp_app: :shellx_backend,
    adapter: Ecto.Adapters.Postgres
end
