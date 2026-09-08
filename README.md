# PIANO JUMPER

js13kGames 2026 entry — theme: *Unicorns and Rainbows*

A unicorn walks a piano keyboard seen from the side.
Moving is playing: crossing from one key to the next sounds that note.
Play the tune, and the rainbow above completes itself.

Play: *(submission URL here)*

---

## Controls

| | Keyboard | Touch |
|---|---|---|
| Walk | ← → | ◀ ▶ buttons |
| Jump | Hold Space, release | Hold JUMP, release |
| Mute | M | Speaker icon, top right |

- Blue key — within walking distance
- Yellow key — needs a jump. Hold longer to go farther
- No direction while charging — hop in place, for a repeated note
- Black keys are obstacles, not platforms. Landing on one is a wrong note

Clear at 80% accuracy. The song always finishes;
a rough run just leaves the rainbow gap-toothed.

---

## Songs

All public domain, melody only, generated with oscillators.
No recordings or arrangements are used.

| Song | Source |
|---|---|
| Ode to Joy | Beethoven, 1824 |
| London Bridge | Traditional English nursery rhyme; the tune as sung dates from the 19th century |
| Twinkle Twinkle Little Star | French air "Ah! vous dirai-je, maman", published 1761 |
| When the Saints Go Marching In | Traditional African-American spiritual, author unknown |

Melodies are stored as white-key indices and moved only by whole octaves.
Shifting by any other interval would be a diatonic transposition — the tune
would land in a different mode and stop being the tune.

---

## Build

Requires Node. `terser` is the only dependency and is installed by the script.

```sh
./build.sh
```

or, equivalently:

```sh
npm install
node build.js
```

Either produces `dist/index.html` (the minified single file) and
`dist/game.zip` (the submission archive), and prints the byte count
against the 13,312 limit.

`build.js` extracts the script from the HTML, minifies it with terser,
re-inlines it, and writes the zip itself with `zlib` at level 9.
terser cannot be pointed at the HTML file directly — it is a JavaScript
parser and stops at `<!DOCTYPE`. `advzip -z -4 dist/game.zip` will squeeze
the archive a little further if you have it, and `build.sh` runs it when
it is present; it recompresses an existing zip and cannot create one.

`src/index.html` runs as-is in a browser without building.
Open it through a local server rather than `file://`
(`python -m http.server 8000`, or `npx serve src`), since `file://`
origins produce an unrelated console error.

---

## Theme

The rainbow is not decoration. It is the progress bar, the score,
and the pass condition in a single object — one wedge per note of the song.
The unicorn's mane and jump trail use the same seven colours,
which are the seven white keys of an octave.

---

## Technical notes

- Single HTML file, no external resources
- Canvas 2D, 1280×720 backing store on a 640×360 logical grid
- Audio synthesised at runtime with the Web Audio API
- 5×7 bitmap font drawn as rectangles — no font files
- Physics on a fixed timestep, so jump distance is identical at any refresh rate
- Under 13,312 bytes zipped

## Design document

See [SPEC.md](SPEC.md) for the design decisions and the constraints
they impose.

---

## Author

WAKKIN — [wakkingames.com](https://wakkingames.com)
