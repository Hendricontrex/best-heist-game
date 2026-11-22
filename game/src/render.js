// render.js — every pixel of the midnight gallery: the tiled floor,
// walls and display cases, guards with their vision cones, sweeping
// cameras, glittering loot, the thief, and the HUD with its alarm
// meter. One function per layer so the scene stays readable.
import { ROOM, PALETTE, GUARD, CAMERA, ALARM, THIEF } from './config.js';

export function drawScene(ctx, game) {
  const { level, thief, alarm } = game;
  drawFloor(ctx);
  drawExit(ctx, level);
  drawLoot(ctx, level);
  drawWalls(ctx, level);
  drawSmoke(ctx, level, game.now);
  drawCameraCones(ctx, level, game.now);
  drawGuardCones(ctx, level);
  drawCameras(ctx, level, game.now);
  drawGuards(ctx, level);
  drawThief(ctx, thief);
  drawHud(ctx, game);
  if (game.state !== 'play') drawOverlay(ctx, game);
}

function drawFloor(ctx) {
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 16; x++) {
      ctx.fillStyle = (x + y) % 2 ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(x * 60, y * 60, 60, 60);
    }
  }
  // Warm spotlight pools over the display cases.
  ctx.fillStyle = 'rgba(245,197,66,0.05)';
  for (const [x, y] of [[480, 123], [480, 313], [480, 483]]) {
    ctx.beginPath();
    ctx.arc(x, y, 90, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawExit(ctx, level) {
  const e = level.exit;
  ctx.fillStyle = PALETTE.exit;
  ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h);
  ctx.fillStyle = '#0b2b18';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', e.x, e.y + 4);
}

function drawLoot(ctx, level) {
  for (const l of level.loot) {
    if (l.taken) continue;
    if (l.kind === 'diamond') {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = PALETTE.diamond;
      ctx.shadowColor = PALETTE.diamond;
      ctx.shadowBlur = 16;
      ctx.fillRect(-9, -9, 18, 18);
      ctx.restore();
    } else if (l.kind === 'painting') {
      ctx.fillStyle = '#7a5a2e';
      ctx.fillRect(l.x - 16, l.y - 20, 32, 40);
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(l.x - 12, l.y - 16, 24, 32);
      ctx.fillStyle = '#2e6b8a';
      ctx.fillRect(l.x - 12, l.y - 16, 24, 12);
    } else {
      ctx.fillStyle = PALETTE.gold;
      ctx.shadowColor = PALETTE.gold;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#7a5a2e';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', l.x, l.y + 4);
    }
  }
}

function drawWalls(ctx, level) {
  for (const w of level.walls) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(w.x, w.y, w.w, 3);
  }
  // Display cases read as glass-topped cases, not bare blocks.
  for (const w of level.walls.slice(4)) {
    ctx.fillStyle = 'rgba(143,184,216,0.35)';
    ctx.fillRect(w.x + 3, w.y + 3, w.w - 6, w.h - 6);
  }
}

function drawSmoke(ctx, level, now) {
  for (const s of level.smokes || []) {
    if (s.until <= now) continue;
    ctx.fillStyle = PALETTE.smoke;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function conePath(ctx, x, y, angle, half, range) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
}

function drawGuardCones(ctx, level) {
  for (const g of level.guards) {
    ctx.fillStyle = PALETTE.guardCone;
    conePath(ctx, g.x, g.y, g.angle, 0.56, 175);
    ctx.fill();
  }
}

function drawCameraCones(ctx, level, now) {
  for (const c of level.cameras) {
    if (c.disabledUntil > now) continue;
    ctx.fillStyle = PALETTE.cameraCone;
    conePath(ctx, c.x, c.y, c.angle, CAMERA.sightHalfAngle, CAMERA.sightRange);
    ctx.fill();
  }
}

function drawCameras(ctx, level, now) {
  for (const c of level.cameras) {
    const off = c.disabledUntil > now;
    ctx.fillStyle = off ? '#555' : PALETTE.camera;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = off ? '#777' : PALETTE.camera;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + Math.cos(c.angle) * 18, c.y + Math.sin(c.angle) * 18);
    ctx.stroke();
    if (off) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OFF', c.x, c.y - 14);
    }
  }
}

