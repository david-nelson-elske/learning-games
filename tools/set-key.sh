#!/bin/sh
# Save the ElevenLabs API key for this repository in .env, which git ignores.
# Usage: sh tools/set-key.sh
# The key is read without echo, so it stays out of the screen and the shell history.
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
env="$root/.env"

printf 'ElevenLabs API key (input hidden): '
stty -echo 2>/dev/null || true
IFS= read -r key
stty echo 2>/dev/null || true
printf '\n'
[ -n "$key" ] || { echo "No key given. Nothing changed." >&2; exit 1; }

umask 077
touch "$env"
tmp="$env.tmp"
grep -v '^ELEVENLABS_API_KEY=' "$env" > "$tmp" || true
printf 'ELEVENLABS_API_KEY=%s\n' "$key" >> "$tmp"
mv "$tmp" "$env"
chmod 600 "$env"

git -C "$root" check-ignore -q "$env" || { echo "Warning: .env is not ignored by git." >&2; exit 1; }
echo "Saved to .env (ignored by git, readable only by you)."
