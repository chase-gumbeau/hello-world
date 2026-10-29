# Studies

Personal playground for Storybook experiments, UI studies, and small projects.

## Projects

- **[Scrolls](docs/scrolls.md)** — horizontal photo-scroll trips (home shell, shared frame, year-grouped destinations). Geometry, alignment checks, and how to add a trip are documented there.
- **[Tidbyt](tidbyt/README.md)** — LED art for a 64x32 Tidbyt, including the animated Ultrahand Sigil and how to push it to the device.

## Develop

```bash
npm install
npm run storybook
```

Storybook opens at http://localhost:6006. Scrolls lives under **Projects → Scrolls**.

```bash
npm run scrolls:check-align   # verify every trip starts at the frame left edge
npm run build-storybook      # static build for GitHub Pages
```
