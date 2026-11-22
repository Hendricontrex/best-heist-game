// audio.js — tiny synthesised sounds, no audio files: a pickup
// chime, an alarm tick while seen, a win arpeggio and a caught sting.
// Everything runs through one AudioContext created on first input,
// and every call is guarded so a missing audio device never breaks
// the game.
let ctx = null;
let muted = false;

export function initAudio() {
  if (ctx) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  } catch {
    ctx = null;
  }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function tone(freq, seconds, type = 'sine', gain = 0.08, when = 0) {
  if (!ctx || muted) return;
  try {
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + seconds);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + seconds);
  } catch {
    // Sound is garnish; a failure here must never stop the game.
  }
}

export function playPickup() {
  tone(880, 0.12, 'sine', 0.09);
  tone(1318, 0.18, 'sine', 0.07, 0.08);
}

export function playAlarmTick() {
  tone(220, 0.08, 'square', 0.04);
}

export function playWin() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.09, i * 0.12));
}

export function playCaught() {
  tone(160, 0.5, 'sawtooth', 0.1);
  tone(110, 0.6, 'sawtooth', 0.09, 0.15);
}
