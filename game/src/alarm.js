// alarm.js — the alarm meter: the game's shared tension.
// Being seen fills it, hiding lets it cool. At the investigate line
// the guards start hunting; at the top the crew is caught.
import { ALARM } from './config.js';

export function createAlarm() {
  return { value: 0, caught: false, peak: 0 };
}

export function updateAlarm(alarm, seen, thief, dt) {
  if (alarm.caught) return;
  if (seen) {
    const rate = thief.sneaking
      ? ALARM.seenSneaking
      : thief.running
        ? ALARM.seenRunning
        : ALARM.seenPerSecond;
    alarm.value += rate * dt;
  } else {
    alarm.value -= ALARM.decayPerSecond * dt;
  }
  if (alarm.value < 0) alarm.value = 0;
  if (alarm.value > ALARM.caughtAt) alarm.value = ALARM.caughtAt;
  if (alarm.value > alarm.peak) alarm.peak = alarm.value;
  if (alarm.value >= ALARM.caughtAt) alarm.caught = true;
}

// Score: loot value, plus a quiet bonus for keeping the alarm low,
// minus a little for every second the job took.
export function scoreGame(thief, alarm, seconds) {
  const quiet = Math.max(0, Math.round(200 - alarm.peak * 2));
  const time = Math.max(0, Math.round(150 - seconds));
  return thief.lootValue + quiet + time;
}
