# Tank Maths

A small game in one file, [index.html](index.html). Open it in any modern web browser.

**How to play**
- Two sides of battle tanks. The sum is at the top, for example 3 + 2 = 5, and between the sides a sign shows which is bigger: <, > or =.
- **+ Build left** or **+ Build right** adds a tank: "3 + 1 = 4".
- **Tap a tank** to blow it up: "4 − 1 = 3".
- **Drag a tank** to the other side: "4 + 2 = 3 + 3. Still 6 tanks!" The total stays the same when you move tanks around.
- **Fire!** makes every tank shoot, just for fun.
- **Challenges** at the top ask for things like "Make both sides equal" or "Show 2 + 4". Each one solved earns a star.

**Three kinds of maths.** The switch at the top picks one:
- **+** adds the two sides: "3 + 2 = 5".
- **−** takes the right side away from the left: "5 − 2 = 3". Lines join each tank on the right to one on the left, and the ones left over glow: they are the answer. Take away more than there is and the answer goes below zero: "3 − 5 = −2", and two ghost tanks appear upside down under the left side.
- **< >** compares the sides: "3 < 5", "Three is smaller than five." The same lines show which side has more.

**The voice** reads out each challenge, and the sum once you stop changing it, so a child who cannot read yet can play. Under the sum, the same sum is written in words, and each word lights up as the voice says it: numbers and reading in one game. Tap the challenge to hear it again. The 🔊 button turns the voice off.

**What it teaches:** adding, taking away (and a first look below zero), comparing with <, > and =, that regrouping keeps the total, and reading number words by following along.

Made by the [game factory](../../factory/) from the theme [tanks.js](../../factory/themes/tanks.js). Built with [three.js](https://threejs.org) r128, loaded from cdnjs, and Google Fonts (Russo One and Nunito). Sound effects are made in the page with the Web Audio API and start after the first tap. The voice clips are in [voice/](voice/).
