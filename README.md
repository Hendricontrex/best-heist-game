# The Meridian Gallery — a heist game

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Hendricontrex/best-heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Hendricontrex/best-heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

One thief. Three guards. Two cameras. One diamond.

**The Meridian Gallery** is a complete top-down stealth game that runs
offline in a desktop browser from static files. Slip in through the
south service door, steal the Meridian Diamond from its vault, grab
what bonus loot you dare, and get out through the exit before the
alarm hits 100%.

## How it plays

- **Move** with WASD or arrow keys, or click anywhere to walk there.
  Hold **Shift** to sneak: slower, but much harder to spot.
- **Guards** patrol the hall, the west colonnade and the vault wing.
  Their red vision cones sweep with them — step inside one with a
  clear line of sight and the alarm climbs. Above 40% they leave
  patrol and hunt your last seen spot. Touch one and you're caught.
- **Cameras** sweep green cones from the corners. They never move,
  but an **EMP pulse (E, 2 uses)** blinds them for 6 seconds.
- **Smoke pellets (Q, 3 uses)** drop a cloud that blocks every eye
  for 4 seconds — the way through a watched corridor.
- **Loot**: the Meridian Diamond ($500) in the vault, two paintings
  ($150 each) and a gold reserve ($100). The diamond is the job; the
  rest is greed. Reach the exit with the diamond to win.
- **Score** rewards loot, a quiet run (low peak alarm) and speed.

Three routes cross the room — the west colonnade, the central hall
past the display cases, and the east vent corridor — so every run
reads the patrols before moving.

## Run it

```sh
# serve game/ with any static server, then open it in desktop Chrome
python3 -m http.server 8080 --directory game
```

No build step, no network requests, no dependencies. Sound is
synthesised in the browser with WebAudio; nothing is downloaded.

## Layout

- `game/index.html` — page and canvas
- `game/src/main.js` — game loop, input, states
- `game/src/level.js` — the gallery floor: walls, cover, loot, patrols
- `game/src/config.js` — every tuning number in one place
- `game/src/guards.js` — patrols, vision cones, the hunt
- `game/src/cameras.js` — sweeping cameras and the EMP
- `game/src/thief.js` — movement, sneaking, tools, loot
- `game/src/alarm.js` — the alarm meter and scoring
- `game/src/render.js` — every pixel of the midnight gallery
- `game/src/audio.js` — synthesised pickup / alarm / win sounds
- `game/src/shots.js` — frozen scenes for the screenshots
- `main.ts` — hands the game in: copies `game/` and `screenshots/`
  to `/output` and writes `dossier.json` with the vendored library

## Screenshots

`1-cover.jpg` shows the full room mid-heist: thief sneaking, guard
cones sweeping, cameras watching, the diamond glittering in its vault
and the alarm meter live. `2-stealth.jpg` is a quiet moment behind
a display case, `3-alarm.jpg` the alarm at 78% with a guard hunting,
`4-win.jpg` the clean getaway.
