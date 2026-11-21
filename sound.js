// Optional sound layer, built with the Web Audio API (no audio files). Off by default and
// never autoplays: the AudioContext is only created when the visitor turns sound on.
// A soft tick keeps the chosen tempo during each round, each jab lands a muffled thud,
// and a boxing bell rings at the start of every round.
import { tick as tickAt, thud as thudAt, bell as bellAt } from "./synth.js";

const button = document.querySelector("[data-sound-toggle]");
const diptych = document.querySelector(".passions");
let ctx = null;
let on = false;
const tick = (t) => tickAt(ctx, t);
const thud = (t) => thudAt(ctx, t);
const bell = (t) => bellAt(ctx, t);

// Metronome at the chosen tempo while a round is live. A short lookahead keeps it steady;
// the timer is cleared whenever sound goes off, a rest begins or the bout is over.
let metro = 0;
let nextTick = 0;
const live = () => on && ctx && last && !last.rest && last.round >= 0;
const schedule = () => {
  metro = 0;
  if (!live()) return;
  const bpm = window.twoPassions?.bpm ?? 100;
  const spb = 60 / bpm;
  if (nextTick < ctx.currentTime) nextTick = ctx.currentTime + 0.05;
  while (nextTick < ctx.currentTime + 0.12) { tick(nextTick); nextTick += spb; }
  metro = setTimeout(schedule, 25);
};
const restartMetro = () => { clearTimeout(metro); metro = 0; if (live()) schedule(); };

// rhythm.js sends a "beat" event whenever the round, line or jab changes.
let last = null;
const onBeat = ({ detail }) => {
  const prev = last;
  last = detail;
  if (!on || !ctx || !prev) return;
  const t = ctx.currentTime + 0.01;
  const roundStart = detail.round !== prev.round && detail.round > prev.round && !detail.rest;
  if (detail.rest !== prev.rest || detail.round !== prev.round) restartMetro();
  if (roundStart) { bell(t); nextTick = t + 1.2; return; }
  if (detail.rest) return;
  if (detail.jab !== prev.jab) thud(t + 0.035);
};

const toggle = async () => {
  on = !on;
  button.setAttribute("aria-pressed", String(on));
  const name = on ? "Stäng av ljud" : "Slå på ljud";
  button.setAttribute("aria-label", name);
  button.title = name;
  if (on) {
    ctx ??= new AudioContext();
    await ctx.resume();
    if (last && !last.rest) { bell(ctx.currentTime + 0.02); nextTick = ctx.currentTime + 1.2; }
    restartMetro();
  } else {
    clearTimeout(metro);
    metro = 0;
    await ctx?.suspend();
  }
};

if (button && diptych && "AudioContext" in window) {
  button.hidden = false;
  button.addEventListener("click", toggle);
  addEventListener("beat", onBeat);
  addEventListener("tempochange", () => { if (ctx) nextTick = ctx.currentTime + 0.05; });
}
