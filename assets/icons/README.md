# App Icons

This directory should contain the application icons for each platform.

## Required files

- `icon.icns` - macOS icon (1024x1024, Apple Icon Image format)
- `icon.ico` - Windows icon (multi-size .ico, must include 256x256)
- `icon.png` - Linux / fallback icon (512x512 or 1024x1024 PNG)

For Linux, electron-builder will look for numbered PNGs in this directory
(e.g. `16x16.png`, `32x32.png`, `128x128.png`, `256x256.png`, `512x512.png`)
or a single `icon.png`.

## Generating icons

You can generate all formats from a single 1024x1024 PNG source using:

- **electron-icon-builder**: `npx electron-icon-builder --input=source.png --output=./assets/icons`
- **iconutil** (macOS only): convert an `.iconset` folder to `.icns`
- Online converters for `.ico` files

## Notes

- The source image should be square (1024x1024 recommended).
- Use a transparent background for best results on all platforms.
- The tray icon (for the system tray) is separate and should be placed
  alongside these files if needed (e.g. `tray-icon.png`, 16x16 or 22x22).
