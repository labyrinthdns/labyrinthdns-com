#!/bin/sh
# Labyrinth DNS installer launcher — https://labyrinthdns.com/install.sh
#
# Fetches the real installer from the labyrinthdns/labyrinth repository and
# executes it, forwarding every argument, e.g.:
#
#   curl -sSL https://labyrinthdns.com/install.sh | bash
#   curl -sSL https://labyrinthdns.com/install.sh | bash -s -- --no-service
#   curl -sSL https://labyrinthdns.com/install.sh | bash -s -- --version v0.8.36
set -eu

INSTALLER_URL="https://raw.githubusercontent.com/labyrinthdns/labyrinth/main/install.sh"

if command -v curl >/dev/null 2>&1; then
  exec sh -c 'curl -fsSL "$0" | bash -s -- "$@"' "$INSTALLER_URL" "$@"
elif command -v wget >/dev/null 2>&1; then
  exec sh -c 'wget -qO- "$0" | bash -s -- "$@"' "$INSTALLER_URL" "$@"
else
  echo "error: curl or wget is required to run the Labyrinth DNS installer." >&2
  exit 1
fi
