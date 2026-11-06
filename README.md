# My-Portfolio

Personal portfolio of Allen Joshua O. Belano. One page with two views:

- **Resume** (the default): a clean, printable resume with a Download PDF link to `resume.pdf`.
- **Portfolio**: a scroll-based "mission log" in a dark space theme, with a starfield, a 3D orbit, pinned stages and an automated assistant.

Moved here from the `MY RESUME` folder of [Practice-Space](https://github.com/Allen-Belano/Practice-Space), with its commit history kept.

## Getting to the portfolio view

The resume has no visible button for it. A small creature peeks in from a screen edge now and then; clicking it, or reaching it with Tab (it is the last stop), opens the portfolio view. It is hidden below 720px and in print.

`index.html#portfolio` opens the portfolio view directly, so that is the link to share. **Plain resume** in the portfolio top bar goes back to the resume.

## Structure

- `index.html` holds both views. Each portfolio stage is a `<section data-stage="N">`.
- `style.css` holds the resume styles, the portfolio styles and the responsive and print rules.
- `index.js` is the module entry point. It switches views and starts the effects. `SWARM_ENABLED` at the top turns the text builder off everywhere.
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
- `cursor-swarm.js` is the vendored CursorSwarm text builder (MIT).
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

## Deployment

Deployed on Vercel as a static site: framework preset "Other", no build command, output directory is the repo root.
