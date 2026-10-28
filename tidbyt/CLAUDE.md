# Tidbyt apps

Pixlet apps (Starlark) for a Tidbyt, a 64×32 RGB LED display.

## Toolchain
- Pixlet v0.34.0 at `~/bin/pixlet`, from `tidbyt/pixlet`. That is its final release: the repo stopped moving after Tidbyt was acquired by Modal.
- `tronbyt/pixlet` is the maintained fork (newer releases, 128×64 support, i18n). Don't switch to it without asking Chase. Its `push` targets a Tronbyt server, not Tidbyt's cloud.
- No Homebrew or Go on this machine. Install or upgrade from a release tarball into `~/bin`.

## Layout
This folder lives inside the `studies` repo (Storybook playground). The Tidbyt apps are separate from Storybook and the GitHub Pages build.

`tidbyt/apps/<app_name>/<app_name>.star` + `manifest.yaml`, the same shape as the community repo, so an app can be submitted later. `tidbyt/apps/hello_clock` is the reference app.

`pixlet create` is interactive. To start an app without a TTY, copy `hello_clock` and rename the file, `id`, `fileName` and `packageName`.

## Commands
Run from the repo root. On Chase's machine, the untracked `.claude/launch.json` has a `hello-clock` entry that serves the reference app on port 8080.
```
pixlet serve tidbyt/apps/<name>                              # http://127.0.0.1:8080, reloads on save, config form from get_schema()
pixlet render tidbyt/apps/<name> -m 8 --gif -o tidbyt/x.gif  # magnified preview; *.gif / *.webp under tidbyt/ are gitignored
pixlet format tidbyt/apps/<name>/<name>.star
pixlet lint tidbyt/apps/<name>/<name>.star
pixlet check tidbyt/apps/<name>                              # what the community repo runs before publishing
pixlet devices                                               # needs `pixlet login`
pixlet push <device-id> tidbyt/x.webp [--installation-id <id>]
```
Chase runs `pixlet login`. Never ask for or handle the Tidbyt API token.

## Conventions
- Every app has `main(config)` and `get_schema()`, and every config value has a default, so `pixlet render` works with no arguments.
- Stay inside 64×32. Fonts (height in px): `tb-8` (default, 8), `tom-thumb` (6), `5x8`, `6x10`, `6x13`, `10x20`, `Dina_r400-6`, `CG-pixel-3x5-mono`, `CG-pixel-4x5-mono`. Use `render.Marquee` for text that may overflow.
- Animations: `render.Root(delay = ms)` with `render.Animation` frames. Keep total length under 15 s.
- Cache network calls with `http.get(url, ttl_seconds = ...)` or the `cache` module. Apps run on every rotation.
- No secrets in source. Take keys through the schema, or use `pixlet encrypt` for community submissions.
- After every edit: format → lint → check → render, then look at the image.

## Docs
- Tidbyt developer docs: https://tidbyt.dev/docs
- Widgets: https://github.com/tidbyt/pixlet/blob/main/docs/widgets.md
- Modules (http, cache, time, json, …): https://github.com/tidbyt/pixlet/blob/main/docs/modules.md
- Schema: https://github.com/tidbyt/pixlet/blob/main/docs/schema/schema.md
- Fonts: https://github.com/tidbyt/pixlet/blob/main/docs/fonts.md
- Example apps: https://github.com/tidbyt/community (frozen), https://github.com/tronbyt/apps (active)
