// config.js — every number that tunes The Meridian Gallery heist.
// One place for room size, speeds, sight ranges and scoring, so a
// balance change never means hunting through the game logic.
export const ROOM = { w: 960, h: 600, wall: 18 };

export const THIEF = {
  radius: 11,
  walkSpeed: 165, // px per second
  sneakSpeed: 95,
  runSpeed: 205,
  grabRadius: 26,
};

export const GUARD = {
  radius: 12,
  patrolSpeed: 62,
  chaseSpeed: 128,
  sightRange: 175,
  sightHalfAngle: 0.56, // radians, about 32 degrees each side
  touchCatch: 22,
};

export const CAMERA = {
  sightRange: 205,
  sightHalfAngle: 0.42,
  sweepSpeed: 0.55, // radians per second
};

export const ALARM = {
  seenPerSecond: 34, // thief fully in a cone
  seenRunning: 52, // running is loud: spotted faster
  seenSneaking: 20, // sneaking is hard to spot
  decayPerSecond: 6, // alarm cools off while unseen
  investigateAt: 40, // guards start hunting the last seen spot
  caughtAt: 100,
};

export const TOOLS = {
  smokeUses: 3,
  smokeRadius: 78,
  smokeSeconds: 4,
  empUses: 2,
  empSeconds: 6,
};

export const LOOT_VALUE = { diamond: 500, painting: 150, gold: 100 };

// Colours for the midnight-gallery look: deep navy floor, warm gold
// loot, red guard cones, green camera cones, magenta alarm.
export const PALETTE = {
  floorA: '#16213a',
  floorB: '#131c31',
  wall: '#2c3a5e',
  wallTop: '#46588a',
  caseWood: '#5a3d24',
  caseGlass: '#8fb8d8',
  gold: '#f5c542',
  diamond: '#7fe7ff',
  guard: '#e5484d',
  guardCone: 'rgba(229,72,77,0.20)',
  camera: '#3ddc84',
  cameraCone: 'rgba(61,220,132,0.13)',
  thief: '#f2f2f2',
  thiefCoat: '#23232e',
  exit: '#3ddc84',
  alarm: '#ff2e63',
  smoke: 'rgba(200,200,210,0.55)',
};
