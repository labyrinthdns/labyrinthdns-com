# Labyrinth DNS website

The source for [labyrinthdns.com](https://labyrinthdns.com), built with Next.js,
React, TypeScript and Tailwind CSS. Includes product documentation, interactive
DNS diagrams, light and dark themes, and an animated 404 page.

The resolver lives in [labyrinthdns/labyrinth](https://github.com/labyrinthdns/labyrinth).

## Local development

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## Responsive layout

Page shells use the shared `.site-container` class, with fluid gutters and a
1728px maximum width. Geometry and reading measures live in
`src/styles/design-tokens.css`; shared layouts live in `src/styles/layout.css`.
Keep paragraph measures separate from the page width, and use `.section-split`
for sections with introductory copy beside a data panel on larger screens.
Check layout changes at 375, 768, 1024, 1440, 1920 and 2560px.

The shared `SiteBackground` mounts once in the root layout, including docs and
404 pages. Two fixed sibling SVGs span the viewport: a quiet ambient layer below
the content, and an unmasked interaction layer above cards and text (below
navigation/dialogs). Neither is nested in section overflow or uses content-box
opacity gates. Hover is tracked over controls too; only emitted taps are filtered.
All input uses client coordinates, so scrolling keeps the pointer field anchored.
This keeps the same scene across section boundaries without allocating a
page-height drawing surface. Route,
speed, lifetime and density settings live in `src/lib/site-scene.ts`; theme colors
live in `src/styles/site-scene.css`. Passive document pointer events distinguish
taps from controls, selection and scroll gestures. The corner background button
pauses the scene independently of the hero illustration. Reduced motion renders
a static scene; hidden scenes stop their animation loop. `npm test` covers the
route math, signal limits/expiry and animation lifecycle with Node's test runner.

## Production

For a standard Next.js server, run `npm run build` followed by `npm start`.

For a static deployment, set `NEXT_EXPORT=1` while running `npm run build`.
The generated website is written to `out/`, including `404.html` and the
custom-domain `CNAME`. The GitHub Actions workflow builds this export and
deploys it to GitHub Pages when Pages is configured to use GitHub Actions.
