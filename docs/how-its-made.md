# How it is made

**Videos.** Each video starts as a script: a table of lines, each with what the narrator says and what the picture shows. The pictures are built in code with [Remotion](https://www.remotion.dev), a React library for making videos, frame by frame. The look is the Lumen style of [iso-glow](https://iso-glow.vercel.app) by April Zhu (MIT), itself built on [iso-figure](https://github.com/MrBongoC/ai-iso-skill) by Tolga Cohce (MIT): solid isometric objects, lit in one teal accent, with geometric light. The narration voice and the music are generated with [ElevenLabs](https://elevenlabs.io). The music's beat is measured so that numbers pop and tanks arrive on the beat.

**Games.** Each game is a single HTML file with no build step, so it can be opened from disk or put on any web host. The 3D games use [three.js](https://threejs.org). The maths games come from one template and a theme each; see [factory/](../factory/). Their narration is the same ElevenLabs voice as the videos, one short clip per sentence. The fonts are Russo One, Fredoka and Nunito from Google Fonts (SIL Open Font Licence).

**Source.** The video source currently lives in a private workshop repository. As lessons are added here, the parts needed to rebuild them can move into this repository.
