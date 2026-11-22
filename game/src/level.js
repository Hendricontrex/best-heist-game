// level.js — the Meridian Gallery floor: walls, cover, loot, patrols,
// cameras and the exit. The room is one fixed layout with three ways
// through it: the west colonnade, the central hall, and the east vent
// corridor, so the player picks a route before every move.
import { ROOM } from './config.js';

// A wall / cover block: { x, y, w, h }. Blocks stop movement and
// block sight. The outer walls are added by buildLevel().
const COVER = [
  // west colonnade pillars
  { x: 150, y: 120, w: 34, h: 34 },
  { x: 150, y: 300, w: 34, h: 34 },
  { x: 150, y: 470, w: 34, h: 34 },
  // central display cases (the hall's spine)
  { x: 400, y: 110, w: 160, h: 26 },
  { x: 400, y: 300, w: 160, h: 26 },
  { x: 400, y: 470, w: 160, h: 26 },
  // east wing cases
  { x: 720, y: 130, w: 30, h: 120 },
  { x: 720, y: 360, w: 30, h: 120 },
  // vault antechamber walls: two stubs that funnel the approach
  { x: 380, y: 18, w: 26, h: 74 },
  { x: 554, y: 18, w: 26, h: 74 },
];

const LOOT = [
  { id: 'diamond', kind: 'diamond', x: 480, y: 62, label: 'Meridian Diamond' },
  { id: 'painting-w', kind: 'painting', x: 60, y: 180, label: 'Starry Vault' },
  { id: 'painting-e', kind: 'painting', x: 900, y: 180, label: 'The Gilded Fox' },
  { id: 'gold', kind: 'gold', x: 890, y: 520, label: 'Gold reserve' },
];

const GUARDS = [
  {
    id: 'hall',
    name: 'Hall guard',
    waypoints: [
      [250, 210],
      [700, 210],
      [700, 400],
      [250, 400],
    ],
  },
  {
    id: 'west',
    name: 'West guard',
    waypoints: [
      [95, 130],
      [95, 540],
      [230, 540],
      [230, 130],
    ],
  },
  {
    id: 'vault',
    name: 'Vault guard',
    waypoints: [
      [640, 90],
      [830, 90],
      [830, 280],
      [640, 280],
    ],
  },
];

const CAMERAS = [
  { id: 'cam-nw', x: 24, y: 24, baseAngle: 0.9, sweep: 0.7 },
  { id: 'cam-se', x: 936, y: 576, baseAngle: Math.PI + 0.9, sweep: 0.7 },
];

export function buildLevel() {
  const t = ROOM.wall;
  const walls = [
    { x: 0, y: 0, w: ROOM.w, h: t }, // north
    { x: 0, y: ROOM.h - t, w: ROOM.w, h: t }, // south
    { x: 0, y: 0, w: t, h: ROOM.h }, // west
    { x: ROOM.w - t, y: 0, w: t, h: ROOM.h }, // east
    ...COVER,
  ];
  return {
    walls,
    loot: LOOT.map((l) => ({ ...l, taken: false })),
    guards: GUARDS.map((g) => ({
      ...g,
      x: g.waypoints[0][0],
      y: g.waypoints[0][1],
      wp: 1,
      angle: 0,
      state: 'patrol',
      lastSeen: null,
      sweepPhase: Math.random() * 6,
    })),
    cameras: CAMERAS.map((c) => ({ ...c, disabledUntil: 0 })),
    // The thief slips in through the south service door.
    spawn: { x: 480, y: 552 },
    exit: { x: 480, y: 576, w: 90, h: 18 },
  };
}

// True when the segment from (x1,y1) to (x2,y2) hits any wall block.
// Guards and cameras cannot see through walls or display cases.
export function sightBlocked(walls, x1, y1, x2, y2) {
  for (const w of walls) {
    if (segmentHitsRect(x1, y1, x2, y2, w)) return true;
  }
  return false;
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  for (const [p, d, lo, hi] of [
    [x1, dx, r.x, r.x + r.w],
    [y1, dy, r.y, r.y + r.h],
  ]) {
    if (Math.abs(d) < 1e-9) {
      if (p < lo || p > hi) return false;
    } else {
      let a = (lo - p) / d;
      let b = (hi - p) / d;
      if (a > b) [a, b] = [b, a];
      tmin = Math.max(tmin, a);
      tmax = Math.min(tmax, b);
      if (tmin > tmax) return false;
    }
  }
  return true;
}

// Circle (x, y, r) pushed out of every wall block it overlaps.
export function resolveWalls(walls, body) {
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(body.x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(body.y, w.y + w.h));
    const dx = body.x - cx;
    const dy = body.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < body.r * body.r) {
      const d = Math.sqrt(d2) || 0.001;
      body.x = cx + (dx / d) * body.r;
      body.y = cy + (dy / d) * body.r;
    }
  }
}
