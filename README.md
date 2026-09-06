# Allen Belano Resume

This folder contains the resume and interactive Windows XP-style portfolio.

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

## Editing Content

Resume content appears in both the plain resume and the XP Resume window. Update both copies when changing:

- professional summary
- work history
- projects
- education
- contact details

Keep claims and metrics consistent between the two presentations. The plain resume is optimized for printing; the XP window is optimized for exploration.

## Quality Checks

From the workspace root, run:

```powershell
npm run check
```

This checks required files, HTML structure, duplicate IDs, image alt text, local asset references, CSS brace balance, and JavaScript syntax.

For JavaScript syntax only:

```powershell
npm run check:js
```

## Local Preview

Open `index.html` through a local web server so ES modules load consistently. For example, from the workspace root:

```powershell
npx serve "MY RESUME"
```

Then open the local URL printed by the command.
