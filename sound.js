// Optional sound layer, built with the Web Audio API (no audio files). Off by default and
// never autoplays: the AudioContext is only created when the visitor turns sound on.
// Each new line of the shared beat plays a soft metronome tick (poetry) and a muffled
// thud (the jab), read from the same scroll progress that drives --beat in CSS.
const button = document.querySelector("[data-sound-toggle]");
const diptych = document.querySelector(".passions");
let ctx = null;
let on = false;
let last = null;
let frame = 0;

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

// Same mapping as rhythm.js and the CSS animation-range: cover 8% to cover 38%.
const beatIndex = () => {
  const r = diptych.getBoundingClientRect();
  const raw = (innerHeight - r.top) / (r.height + innerHeight);
  const beat = Math.min(1, Math.max(0, (raw - 0.08) / 0.3));
  const n = Number(getComputedStyle(diptych).getPropertyValue("--n")) || 8;
  return Math.floor(beat * n + 1e-6);
};

const onScroll = () => {
  frame = 0;
  const index = beatIndex();
  if (last !== null && index !== last && ctx) {
    const t = ctx.currentTime + 0.01;
    tick(t);
    thud(t + 0.035);
  }
  last = index;
};

const toggle = async () => {
  on = !on;
  button.setAttribute("aria-pressed", String(on));
  if (on) {
    ctx ??= new AudioContext();
    await ctx.resume();
    last = beatIndex();
    tick(ctx.currentTime + 0.02);
  } else {
    await ctx?.suspend();
  }
};

if (button && diptych && "AudioContext" in window) {
  button.hidden = false;
  button.addEventListener("click", toggle);
  addEventListener("scroll", () => { if (on && !frame) frame = requestAnimationFrame(onScroll); }, { passive: true });
}
