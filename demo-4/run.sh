#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
pulumi_image="${PULUMI_IMAGE:-pulumi/pulumi-nodejs:3.263.0}"
node_modules_volume="${PULUMI_NODE_MODULES_VOLUME:-iac-nodejs-talk-2026-demo-4-node-modules}"
pulumi_home_volume="${PULUMI_HOME_VOLUME:-iac-nodejs-talk-2026-demo-4-pulumi-home}"
pulumi_state_volume="${PULUMI_STATE_VOLUME:-iac-nodejs-talk-2026-demo-4-pulumi-state}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for demo-4. Install Docker Desktop or Docker Engine first." >&2
  exit 1
fi

if [[ ! -f "$repository_root/.env" ]]; then
  echo "Missing $repository_root/.env. Copy env.example to .env and fill in the values first." >&2
  exit 1
fi

docker_options=(run --rm)
if [[ -t 0 ]]; then
  docker_options+=(-i)
fi
if [[ -t 1 ]]; then
  docker_options+=(-t)
fi

docker_options+=(
  --env-file "$repository_root/.env"
  --mount "type=bind,src=$repository_root,dst=/workspace"
  --mount "type=volume,src=$node_modules_volume,dst=/workspace/node_modules"
  --mount "type=volume,src=$pulumi_home_volume,dst=/pulumi-home"
  --mount "type=volume,src=$pulumi_state_volume,dst=/pulumi-state"
  --env PULUMI_HOME=/pulumi-home
  --workdir /workspace
  --entrypoint bash
  "$pulumi_image"
)

docker "${docker_options[@]}" -c '
set -euo pipefail

: "${AWS_REGION:?Set AWS_REGION in .env}"
: "${BASE_BUCKET_NAME:?Set BASE_BUCKET_NAME in .env}"
: "${PULUMI_CONFIG_PASSPHRASE:?Set PULUMI_CONFIG_PASSPHRASE in .env}"

npm install --ignore-scripts --no-audit --no-fund
cd /workspace/demo-4

pulumi_args=("$@")
if [[ "${pulumi_args[0]:-}" == "login" ]]; then
  if [[ "${pulumi_args[1]:-}" == "--local" ]]; then
    pulumi_args=(login file:///pulumi-state "${pulumi_args[@]:2}")
  fi

  has_interactive_flag=false
  for argument in "${pulumi_args[@]}"; do
    if [[ "$argument" == "--interactive" || "$argument" == "--non-interactive" ]]; then
      has_interactive_flag=true
      break
    fi
  done

  if [[ "$has_interactive_flag" == false ]]; then
    pulumi_args+=(--non-interactive)
  fi
fi

exec pulumi "${pulumi_args[@]}"
' -- "$@"
