# The maths game factory

One game, many looks. The template holds the game: two sides, a sum on top, adding, taking away, moving things across, challenges and stars, and a voice that reads it all out. A theme says what the things are and what they do. `make.py` puts the two together into one `index.html` that runs from disk.

| Theme | Things | Tap one | The action button | Game |
| --- | --- | --- | --- | --- |
| [tanks.js](themes/tanks.js) | Battle tanks on plinths | Blows up | Fire! Every tank shoots | [Tank Maths](../maths/03-tank-maths-game/) |
| [mermaids.js](themes/mermaids.js) | Mermaids in two pools | Dives below the surface | Splash! Water flies to the other pool | [Mermaid Maths](../maths/04-mermaid-maths-game/) |

## Make a game

```sh
python3 factory/make.py factory/themes/mermaids.js           # write the game
python3 factory/make.py factory/themes/*.js --voice          # write every game and voice any new lines
```

Open the game's `index.html` in a browser. Add `?zoom=3` to the address for a close-up of the left side while you design a model.

## What a theme gives

A theme is one JavaScript file that sets `THEME`. Copy a theme to start a new one.

| Part | What it is |
| --- | --- |
| `id`, `folder`, `title` | Its name and where the game goes, for example `maths/04-mermaid-maths-game` |
| `one`, `many` | The thing's name: "mermaid", "mermaids". The voice uses them |
| `buttons`, `help`, `stageLabel` | The words on the buttons and under the field |
| `colors`, `fonts` | The look. `accent` is the glow colour |
| `lines` | Any sentence to say differently, for example `taskKeep: 'Make {many} dive until the right side has {n}.'` The defaults are in [words.js](words.js) |
| `build(THREE, kit)` | Returns the 3D parts, below |

`build` returns:

| Part | What it does |
| --- | --- |
| `ground(side)` | One side's floor: a plinth, a pool |
| `make(i)` | One thing, facing +x. `i` counts up, so each can look a little different |
| `idle(thing, now, dt)` | Moves it while it waits: a turret sway, a bob and a tail flick |
| `act(thing, side)` | The action button, for one thing: fire a shell, throw water |
| `remove(thing, side)` | Tap to take it away. Return `null` to vanish at once, or `{dur, step(p)}` to animate first |
| `sounds` | `add`, `remove` and `move` noises, made with `kit.tone` and `kit.noise` |
| `faceEachOther` | `true` turns each side to face the other |
| `enterFrom(side)` | Where a new thing comes from, relative to its place. Mermaids rise from below |

The `kit` gives a theme what it needs to do this: `withEdges`, `burst`, `launch` (something that flies and lands), `ring` (a ripple), `flash`, `shake`, `tone`, `noise`, the colours, and `padCenter(side)`.

## The voice

Every sentence the game shows comes from [words.js](words.js), with a number as a digit on screen ("3 + 2 = 5") and as a word for the voice ("Three plus two equals five."). `words.js` can list every sentence a game can say, about 300 for each theme. `make.py --voice` makes one clip for each with ElevenLabs, in the voice set in [voice.json](voice.json), and saves it in the game's `voice/` folder. A clip that exists is not made again.

`--voice` also times each word of each clip with ElevenLabs forced alignment and keeps the times in `voice/timings.json`.

Under the sum, the game writes the same sum in words: "Three plus two equals five." When the voice speaks, that line shows what it says, and each word lights up as it is said, so a child can follow the reading. With no clip, the browser's voice lights the words where it can.

The game reads out each new challenge, and the sum once the numbers stop changing for about a second. Taking away is read as taking away: "Five take away two is three." Tapping the challenge says it again, for children who cannot read yet. The 🔊 button turns the voice off and on. A sentence with no clip is read by the browser's own voice instead.

Save the ElevenLabs key once with `sh tools/set-key.sh`.
