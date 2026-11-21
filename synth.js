// Sound synthesis for the diptych, shared by sound.js (live AudioContext) and the audio
// test (OfflineAudioContext). Each function takes any BaseAudioContext, a start time and
// an optional output node, so the same code can be rendered offline and measured.
export const tick = (ctx, t, out = ctx.destination) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1650, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.06, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + 0.08);
};

export const thud = (ctx, t, out = ctx.destination) => {
  // A falling sine for the body of the punch...
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.18);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.5, t + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
  osc.connect(gain).connect(out);
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
  noise.connect(filter).connect(ng).connect(out);
  noise.start(t);
};

// The round bell: a struck metal plate, built from inharmonic partials that ring out.
export const bell = (ctx, t, out = ctx.destination) => {
  for (const [ratio, level] of [[1, 0.22], [2.76, 0.12], [5.4, 0.07], [8.93, 0.035]]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(620 * ratio, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(level, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2 / ratio ** 0.4);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + 2.4);
  }
};
