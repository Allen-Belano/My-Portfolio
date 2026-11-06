# My-Portfolio

Personal portfolio of Allen Joshua O. Belano: a printable resume plus an interactive Windows XP-style desktop.

Moved here from the `MY RESUME` folder of [Practice-Space](https://github.com/Allen-Belano/Practice-Space), with its commit history kept.

## Structure

- `index.html` contains both presentations:
  - the default printable resume
  - the XP portfolio desktop and its app windows
- `style.css` contains the shared resume styles, XP styles, responsive rules, and theme tokens.
- `index.js` is the module entry point.
- `theme.js` owns the plain resume and portfolio theme transition.
- `xp-desktop.js` owns login, windows, taskbar, desktop icons, menus, dragging, and resizing.
- `chat.js` owns the local Ask Allen responses and chat UI.
- `photo.jpg` is the profile image.
- `scripts/quality-checks.mjs` runs the site checks.

## Editing content

Resume content appears in both the plain resume and the XP Resume window. Update both copies when changing:

- professional summary
- work history
- projects
- education
- contact details

Keep claims and metrics consistent between the two presentations. The plain resume is optimized for printing; the XP window is optimized for exploration.

## Quality checks

```
npm run check     # files, HTML structure, duplicate IDs, alt text, local assets, CSS braces, JS syntax
npm run check:js  # JavaScript syntax only
```

## Local preview

Serve the folder so ES modules load:

```
npx serve .
```

Then open the local URL printed by the command.

## Deployment

Deployed on Vercel as a static site: framework preset "Other", no build command, output directory is the repo root.
