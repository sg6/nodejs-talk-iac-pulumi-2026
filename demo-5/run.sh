#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "$repository_root/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$repository_root/.env"
  set +a
fi

: "${AWS_REGION:?Set AWS_REGION in .env}"
: "${BASE_BUCKET_NAME:?Set BASE_BUCKET_NAME in .env}"
: "${PULUMI_CONFIG_PASSPHRASE:?Set PULUMI_CONFIG_PASSPHRASE in .env}"

(cd "$repository_root/demo-5" && pulumi "$@")
