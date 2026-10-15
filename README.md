# Rifqi Fachruradzi · Portfolio

A Naruto-themed portfolio for Muhammad Rifqi Fachruradzi, built with React, TypeScript, and Vite: dark Konoha
greens, Naruto-orange accents, a hand-drawn leaf mark, kanji section numbers, and shuriken dividers.

The whole page sits on the Valley of the End, pixelated and animated, fixed behind every section: the waterfall
flows (its texture scrolls down over the water pixels only, so the rocks in it stay put), foam churns at its foot,
mist rises, the pool shimmers, and leaves fly on the wind. A veil over it deepens as you scroll, so the valley is
vivid behind the hero and dimmer under the sections, where text needs to stay legible.

The background is one 23 KB pixel image (`public/scene/valley.png`, 240 x 243, 40 colours), animated on a canvas at
20 fps and scaled up with `image-rendering: pixelated`. The animation stops while offscreen or in a background tab
and stays still under `prefers-reduced-motion`.

Content mirrors [portoqiqi.vercel.app](https://portoqiqi.vercel.app) and lives in `src/data/content.json` (types in
`src/data/profile.ts`).

The name in the hero and the nav wordmark use **Shinobi Display**, a small Japanese-style display face drawn for this
site (`src/assets/fonts/shinobi-display.woff2`, built by `scripts/build-font.py`).

## Admin

The **Login** button in the nav opens the admin. The site is static, so the repository is the backend: you log in
with a GitHub fine-grained token scoped to this repository with **Contents: Read and write**, and **Publish** commits
`src/data/content.json` to `main`. The host rebuilds the site from that commit. The token stays in your browser's
local storage and is only sent to `api.github.com`; **Logout** removes it.

The editor has a tab per section (profile, missions, projects, skills, education, contacts, section text) with
add, remove, and reorder for every list, plus a raw JSON tab. **Preview** applies the draft to the open page only.

## Sections

- **About**: summary, character sheet, and education
- **Missions**: work experience
- **Projects**: projects with live demos and source links
- **Jutsu**: skills
- **Summon**: contact links

## Code map

- `src/pixel/engine.ts`: pixel helpers (colours, ordered dithering, seeded randomness, noise).
- `src/pixel/valley.ts`: the valley animation: waterfall, foam, mist, pool, and leaves, cropped to a view.
- `src/components/PixelCanvas.tsx`: mounts the valley on a canvas and runs the loop.
- `src/components/ValleyBackground.tsx`: the fixed full-page background and its scroll veil.
- `src/components/LeafMark.tsx`: the leaf-and-spiral mark.
- `src/content.tsx`: the content store the sections read from.
- `src/admin/`: the login dialog, the content editor, and the GitHub client that commits the content.
- `src/motion.ts`: entrance motion with [anime.js](https://animejs.com) v4: the hero intro (scrambled location,
  rising letters, a settling surname), section titles whose letters rise as a shuriken spins in, and skill counts
  that tick up. All of it is skipped under `prefers-reduced-motion`.

## Development

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build in dist/
npm run preview    # serve dist/
```

`rollup` is pinned to 4.50.1 through `overrides`, because rollup 4.64.2 hangs while bundling `react-dom`.
