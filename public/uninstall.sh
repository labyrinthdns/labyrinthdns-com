#!/bin/sh
# Labyrinth DNS uninstaller launcher — https://labyrinthdns.com/uninstall.sh
#
# Fetches the real uninstall script from the labyrinthdns/labyrinth
# repository and executes it, forwarding every argument.
set -eu

UNINSTALLER_URL="https://raw.githubusercontent.com/labyrinthdns/labyrinth/main/uninstall.sh"

if command -v curl >/dev/null 2>&1; then
  exec sh -c 'curl -fsSL "$0" | bash -s -- "$@"' "$UNINSTALLER_URL" "$@"
elif command -v wget >/dev/null 2>&1; then
  exec sh -c 'wget -qO- "$0" | bash -s -- "$@"' "$UNINSTALLER_URL" "$@"
else
  echo "error: curl or wget is required to run the Labyrinth DNS uninstaller." >&2
  exit 1
fi
