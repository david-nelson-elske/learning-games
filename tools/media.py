"""Keep large generated media out of git and in Google Drive, with a list of it in git.

    python3 tools/media.py list     # write media.json: every media file on disk, its size and checksum
    python3 tools/media.py check    # say which listed files are missing or changed on this machine
    python3 tools/media.py big      # list tracked or staged files over the size limit; exit 1 if any
    python3 tools/media.py sync     # copy every media file to Google Drive with rclone (one way, never deletes)
    python3 tools/media.py fetch    # copy media from Google Drive to this machine

Media is any file that git ignores under a subject folder: videos, and each lesson's build/ folder.
The rclone remote is named by LEARNING_GAMES_REMOTE, default "learning-games-drive:Learning games".
Standard library only.
"""
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "media.json"
LIMIT = 1_000_000
REMOTE = os.environ.get("LEARNING_GAMES_REMOTE", "learning-games-drive:Learning games")
SUBJECTS = ["maths"]


def git(*args):
    return subprocess.run(["git", "-C", str(ROOT), *args], check=True, capture_output=True, text=True).stdout


def media_files():
    """Ignored files under the subject folders, as paths relative to the root."""
    out = git("ls-files", "--others", "--ignored", "--exclude-standard", "-z", "--", *SUBJECTS)
    return sorted(p for p in out.split("\0") if p and not Path(p).name.startswith("."))


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def load():
    return json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {"files": {}}


def cmd_list():
    old = load()["files"]
    files = {}
    for p in media_files():
        entry = {"bytes": (ROOT / p).stat().st_size, "sha256": sha256(ROOT / p)}
        if old.get(p, {}).get("url"):
            entry["url"] = old[p]["url"]
        files[p] = entry
    doc = {"about": "Generated media kept out of git. The files are in Google Drive, folder 'Learning games', "
                    "at the same paths. A url is where the public can watch or download the file. See docs/media.md.",
           "files": files}
    MANIFEST.write_text(json.dumps(doc, indent=2) + "\n", encoding="utf-8")
    total = sum(f["bytes"] for f in files.values())
    print(f"media.json lists {len(files)} files, {total / 1e6:.1f} MB")


def cmd_check():
    bad = 0
    for p, f in load()["files"].items():
        path = ROOT / p
        if not path.exists():
            print("missing", p); bad += 1
        elif path.stat().st_size != f["bytes"] or sha256(path) != f["sha256"]:
            print("changed", p); bad += 1
    print("all media present and unchanged" if not bad else f"{bad} files missing or changed: run fetch, or list")
    return 1 if bad else 0


def cmd_big():
    tracked = set(git("ls-files", "-z").split("\0")) | set(git("diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z").split("\0"))
    big = [(p, (ROOT / p).stat().st_size) for p in sorted(tracked) if p and (ROOT / p).is_file()
           and (ROOT / p).stat().st_size > LIMIT]
    for p, n in big:
        print(f"{n / 1e6:.1f} MB {p}")
    if big:
        print(f"These files are over {LIMIT / 1e6:.0f} MB. Keep them in Google Drive: see docs/media.md.")
    return 1 if big else 0


def rclone(*args):
    try:
        return subprocess.run(["rclone", *args], cwd=ROOT).returncode
    except FileNotFoundError:
        raise SystemExit("rclone is not installed: see docs/media.md")


def cmd_sync():
    files = list(load()["files"])
    if not files:
        raise SystemExit("media.json lists no files: run list first")
    listing = ROOT / ".media-files.txt"
    listing.write_text("\n".join(files) + "\n", encoding="utf-8")
    try:
        return rclone("copy", ".", REMOTE, "--files-from", str(listing), "--progress")
    finally:
        listing.unlink()


def cmd_fetch():
    files = list(load()["files"])
    listing = ROOT / ".media-files.txt"
    listing.write_text("\n".join(files) + "\n", encoding="utf-8")
    try:
        return rclone("copy", REMOTE, ".", "--files-from", str(listing), "--progress")
    finally:
        listing.unlink()


if __name__ == "__main__":
    commands = {"list": cmd_list, "check": cmd_check, "big": cmd_big, "sync": cmd_sync, "fetch": cmd_fetch}
    if len(sys.argv) != 2 or sys.argv[1] not in commands:
        raise SystemExit(__doc__)
    sys.exit(commands[sys.argv[1]]() or 0)