function drawGuards(ctx, level) {
  for (const g of level.guards) {
    ctx.fillStyle = g.state === 'hunt' ? '#ff2e63' : PALETTE.guard;
    ctx.beginPath();
    ctx.arc(g.x, g.y, GUARD.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.angle) * 5, g.y + Math.sin(g.angle) * 5, 4, 0, Math.PI * 2);
    ctx.fill();
    if (g.state === 'hunt') {
      ctx.fillStyle = '#ff2e63';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', g.x, g.y - 18);
    }
  }
}

function drawThief(ctx, thief) {
  ctx.save();
  ctx.translate(thief.x, thief.y);
  ctx.fillStyle = PALETTE.thiefCoat;
  ctx.beginPath();
  ctx.arc(0, 0, THIEF.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.arc(Math.cos(thief.facing) * 4, Math.sin(thief.facing) * 4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (thief.sneaking) {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, 17, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawHud(ctx, game) {
  const { thief, alarm } = game;
  ctx.fillStyle = 'rgba(8,12,24,0.85)';
  ctx.fillRect(0, 0, ROOM.w, 34);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`LOOT $${thief.lootValue}  (${thief.loot}/4)`, 12, 22);
  ctx.fillText(`TIME ${Math.floor(game.seconds)}s`, 220, 22);
  ctx.fillText(`SMOKE ${thief.smokeUses}  EMP ${thief.empUses}`, 330, 22);
  // Alarm meter: the bar that decides the run.
  const ax = 560;
  const aw = 220;
  ctx.fillStyle = '#333';
  ctx.fillRect(ax, 10, aw, 14);
  ctx.fillStyle =
    alarm.value > 66 ? PALETTE.alarm : alarm.value > 33 ? '#f5a542' : '#3ddc84';
  ctx.fillRect(ax, 10, (aw * alarm.value) / 100, 14);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ALARM', ax - 52, 22);
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.round(alarm.value)}%`, ax + aw + 46, 22);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#cfe0ff';
  ctx.font = '12px sans-serif';
  ctx.fillText(
    thief.diamond
      ? 'Diamond secured — get to the EXIT!'
      : 'Steal the Meridian Diamond, then reach the EXIT.',
    12,
    ROOM.h - 10,
  );
}

function drawOverlay(ctx, game) {
  ctx.fillStyle = 'rgba(5,8,18,0.78)';
  ctx.fillRect(0, 0, ROOM.w, ROOM.h);
  ctx.fillStyle = '#f5c542';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  if (game.state === 'title') {
    ctx.fillText('THE MERIDIAN GALLERY', ROOM.w / 2, 190);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText('One thief. Three guards. Two cameras. One diamond.', ROOM.w / 2, 230);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#cfe0ff';
    ctx.fillText('WASD / arrows to move — Shift to sneak — click to walk there', ROOM.w / 2, 280);
    ctx.fillText('Q smoke pellet (3) — E EMP pulse (2) — R restart', ROOM.w / 2, 306);
    ctx.fillText('Stay out of the red cones and green camera sweeps.', ROOM.w / 2, 332);
    ctx.fillStyle = '#3ddc84';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Press ENTER or click to start the heist', ROOM.w / 2, 390);
  } else if (game.state === 'win') {
    ctx.fillText('CLEAN GETAWAY!', ROOM.w / 2, 230);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Loot $${game.thief.lootValue}  •  Score ${game.score}  •  ${Math.floor(game.seconds)}s`, ROOM.w / 2, 275);
    ctx.fillText('The Meridian Diamond is yours. Press R to run it again.', ROOM.w / 2, 310);
  } else if (game.state === 'lose') {
    ctx.fillStyle = '#ff2e63';
    ctx.fillText('CAUGHT!', ROOM.w / 2, 230);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText('The alarm hit 100% and the guards closed in.', ROOM.w / 2, 275);
    ctx.fillText('Press R to try a quieter route.', ROOM.w / 2, 310);
  }
}
