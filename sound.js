// Optional sound layer, built with the Web Audio API (no audio files). Off by default and
// never autoplays: the AudioContext is only created when the visitor turns sound on.
// Each new line of the shared beat plays a soft tick (poetry), each jab a muffled thud,
// and a boxing bell rings at the start of every round.
const button = document.querySelector("[data-sound-toggle]");
const diptych = document.querySelector(".passions");
let ctx = null;
let on = false;

const tick = (t) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1650, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.06, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.08);
};

const thud = (t) => {
  // A falling sine for the body of the punch...
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.18);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.5, t + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.3);
  // ...and a short low-passed noise burst for the glove on the bag.
  const length = Math.floor(ctx.sampleRate * 0.08);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
  const noise = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const ng = ctx.createGain();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  ng.gain.value = 0.35;
  noise.buffer = buffer;
  noise.connect(filter).connect(ng).connect(ctx.destination);
  noise.start(t);
};

// The round bell: a struck metal plate, built from inharmonic partials that ring out.
const bell = (t) => {
  for (const [ratio, level] of [[1, 0.22], [2.76, 0.12], [5.4, 0.07], [8.93, 0.035]]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(620 * ratio, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(level, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2 / ratio ** 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 2.4);
  }
};

// rhythm.js sends a "beat" event whenever the round, line or jab changes.
let last = null;
const onBeat = ({ detail }) => {
  const prev = last;
  last = detail;
  if (!on || !ctx || !prev) return;
  const t = ctx.currentTime + 0.01;
  const roundStart = detail.round !== prev.round && detail.round > prev.round && !detail.rest;
  if (roundStart) { bell(t); return; }
  if (detail.rest) return;
  if (detail.line !== prev.line) tick(t);
  if (detail.jab !== prev.jab) thud(t + 0.035);
};

const toggle = async () => {
  on = !on;
  button.setAttribute("aria-pressed", String(on));
  if (on) {
    ctx ??= new AudioContext();
    await ctx.resume();
    tick(ctx.currentTime + 0.02);
  } else {
    await ctx?.suspend();
  }
};

if (button && diptych && "AudioContext" in window) {
  button.hidden = false;
  button.addEventListener("click", toggle);
  addEventListener("beat", onBeat);
}
