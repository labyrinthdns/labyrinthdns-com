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
npm run build
```

## Production

For a standard Next.js server, run `npm run build` followed by `npm start`.

For a static deployment, set `NEXT_EXPORT=1` while running `npm run build`.
The generated website is written to `out/`, including `404.html` and the
custom-domain `CNAME`. The GitHub Actions workflow builds this export and
deploys it to GitHub Pages when Pages is configured to use GitHub Actions.
