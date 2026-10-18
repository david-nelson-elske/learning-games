"""Make a maths game from the template and a theme, and voice every line it can say.

    python3 factory/make.py factory/themes/tanks.js            # write the game's index.html
    python3 factory/make.py factory/themes/*.js --voice        # also make any missing voice clips

The game goes to the theme's folder, for example maths/03-tank-maths-game/index.html, with its clips in voice/.
--voice also times each word of each clip with ElevenLabs forced alignment, into voice/timings.json, so the
game can light up each word as Lauren says it.
Voicing needs Node (to list the lines) and an ElevenLabs key in ELEVENLABS_API_KEY or in .env at the root:
run tools/set-key.sh once. A clip that exists is not made again, so changing one line costs one request.
Clips no longer used are deleted. Standard library only.
"""
import json
import os
import subprocess
import sys
import urllib.request
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
VOICE = json.loads((HERE / "voice.json").read_text(encoding="utf-8"))
API = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format={output_format}"
ALIGN = "https://api.elevenlabs.io/v1/forced-alignment"
LIMIT = 1_000_000

LIST_LINES = """
const vm = require('vm'), fs = require('fs');
const box = {module: undefined, console};
vm.createContext(box);
vm.runInContext(fs.readFileSync(process.argv[1], 'utf8') + ';this.WORDS = WORDS;', box);
vm.runInContext(fs.readFileSync(process.argv[2], 'utf8') + ';this.THEME = THEME;', box);
process.stdout.write(JSON.stringify({theme: {id: box.THEME.id, folder: box.THEME.folder, title: box.THEME.title,
  buttons: box.THEME.buttons, help: box.THEME.help, stageLabel: box.THEME.stageLabel, fonts: box.THEME.fonts,
  colors: box.THEME.colors}, lines: box.WORDS.all(box.THEME)}));
"""


def read_theme(path):
    out = subprocess.run(["node", "-e", LIST_LINES, str(HERE / "words.js"), str(path)],
                         check=True, capture_output=True, text=True).stdout
    return json.loads(out)


def key():
    found = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    env = ROOT / ".env"
    if not found and env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            if line.startswith("ELEVENLABS_API_KEY="):
                found = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not found:
        raise SystemExit("No ElevenLabs key: run tools/set-key.sh, or set ELEVENLABS_API_KEY")
    return found


