// shots.js — frozen, deterministic scenes for the screenshots.
// ?shot=cover|stealth|alarm|win stages one frame with the thief,
// guards, cameras, loot and alarm meter all placed on purpose, then
// the game holds still so the capture is the same every run.
export function applyShot(game, name) {
  const { level, thief, alarm } = game;
  game.frozen = true;
  // Frozen scenes never run the update loop, so aim the cameras here.
  for (const c of level.cameras) c.angle = c.baseAngle;
  const setGuard = (id, x, y, angle, state = 'patrol') => {
    const g = level.guards.find((gg) => gg.id === id);
    g.x = x;
    g.y = y;
    g.angle = angle;
    g.state = state;
  };
  if (name === 'cover') {
    game.state = 'play';
    thief.x = 480;
    thief.y = 420;
    thief.sneaking = true;
    thief.facing = -Math.PI / 2;
    setGuard('hall', 430, 210, 0);
    setGuard('west', 95, 320, Math.PI / 2);
    setGuard('vault', 700, 140, Math.PI);
    alarm.value = 25;
    game.seconds = 41;
  } else if (name === 'stealth') {
    game.state = 'play';
    thief.x = 440;
    thief.y = 348;
    thief.sneaking = true;
    thief.facing = -Math.PI / 2;
    setGuard('hall', 480, 250, Math.PI / 2);
    setGuard('west', 150, 470, 0);
    setGuard('vault', 760, 120, Math.PI / 2);
    alarm.value = 12;
    game.seconds = 63;
  } else if (name === 'alarm') {
    game.state = 'play';
    thief.x = 540;
    thief.y = 230;
    thief.sneaking = false;
    thief.facing = Math.PI;
    setGuard('hall', 620, 210, Math.PI, 'hunt');
    setGuard('west', 230, 400, 0);
    setGuard('vault', 700, 140, Math.PI / 2);
    level.smokes = [
      { x: 540, y: 230, r: 78, until: game.now + 60 },
    ];
    alarm.value = 78;
    game.seconds = 96;
  } else if (name === 'win') {
    game.state = 'win';
    thief.x = 480;
    thief.y = 545;
    thief.loot = 3;
    thief.lootValue = 750;
    thief.diamond = true;
    level.loot.find((l) => l.id === 'diamond').taken = true;
    level.loot.find((l) => l.id === 'painting-w').taken = true;
    level.loot.find((l) => l.id === 'gold').taken = true;
    alarm.value = 31;
    alarm.peak = 54;
    game.seconds = 87;
    game.score = 980;
  }
}
