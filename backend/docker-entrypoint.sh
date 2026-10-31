#!/bin/sh
# Keeps node_modules in step with package-lock.json.
# Docker fills a named volume only when it is first created, so a dependency added
# later would be missing from it. This reinstalls only when the lockfile has changed.
set -e

LOCK_HASH=$(sha256sum package-lock.json | cut -d' ' -f1)
if [ "$(cat node_modules/.lock-hash 2>/dev/null)" != "$LOCK_HASH" ]; then
  echo "Installing dependencies from package-lock.json..."
  npm ci --no-audit --no-fund
  echo "$LOCK_HASH" > node_modules/.lock-hash
fi

exec "$@"
