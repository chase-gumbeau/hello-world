# Tidbyt apps

Local Pixlet experiments for a 64×32 Tidbyt display.

## Prerequisites

Pixlet is installed at `~/bin/pixlet` (v0.34.0). Ensure `~/bin` is on your `PATH`.

## Preview in browser

```bash
pixlet serve tidbyt/hello_world.star
```

Open http://localhost:8080

## Render to WebP

```bash
pixlet render tidbyt/hello_world.star -o tidbyt/hello_world.webp
```

## Push to your Tidbyt

```bash
pixlet login
pixlet devices
pixlet render tidbyt/hello_world.star -o tidbyt/hello_world.webp
pixlet push <DEVICE_ID> tidbyt/hello_world.webp
```

To keep an app cycling on the device, push with an installation ID:

```bash
pixlet push <DEVICE_ID> tidbyt/hello_world.webp -i hello-world
```
