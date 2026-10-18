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

The hero's full-width Canvas 2D scene uses the route, speed, lifetime, density,
pixel budget and theme settings in `src/lib/hero-scene.ts`. Its decorative layer
never captures input; parent pointer events distinguish taps from controls and
scroll gestures. The labyrinth pause button also pauses the background. Reduced
motion renders a static scene, and offscreen/hidden scenes stop their animation
loop. `npm test` checks route movement, signal expiry and limits, lifecycle cleanup,
reduced motion and the 4K pixel budget using Node's built-in test runner.

## Production

For a standard Next.js server, run `npm run build` followed by `npm start`.

For a static deployment, set `NEXT_EXPORT=1` while running `npm run build`.
The generated website is written to `out/`, including `404.html` and the
custom-domain `CNAME`. The GitHub Actions workflow builds this export and
deploys it to GitHub Pages when Pages is configured to use GitHub Actions.
