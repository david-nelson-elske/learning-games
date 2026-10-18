# Agent instructions

This repository is public. It holds short teaching videos and small games for children, organised by subject.

## Rules

- **No personal details.** Never write a child's name, age, school, location, or any family detail in a file, commit message, branch or issue. Write for "a child" or "children".
- **Nothing private.** No credentials, API keys, machine paths, or names of private repositories or clients.
- **Ask before publishing.** Ask the owner before each push, before enabling GitHub Pages, and before anything else that publishes.

## Layout

- One folder per subject at the top level: `maths/` now, more to come (for example `science/`, `reading/`).
- Inside a subject, one folder per lesson, numbered in the order to watch or play: `01-counting-tanks/`, `02-tank-quiz/`.
- Each lesson folder has a `README.md` that says what it teaches and how to use it. A video lesson also has its `.mp4` and a `script.md`. A game has a single `index.html` that runs from disk.
- Keep each video under 50 MB (re-encode with H.264 at CRF 23 if needed), and each game a single file with no build step.
- Add each new lesson to the subject's `README.md` and to the table in the top `README.md`.

## Licences

Code is MIT ([LICENSE](LICENSE)). Videos, scripts and media are CC BY 4.0 ([LICENSE-media.md](LICENSE-media.md)). Credit third-party work in `docs/how-its-made.md`.

## Commits

One plain line per commit message.
