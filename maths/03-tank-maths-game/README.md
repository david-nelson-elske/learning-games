# Tank Maths

A small game in one file, [index.html](index.html). Open it in any modern web browser.

**How to play**
- Two sides of battle tanks. The sum is at the top, for example 3 + 2 = 5, and between the sides a sign shows which is bigger: <, > or =.
- **+ Build left** or **+ Build right** adds a tank: "3 + 1 = 4".
- **Tap a tank** to blow it up: "4 − 1 = 3".
- **Drag a tank** to the other side: "4 + 2 = 3 + 3. Still 6 tanks!" The total stays the same when you move tanks around.
- **Fire!** makes every tank shoot, just for fun.
- **Challenges** at the top ask for things like "Make both sides equal" or "Show 2 + 4". Each one solved earns a star.

**The voice** reads out each challenge, and the sum once you stop changing it, so a child who cannot read yet can play. Tap the challenge to hear it again. The 🔊 button turns the voice off.

**What it teaches:** adding, taking away, comparing with <, > and =, and that regrouping keeps the total.

Made by the [game factory](../../factory/) from the theme [tanks.js](../../factory/themes/tanks.js). Built with [three.js](https://threejs.org) r128, loaded from cdnjs, and Google Fonts (Russo One and Nunito). Sound effects are made in the page with the Web Audio API and start after the first tap. The voice clips are in [voice/](voice/).
