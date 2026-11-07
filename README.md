# My-Portfolio

Personal portfolio of Allen Joshua O. Belano. One page with two views:

- **Resume**, also called the paper view (the default): a clean, printable resume on a sheet of paper that tilts with the mouse, with Kosmo Gaea, an alien dog, wandering along the bottom.
- **Portfolio**: a scroll-based "mission log" in a dark space theme, with a starfield, a 3D orbit, pinned stages and an automated assistant.

Moved here from the `MY RESUME` folder of [Practice-Space](https://github.com/Allen-Belano/Practice-Space), with its commit history kept.

## Getting to the portfolio view

The resume has no visible button for it. Kosmo Gaea opens a portal to it once he likes you (see below); clicking or tapping the portal, or reaching it with Tab, opens the portfolio view.

`index.html#portfolio` opens the portfolio view directly, so that is the link to share. **Plain resume** in the portfolio top bar goes back to the resume.

## Portfolio stages

Each stage has a small mono label above a plain heading. The label is hidden from screen readers, so they read only the heading.

**On desktop the portfolio plays as a film** (`fx-film.js`): one fixed stage, each stage a full-screen scene with the same scroll length. A scene's entrance plays as it arrives (the heading rises, its pieces slide in, the timeline draws, the Projects row slides), it rests, and an iris in the accent colour grows out of its heading to cut to the next. Scrolling back plays it in reverse, the jump nav glides to each scene's resting frame, and Tab only reaches the scene on screen. Scenes drift slightly with the mouse. On phones and with reduced motion the page flows instead, with the pinned stages and scroll reveals in the table below; crossing between the two reloads the page.

| Stage | Label | Section | Scroll effect |
|---|---|---|---|
| 0 | SIGNAL ACQUIRED | Intro | About 1.5s each time the view opens; a click or key press skips it |
| 1 | LAUNCH | Hero | The orbit turns with scroll; the name scales in |
| 2 | ORBIT | About | The highlight number counts up |
| 3 | TRAJECTORY | Experience | Pinned; a line draws down and each role lights up |
| 4 | PAYLOAD | Projects | Pinned; the cards scroll sideways |
| 5 | SYSTEMS | Skills | Pinned; an outline ticker of skill words runs behind the grid |
| 6 | CREDENTIALS | Education | None |
| 7 | TRANSMISSION | Contact | An oversized "Let's talk" link with a pulsing dot |

A stage indicator in the bottom-left shows the current stage while a pinned stage is on screen.

Across every stage:

- **Smooth scrolling** (Lenis), for the portfolio view only; the resume keeps native scrolling.
- **Screen layers:** film grain, a vignette, faint gridlines and corner brackets.
- **HUD:** a scroll progress bar along the top, and a telemetry line with Manila time, Angono's coordinates and an altitude readout for scroll depth.
- **Jump nav:** numbered stage links down the right edge, marking the current stage.
- **Reticle:** a ring that trails the mouse and widens over links; the normal cursor stays.
- **Decoding labels:** each mono stage label scrambles into place as it arrives.
- **Reveals:** headings rise in word by word, the About paragraph lights up word by word, and stats, skill cards, education and contact links slide in.
- **Parallax:** a large outline numeral drifts behind each stage, and the hero portrait drifts up.
- **Cuts:** a scan line sweeps the screen as each new stage arrives.
- **Scroll cue** at the bottom of the hero, until the first scroll.

After about 5 seconds without scrolling, the assistant leaves its corner as a small rocket and wanders the page. A scroll, a click on it or keyboard focus sends it back, and it stays docked while the chat panel is open.

**Below 860px:** no pinning, no starfield, the ticker stops and the orbit renders at a lower pixel ratio. The rocket stays docked.

**With reduced motion on:** the intro is skipped, stages are not pinned, scroll effects are off, the rocket stays docked and the peeker fades in instead of sliding.

## Structure

- `index.html` holds both views. Each portfolio stage is a `<section data-stage="N">`.
- `style.css` holds the resume styles, the portfolio styles and the responsive and print rules.
- `index.js` is the module entry point. It switches views and starts the effects.
- One module per effect:
  - `fx-peek.js`: the peeking creature on the resume
  - `fx-intro.js`: the stage 0 intro
  - `fx-sky.js`: the starfield
  - `fx-orb.js`: the three.js orbit in the hero
  - `fx-hero.js`: the hero name scaling in
  - `fx-stages.js`: stage pinning and the stage indicator
  - `fx-trajectory.js`: the Experience timeline line
  - `fx-counters.js`, `fx-filters.js`, `fx-timeline.js`, `fx-tilt.js`, `fx-terminal.js` (press `/`)
  - `fx-bot.js`: the assistant and its chat panel
  - `fx-rocket.js`: the assistant roaming as a rocket
  - `fx-film.js`: the desktop film (scenes, entrances, iris cuts)
  - `fx-lean.js`: the film's mouse drift
  - `fx-smooth.js`: Lenis smooth scrolling
  - `fx-hud.js`: the progress bar, telemetry clock and altitude, and the scroll cue
  - `fx-jump.js`: the stage jump nav
  - `fx-cursor.js`: the trailing reticle
  - `fx-decode.js`: the decoding stage labels
  - `fx-reveal.js`: the heading and group reveals
  - `fx-highlight.js`: the About word highlight
  - `fx-parallax.js`: the stage numerals and portrait drift
  - `fx-cut.js`: the scan line between stages
- `photo.jpg` is the profile image; `resume.pdf` is the downloadable resume.
- `scripts/quality-checks.mjs` runs the site checks.

## Editing content

Resume content appears in both views. Update both copies when changing:

- professional summary
- work history
- projects
- education
- contact details

Keep claims and metrics consistent between the two views. The resume view is laid out for printing; the portfolio view is laid out for scrolling.

The assistant's answers are fixed text in `KNOWLEDGE` in `fx-bot.js`. They are written in first person, as Allen, and labelled as automated, so change them only when Allen has approved the wording.

## Libraries

- GSAP 3.12.5 and ScrollTrigger, from cdnjs
- Lenis 1.1.9, from jsDelivr, for smooth scrolling
- three.js 0.160.0, from cdnjs, loaded only when the portfolio view opens
- Inter, JetBrains Mono, DM Sans and Space Grotesk, from Google Fonts

## Quality checks

```
npm run check     # files, HTML structure, duplicate IDs, alt text, local assets, CSS braces, JS syntax
npm run check:js  # JavaScript syntax only
```

## Local preview

Serve the folder so ES modules load:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

Browsers cache the module files, so after changing a `.js` file a plain reload can still run the old code. Use a hard refresh (Ctrl+F5).

## Deployment

Deployed on Vercel as a static site: framework preset "Other", no build command, output directory is the repo root.
