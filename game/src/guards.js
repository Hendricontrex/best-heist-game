// guards.js — patrol routes, vision cones, and the hunt.
// A guard walks its waypoints. When the thief stands inside its cone
// with a clear line of sight, the guard sees them: the alarm climbs
// and the guard remembers where. Above the investigate threshold the
// guard leaves patrol and walks to the last seen spot.
import { GUARD, ALARM } from './config.js';
import { resolveWalls, sightBlocked } from './level.js';

export function updateGuards(level, thief, alarm, dt, now) {
  let anySeen = false;
  for (const g of level.guards) {
    const seen = guardSees(level, g, thief, now);
    if (seen) {
      anySeen = true;
      g.lastSeen = { x: thief.x, y: thief.y };
      if (alarm.value >= ALARM.investigateAt) g.state = 'hunt';
    }
    if (g.state === 'hunt' && g.lastSeen) {
      moveToward(level, g, g.lastSeen.x, g.lastSeen.y, GUARD.chaseSpeed, dt);
      if (dist(g, g.lastSeen) < 14) {
        g.state = 'patrol';
        g.lastSeen = null;
      }
    } else {
      patrol(level, g, dt);
    }
    // A guard that walks into the thief catches them on the spot.
    if (dist(g, thief) < GUARD.touchCatch) alarm.caught = true;
  }
  return anySeen;
}

// True when the thief is inside this guard's cone and sight line.
export function guardSees(level, g, thief, now) {
  if (inSmoke(level, thief)) return false;
  const dx = thief.x - g.x;
  const dy = thief.y - g.y;
  const d = Math.hypot(dx, dy);
  if (d > GUARD.sightRange) return false;
  let diff = Math.atan2(dy, dx) - g.angle;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  if (Math.abs(diff) > GUARD.sightHalfAngle) return false;
  return !sightBlocked(level.walls, g.x, g.y, thief.x, thief.y);
}

function patrol(level, g, dt) {
  const [tx, ty] = g.waypoints[g.wp];
  const arrived = moveToward(level, g, tx, ty, GUARD.patrolSpeed, dt);
  if (arrived) g.wp = (g.wp + 1) % g.waypoints.length;
}

function moveToward(level, g, tx, ty, speed, dt) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const d = Math.hypot(dx, dy);
  if (d < 4) return true;
  const step = Math.min(d, speed * dt);
  g.angle = Math.atan2(dy, dx);
  g.x += (dx / d) * step;
  g.y += (dy / d) * step;
  const body = { x: g.x, y: g.y, r: GUARD.radius };
  resolveWalls(level.walls, body);
  g.x = body.x;
  g.y = body.y;
  return false;
}

function inSmoke(level, thief) {
  for (const s of level.smokes || []) {
    if (Math.hypot(thief.x - s.x, thief.y - s.y) < s.r) return true;
  }
  return false;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
