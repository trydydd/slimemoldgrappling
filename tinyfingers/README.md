# TinyFingers

A clone of [tinyfingers.net](https://tinyfingers.net) — a fullscreen smash toy for babies and toddlers. Kids can safely bang on the keyboard, tap the screen, or move the mouse and see colorful animated characters with sound.

## Features

- **PIN-locked fullscreen** — enters fullscreen on first tap; exiting requires a PIN (default: `1234`)
- **Touch + keyboard + mouse** — works on any device
- **4 themes** — Confetti, Bubbles, Space, Underwater
- **Musical notes** — each key plays a melodic tone
- **Idle demo** — auto-animates when nobody is interacting
- **Parent panel** — hold top-left corner for 2s or type `parent`

## How to Run Locally

This is a pure static site — no build step, no dependencies, no npm required.

### Option 1: Python (recommended)

```bash
cd tinyfingers
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Node.js

```bash
cd tinyfingers
npx serve .
```

Then open the URL shown in your terminal.

### Option 3: Open directly

You can also open `index.html` directly in most browsers:

```bash
open tinyfingers/index.html   # macOS
xdg-open tinyfingers/index.html  # Linux
```

> **Note:** Some browsers may restrict audio when opening as a `file://` URL. Use a local server for the full experience.

## How to Use

1. Open the app in your browser
2. Click **"Ready? Let's smash!"** or tap anywhere to start
3. Hand the device to your toddler — they can safely bang on keys or tap the screen
4. To exit fullscreen: open the parent panel (hold top-left corner for 2s, or type `parent`) → click **"Exit fullscreen"** → enter PIN

## Changing the PIN

Open the parent panel → change the "Exit PIN" field. Default is `1234`.

## Parent Panel Options

| Option | Description |
|--------|-------------|
| 🎵 Notes | Toggle musical note sounds |
| ✨ Mouse sparkle | Toggle mouse cursor sparkle trail |
| 🎨 Theme | Switch between Confetti, Bubbles, Space, Underwater |
| 🌙 Idle demo | Auto-animate when idle |
| 🐢 Reduce motion | Slower, gentler animations |
| 😀 Full emoji | Show full emoji set on symbol keys |
| 🔢 Per key | Number of characters spawned per keypress |
| 🔒 Exit PIN | PIN required to exit fullscreen |
