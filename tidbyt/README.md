# Tidbyt

Custom [Pixlet](https://github.com/tidbyt/pixlet) apps for a Tidbyt. Run the commands below from the repo root.

## Quick start

```sh
pixlet serve tidbyt/apps/hello_clock      # open http://127.0.0.1:8080
```

Edit `tidbyt/apps/hello_clock/hello_clock.star` and the preview reloads on save.

## Push to the Tidbyt

```sh
pixlet login                        # once
pixlet devices                      # find the device ID
pixlet render tidbyt/apps/hello_clock -o tidbyt/hello_clock.webp
pixlet push <device-id> tidbyt/hello_clock.webp --installation-id helloclock
```

Without `--installation-id` the app shows once. With it, the app joins the device's rotation.

## New app

Run `pixlet create`, or copy `tidbyt/apps/hello_clock` to `tidbyt/apps/<name>` and rename the file and manifest fields. Before pushing, run `pixlet format`, `pixlet lint` and `pixlet check`.
