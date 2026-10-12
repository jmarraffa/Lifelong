# Lifelong

A single-player life simulation for phone and browser: go to college, build a career, invest, run a business and watch your life compound from age 18 to 65.

This is the prototype skeleton: a seeded month-by-month simulation, a save in the browser, and a bare UI.

## Run it

```
npm install
npm run dev     # local dev server
npm test        # simulation and save tests
npm run build   # production build into dist/
```

## Folder rules

- `src/sim` is pure TypeScript: no React, no DOM, no `Date.now`, no `Math.random`. The same seed and the same choices always produce the same life.
- `src/save` handles the browser save (`localStorage` key `lifelong.save`, with a schema version).
- `src/ui` is the React interface.

## Deploy

Every push to `main` runs the tests, builds, and deploys to GitHub Pages: https://jmarraffa.github.io/Lifelong/
