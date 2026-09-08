# PIANO JUMPER — design document

js13kGames 2026 / WAKKIN

This records the decisions and why they were made, so that a later change
can be judged against the reason rather than the code.

---

## 1. One line

A unicorn moves along a piano keyboard seen from the side, and the movement
itself is the performance.

## 2. Theme fit

- Unicorn — the player character
- Rainbow — one wedge per note of the song, filled in as the song is played

The rainbow is progress, score and pass condition in one object. Do not add a
separate score readout or life gauge; see 4-4.

## 3. The three findings the game rests on

### 3-1. One key is one note

Free movement gives you either a note droning while you walk, or a silent
walk that turns the keyboard into a plain floor with no reason to be a piano.

Movement is continuous, but a note sounds only when a key boundary is
crossed. Adjusting your footing or turning around inside one key is movement,
not performance, and stays silent. That is how continuous motion and
"one key = one note" coexist.

Landing from the air always sounds, boundary crossed or not — a hop straight
up returns to the same key, and without this exception a repeated note could
never be played.

- Adjacent note — walk
- Distant note — jump; charge time sets the distance
- Repeated note — hop in place, no direction held

### 3-2. Every white key is in C major, so a mistake is not a wrong chord

Landing one key off still lands in key. A sloppy run sounds improvised rather
than broken. The only thing that breaks it is a black key, which is why the
generous timing windows elsewhere are affordable.

**Black keys are obstacles, not platforms.** Landing on one sounds a note
outside the key and counts as a miss. A jump cannot land on the black key it
launched from underneath, or a repeated note would be impossible from a
position at the edge of a key.

### 3-3. Passing is 80% accuracy

A perfect performance is not required. The song does not advance until the
right note is played, so the phrase always completes. "You finish the song
and the rainbow comes out gap-toothed" is what failure looks like here.

## 4. Do not change

### 4-1. No air control

Left and right movement on the ground is allowed and continuous. Air control
is not. Jump distance is set by charge time alone.

### 4-2. No song whose rights cannot be verified

Every song must be public domain. Verified:

| Song | Basis |
|---|---|
| Ode to Joy | Beethoven, Symphony No. 9, 1824 |
| London Bridge Is Falling Down | Traditional English nursery rhyme; words predate the 17th century, the current tune is 19th century |
| Twinkle Twinkle Little Star | French air "Ah! vous dirai-je, maman", published 1761 |
| When the Saints Go Marching In | 19th-century African-American spiritual, author unknown; related printed editions (Purvis/Black, 1896) are also pre-1929 US publications and therefore PD |

Considered and dropped, still cleared for reuse:

- Hot Cross Buns — 18th-century English traditional. PD, dropped for low international recognition
- Mary Had a Little Lamb — 1830s; tune derives from "Goodnight, Ladies". Same reason

**Modern arrangements carry their own copyright.** Use the bare melody only.
Anything added must be a pre-1900 nursery rhyme or classical work, and its
source must be added to the table before it goes in.

### 4-3. No external resources

CDNs, web fonts, image URLs, APIs — all grounds for disqualification.
No image or audio files either; everything is generated at runtime.

### 4-4. Do not add HUD elements

No separate score, life or timer display. All of it lives in the rainbow.
When more information seems necessary, first ask whether the rainbow can
carry it.

### 4-5. Do not make black keys landable

See 4-5 in section 3-2. Making them platforms destroys the musical guarantee.

---

## 5. Stage design

Difficulty rises by the *kind* of jump required, never by note count or speed.

1. **Ode to Joy** — no leaps at all. Walk and hop only. The tutorial
2. **London Bridge Is Falling Down** — one descending third. **The first stage where a charged jump is required**
3. **Twinkle Twinkle Little Star** — one ascending fourth. A wider leap
4. **When the Saints Go Marching In** — eight leaps, no repeated notes. No rest between them

Measured from the melody data:

| Stage | Notes | Repeated notes | Leaps > 1 key | Largest leap |
|---|---|---|---|---|
| 1 Ode to Joy | 15 | 5 | 0 | 1 |
| 2 London Bridge | 13 | 0 | 1 | 3 |
| 3 Twinkle Twinkle | 14 | 6 | 1 | 4 |
| 4 When the Saints | 16 | 0 | 8 | 4 |

An earlier order led with Hot Cross Buns, which already contained seven
repeated notes and a two-key leap in stage 1 — "clearable by walking alone"
was not true of it. Walking only scores 65% there, under the 80% threshold.
The order above comes from that measurement.

Melodies are stored as white-key indices and **moved only in whole octaves
(+7 white keys)**. Adding 2 to every index is a diatonic transposition: the
pattern of tones and semitones changes and the tune becomes a different tune.
All four songs were broken this way before it was caught. London Bridge's
`G A G F E F G` (intervals +2 -2 -2 -1 +1 +2) becomes `B C B A G A B`
(+1 -1 -2 -2 +2 +2). The melodies now sit in their original C major, shifted
up one octave, with the base frequency dropped to C3 so the sounding pitch is
unchanged.

Note values are stored per song: `d` is how long the note sounds and `r` the
rest after it, both in eighth notes. Without them the demo plays every note as
an equal blip and both held notes and rests disappear.

---

## 6. Visual decisions

- **Side view, not three-quarter.** So that a key visibly sinks when struck
- A dark groove between white keys; without it the side view reads as one plank
- Black keys are flat raised steps, not tall bars
- Seven colours for the seven white keys: C red, D orange, E yellow, F green,
  G blue, A indigo, B violet. **Use all seven**, do not stop at five
- Hues are hand-picked, not an even split of the wheel — an even split gives a
  wide green band and two colours that both read as green. Lightness is
  deliberately uneven: yellow bright, blue and violet dark
- The next key is highlighted: **blue if it can be walked to, yellow if it
  needs a jump.** A repeated note needs a jump, so it is yellow. This is what
  removes the need for tutorial text
- Corners are stepped in whole pixels rather than drawn as arcs. A true curve
  is antialiased into a smear at this size and reads as blur, not roundness
- Scanlines cover the sky only. Over the keys they shred the shading that
  gives each key its thickness

---

## 7. Constraints worth remembering

- Physics runs on a fixed timestep. With a variable one, jump distance changed
  with refresh rate: the same charge landed on key +5 at 60 Hz and on a black
  key at 144 Hz
- The scheduler resyncs rather than catching up. `requestAnimationFrame` stops
  when the window is minimised while the audio clock keeps running; catching
  up dumped every missed step onto one instant, which was audible as a bang
- Every voice needs a short attack ramp. Stepping the gain from 0 to full in
  one sample is a discontinuity and clicks
- The AudioContext is created on the first user gesture, never before —
  constructing it earlier makes Firefox log an autoplay warning
- The on-screen buttons are hidden by `(min-width:900px) and (hover:hover)`.
  Width alone is not enough: a phone in landscape is 915–932px and an iPad is
  wider still, so a width-only query removed the only controls those devices
  have. `hover:hover` is what distinguishes a real pointer from a finger

---

## 8. Submission checklist

- [ ] zip is 13,312 bytes or less
- [ ] no outbound network traffic
- [ ] runs from a plain `index.html`
- [ ] works in Chrome and Firefox
- [ ] no errors *or warnings* in the console
- [ ] playable in both portrait and landscape on a phone
- [ ] every song is PD and matches the table in 4-2

## 9. Categories aimed at

- **Theme** — the rainbow completing is the progress itself
- **Audio** — playing the game is playing the instrument
- **Controls** — two verbs, walk and jump, identical on desktop and phone
- **Innovation** — quantising movement so that moving and playing are one act
