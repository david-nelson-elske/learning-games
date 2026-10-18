# Media: where the big files live

Git keeps text, code and small files. It handles big binary files badly: every version of a video stays in the history forever, and every clone downloads all of them. So this repository keeps generated media out of git.

## The rule

- No file over 1 MB goes into git, and no video at any size.
- Small files a game needs to run, such as its narration clips, may go into git. Each must be under 1 MB.
- Everything else generated stays on disk next to its lesson, ignored by git: the published `.mp4`, and the lesson's `build/` folder with the full-quality master, the silent picture, the music and the voice lines.

## Where each copy is

| Copy | Where | Who sees it |
| --- | --- | --- |
| Working copy | On disk, in the lesson folders, ignored by git | The machine that made it |
| Long-term store | Google Drive, folder `Learning games`, the same paths as on disk | The owner |
| Public copy of each video | An asset of the repository's `media-v1` release on GitHub | Anyone; lesson READMEs link to it |

`media.json` at the root lists every media file with its size and SHA-256 checksum, and its public link if it has one. It is the record of what exists; git tracks it.

## Commands

```sh
python3 tools/media.py list    # after making media: rewrite media.json from what is on disk
python3 tools/media.py sync    # copy all media to Google Drive (one way, never deletes)
python3 tools/media.py fetch   # on a new machine: copy media back from Google Drive
python3 tools/media.py check   # are all listed files here and unchanged?
```

`sync` and `fetch` use [rclone](https://rclone.org). Connect it to Google Drive once, as the owner of the Drive:

```sh
rclone config create learning-games-drive drive scope drive.file
```

A browser opens to sign in. The `drive.file` scope lets rclone see only the files it created, nothing else in the Drive. To use another remote or folder, set `LEARNING_GAMES_REMOTE`, for example `LEARNING_GAMES_REMOTE="my-drive:Kids/Learning games"`.

## The size guard

`tools/hooks/pre-commit` refuses a commit that adds a file over 1 MB. Turn it on once per clone:

```sh
git config core.hooksPath tools/hooks
```

## Voice

Narration is made with ElevenLabs. Save the API key once with `sh tools/set-key.sh`. It goes into `.env`, which git ignores.