def voice(text, secret, out):
    body = {"text": text, "model_id": VOICE["model_id"], "seed": VOICE["seed"],
            "voice_settings": {"stability": VOICE["stability"], "similarity_boost": VOICE["similarity"]}}
    request = urllib.request.Request(API.format(**VOICE), json.dumps(body).encode("utf-8"), method="POST",
                                     headers={"xi-api-key": secret, "Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=120) as response:
        out.write_bytes(response.read())


def align(text, clip, secret):
    """When each word of a clip starts and ends, in seconds, from ElevenLabs forced alignment."""
    b = uuid.uuid4().hex
    body = (f'--{b}\r\nContent-Disposition: form-data; name="text"\r\n\r\n{text}\r\n'
            f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="clip.mp3"\r\n'
            f'Content-Type: audio/mpeg\r\n\r\n').encode("utf-8") + clip.read_bytes() + f"\r\n--{b}--\r\n".encode()
    request = urllib.request.Request(ALIGN, body, method="POST",
                                     headers={"xi-api-key": secret, "Content-Type": f"multipart/form-data; boundary={b}"})
    with urllib.request.urlopen(request, timeout=120) as response:
        words = [w for w in json.loads(response.read())["words"] if w["text"].strip()]
    if len(words) != len(text.split()):
        raise SystemExit(f"{clip.name}: {len(words)} timed words for {len(text.split())} words of text")
    return [[round(w["start"], 2), round(w["end"], 2)] for w in words]


def make_timings(lines, folder):
    """voice/timings.json: for each clip, the start and end of each word, so the game can light each word as it is said."""
    path = folder / "voice" / "timings.json"
    timings = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    todo = [l for l in lines if l["clip"] not in timings and (folder / "voice" / f"{l['clip']}.mp3").exists()]
    secret = key() if todo else ""
    for i, l in enumerate(todo, 1):
        timings[l["clip"]] = align(l["speak"], folder / "voice" / f"{l['clip']}.mp3", secret)
        if i % 25 == 0 or i == len(todo):
            path.write_text(json.dumps(timings, sort_keys=True, separators=(",", ":")) + "\n", encoding="utf-8")
            print(f"  timed {i}/{len(todo)}", flush=True)
    wanted = {l["clip"] for l in lines}
    timings = {k: v for k, v in timings.items() if k in wanted}
    path.write_text(json.dumps(timings, sort_keys=True, separators=(",", ":")) + "\n", encoding="utf-8")
    return timings


def make_voice(lines, folder):
    clips = folder / "voice"
    clips.mkdir(exist_ok=True)
    missing = [l for l in lines if not (clips / f"{l['clip']}.mp3").exists()]
    secret = key() if missing else ""
    for i, l in enumerate(missing, 1):
        voice(l["speak"], secret, clips / f"{l['clip']}.mp3")
        print(f"  voiced {i}/{len(missing)}: {l['speak']}", flush=True)
    wanted = {f"{l['clip']}.mp3" for l in lines}
    for old in clips.glob("*.mp3"):
        if old.name not in wanted:
            old.unlink()
            print("  deleted unused", old.name)
    print(f"  {len(lines) - len(missing)} clips were there, {len(missing)} made")


def css_vars(colors):
    def rgb(h):
        return ", ".join(str(int(h[i:i + 2], 16)) for i in (1, 3, 5))
    names = {"bg": "bg", "field": "field", "fieldGlow": "field-glow", "ink": "ink", "dim": "dim", "accent": "accent",
             "accent2": "accent2", "hi": "hi", "warn": "warn", "display": "display", "body": "body"}
    out = [f"    --{css}: {colors[k]};" for k, css in names.items()]
    out += [f"    --{k}-rgb: {rgb(colors[k])};" for k in ("accent", "accent2", "warn")]
    return "\n".join(out)


def build(theme_path, with_voice):
    data = read_theme(theme_path)
    t, lines = data["theme"], data["lines"]
    folder = ROOT / t["folder"]
    folder.mkdir(parents=True, exist_ok=True)
    print(f"{t['title']}: {len(lines)} lines")
    timings = {}
    if with_voice:
        make_voice(lines, folder)
        timings = make_timings(lines, folder)
    elif (folder / "voice" / "timings.json").exists():
        timings = json.loads((folder / "voice" / "timings.json").read_text(encoding="utf-8"))
    have = {l["clip"]: timings.get(l["clip"], []) for l in lines if (folder / "voice" / f"{l['clip']}.mp3").exists()}
    page = (HERE / "template.html").read_text(encoding="utf-8")
    fills = {
        "{{TITLE}}": t["title"], "{{THEME_ID}}": t["id"], "{{FONTS}}": t["fonts"], "{{CSS_VARS}}": css_vars(t["colors"]),
        "{{STAGE_LABEL}}": t["stageLabel"], "{{HELP}}": t["help"], "{{ADD_LEFT}}": t["buttons"]["addLeft"],
        "{{ADD_RIGHT}}": t["buttons"]["addRight"], "{{ACT}}": t["buttons"]["act"],
        "{{WORDS}}": (HERE / "words.js").read_text(encoding="utf-8").strip(),
        "{{THEME}}": Path(theme_path).read_text(encoding="utf-8").strip(),
        "{{CLIPS}}": json.dumps(have, sort_keys=True, separators=(",", ":")),
    }
    for k, v in fills.items():
        page = page.replace(k, v)
    (folder / "index.html").write_text(page, encoding="utf-8")
    big = [p.name for p in (folder / "voice").glob("*.mp3") if p.stat().st_size > LIMIT] if (folder / "voice").exists() else []
    if big:
        raise SystemExit(f"Clips over 1 MB: {big}")
    timed = sum(1 for v in have.values() if v)
    print(f"  wrote {folder.relative_to(ROOT)}/index.html with {len(have)} of {len(lines)} clips, {timed} timed")


def main(argv):
    with_voice = "--voice" in argv
    themes = [a for a in argv if not a.startswith("--")]
    if not themes:
        raise SystemExit(__doc__)
    for path in themes:
        build(path, with_voice)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
