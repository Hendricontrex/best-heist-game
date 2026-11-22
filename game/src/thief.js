// thief.js — the player: movement, sneaking, tools and loot.
// WASD or arrows walk, Shift sneaks (slow, hard to spot), holding
// nothing runs loud. Click sets a move target for mouse play. Q drops
// a smoke pellet, E fires an EMP pulse. Loot is grabbed by touch.
import { THIEF, TOOLS, LOOT_VALUE } from './config.js';
import { resolveWalls } from './level.js';

export function createThief(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    r: THIEF.radius,
    facing: -Math.PI / 2,
    sneaking: false,
    running: false,
    moving: false,
    target: null, // {x, y} from a mouse click, or null
    smokeUses: TOOLS.smokeUses,
    empUses: TOOLS.empUses,
    loot: 0,
    lootValue: 0,
    diamond: false,
  };
}

export function updateThief(level, thief, input, dt) {
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  if (mx !== 0 || my !== 0) thief.target = null;

  if (mx === 0 && my === 0 && thief.target) {
    const dx = thief.target.x - thief.x;
    const dy = thief.target.y - thief.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) {
      thief.target = null;
    } else {
      mx = dx / d;
      my = dy / d;
    }
  }

  thief.moving = mx !== 0 || my !== 0;
  thief.sneaking = !!input.sneak && thief.moving;
  thief.running = !input.sneak && thief.moving && (mx !== 0 || my !== 0);
  const speed = thief.sneaking
    ? THIEF.sneakSpeed
    : THIEF.walkSpeed;
  if (thief.moving) {
    const len = Math.hypot(mx, my) || 1;
    thief.x += (mx / len) * speed * dt;
    thief.y += (my / len) * speed * dt;
    thief.facing = Math.atan2(my, mx);
    resolveWalls(level.walls, thief);
    clampToRoom(thief);
  }
  grabLoot(level, thief);
}

function clampToRoom(thief) {
  thief.x = Math.max(20, Math.min(940, thief.x));
  thief.y = Math.max(20, Math.min(580, thief.y));
}

function grabLoot(level, thief) {
  for (const l of level.loot) {
    if (l.taken) continue;
    if (Math.hypot(l.x - thief.x, l.y - thief.y) < THIEF.grabRadius) {
      l.taken = true;
      thief.loot += 1;
      thief.lootValue += LOOT_VALUE[l.kind];
      if (l.kind === 'diamond') thief.diamond = true;
      thief.justGrabbed = l;
    }
  }
}

// Q: drop a smoke pellet at the thief's feet. Returns the cloud, or
// null when the thief is out of pellets.
export function dropSmoke(level, thief, now) {
  if (thief.smokeUses <= 0) return null;
  thief.smokeUses -= 1;
  const cloud = {
    x: thief.x,
    y: thief.y,
    r: TOOLS.smokeRadius,
    until: now + TOOLS.smokeSeconds,
  };
  (level.smokes = level.smokes || []).push(cloud);
  return cloud;
}

// E: fire the EMP. Returns true when a pulse was spent.
export function fireEmp(thief) {
  if (thief.empUses <= 0) return false;
  thief.empUses -= 1;
  return true;
}

// The thief has won when the diamond is in hand and they stand in
// the exit doorway.
export function atExit(level, thief) {
  const e = level.exit;
  return (
    thief.x > e.x - e.w / 2 &&
    thief.x < e.x + e.w / 2 &&
    thief.y > e.y - e.h &&
    thief.y < e.y + e.h
  );
}
