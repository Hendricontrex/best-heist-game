// main.js — the game loop and the wiring: input, states, and the
// update order (thief, then eyes, then alarm). States: title, play,
// win, lose. A frozen game (a ?shot= capture) renders once and holds.
import { ROOM } from './config.js';
import { buildLevel } from './level.js';
import { createThief, updateThief, dropSmoke, fireEmp, atExit } from './thief.js';
import { updateGuards } from './guards.js';
import { updateCameras, empBlast } from './cameras.js';
import { createAlarm, updateAlarm, scoreGame } from './alarm.js';
import { drawScene } from './render.js';
import { applyShot } from './shots.js';
import {
  initAudio,
  playPickup,
  playAlarmTick,
  playWin,
  playCaught,
  toggleMute,
} from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');

const game = {
  level: buildLevel(),
  thief: null,
  alarm: createAlarm(),
  state: 'title',
  seconds: 0,
  score: 0,
  now: 0,
  frozen: false,
  input: { left: false, right: false, up: false, down: false, sneak: false },
};
game.thief = createThief(game.level.spawn);
game.level.smokes = [];

if (shotName) applyShot(game, shotName);

// Test hook: the play-test script reads state and drives input here.
window.__heist = game;

function reset() {
  game.level = buildLevel();
  game.level.smokes = [];
  game.thief = createThief(game.level.spawn);
  game.alarm = createAlarm();
  game.state = 'play';
  game.seconds = 0;
  game.score = 0;
}

const KEYS = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ShiftLeft: 'sneak',
  ShiftRight: 'sneak',
};

window.addEventListener('keydown', (e) => {
  initAudio();
  if (e.code === 'Enter' && game.state === 'title') {
    game.state = 'play';
    return;
  }
  if (e.code === 'KeyR') {
    reset();
    return;
  }
  if (e.code === 'KeyM') {
    toggleMute();
    return;
  }
  if (e.code === 'KeyQ' && game.state === 'play') {
    dropSmoke(game.level, game.thief, game.now);
    return;
  }
  if (e.code === 'KeyE' && game.state === 'play') {
    if (fireEmp(game.thief)) empBlast(game.level, 6, game.now);
    return;
  }
  const dir = KEYS[e.code];
  if (dir) {
    game.input[dir] = true;
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  const dir = KEYS[e.code];
  if (dir) game.input[dir] = false;
});

canvas.addEventListener('pointerdown', (e) => {
  initAudio();
  if (game.state === 'title') {
    game.state = 'play';
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const scale = ROOM.w / rect.width;
  game.thief.target = {
    x: (e.clientX - rect.left) * scale,
    y: (e.clientY - rect.top) * scale,
  };
});

let last = performance.now();
let tickCount = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!game.frozen && game.state === 'play') {
    game.now += dt;
    game.seconds += dt;
    updateThief(game.level, game.thief, game.input, dt);
    const seenByGuard = updateGuards(
      game.level,
      game.thief,
      game.alarm,
      dt,
      game.now,
    );
    const seenByCamera = updateCameras(game.level, game.thief, dt, game.now);
    const seen = seenByGuard || seenByCamera;
    updateAlarm(game.alarm, seen, game.thief, dt);
    if (seen && tickCount % 30 === 0) playAlarmTick();
    if (game.thief.justGrabbed) {
      playPickup();
      game.thief.justGrabbed = null;
    }
    // Expire smoke clouds.
    game.level.smokes = game.level.smokes.filter((s) => s.until > game.now);
    if (game.alarm.caught) {
      game.state = 'lose';
      playCaught();
    } else if (game.thief.diamond && atExit(game.level, game.thief)) {
      game.state = 'win';
      game.score = scoreGame(game.thief, game.alarm, game.seconds);
      playWin();
    }
  }
  tickCount += 1;
  drawScene(ctx, game);
  if (!game.frozen) requestAnimationFrame(frame);
}

drawScene(ctx, game);
requestAnimationFrame(frame);
