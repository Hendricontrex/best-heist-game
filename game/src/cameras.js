// cameras.js — wall cameras that sweep their sight line back and
// forth. A camera that spots the thief raises the alarm just like a
// guard does, but it never moves: the counter is an EMP pulse, which
// blinds every camera for a few seconds.
import { CAMERA } from './config.js';
import { sightBlocked } from './level.js';

export function updateCameras(level, thief, dt, now) {
  let anySeen = false;
  for (const c of level.cameras) {
    c.angle =
      c.baseAngle + Math.sin(now * CAMERA.sweepSpeed + c.id.length) * c.sweep;
    if (c.disabledUntil > now) continue;
    if (cameraSees(level, c, thief)) anySeen = true;
  }
  return anySeen;
}

export function cameraSees(level, c, thief) {
  for (const s of level.smokes || []) {
    if (Math.hypot(thief.x - s.x, thief.y - s.y) < s.r) return false;
  }
  const dx = thief.x - c.x;
  const dy = thief.y - c.y;
  const d = Math.hypot(dx, dy);
  if (d > CAMERA.sightRange) return false;
  let diff = Math.atan2(dy, dx) - c.angle;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  if (Math.abs(diff) > CAMERA.sightHalfAngle) return false;
  return !sightBlocked(level.walls, c.x, c.y, thief.x, thief.y);
}

// Blinds every camera until now + seconds. Returns true when an EMP
// was actually spent (there is at least one camera left to blind).
export function empBlast(level, seconds, now) {
  let spent = false;
  for (const c of level.cameras) {
    if (c.disabledUntil <= now) spent = true;
    c.disabledUntil = now + seconds;
  }
  return spent;
}
