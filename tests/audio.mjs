// Objective check of the synthesized sounds. Renders the bell, the metronome tick and the
// jab thud from synth.js through an OfflineAudioContext in headless Chromium and measures
// each buffer: peak, RMS, audible duration, dominant frequency (plain DFT) and the level
// at the first and last sample (a hard edge there is an audible click).
// Run: PLAYWRIGHT=/path/to/playwright/index.mjs node tests/audio.mjs   (or with playwright installed)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const { chromium } = await import(process.env.PLAYWRIGHT ?? "playwright");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const types = { ".html": "text/html", ".js": "text/javascript" };
const server = createServer(async (req, res) => {
  try {
    const path = req.url === "/" ? "/index.html" : req.url.split("?")[0];
    const body = await readFile(join(root, path));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" }).end(body);
  } catch { res.writeHead(404).end(); }
}).listen(0);
const url = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage();
await page.goto(url);
const results = await page.evaluate(async () => {
  const synth = await import("/synth.js");
  const rate = 44100;
  const analyse = (data) => {
    let peak = 0, sum = 0, last = 0;
    for (let i = 0; i < data.length; i++) {
      const a = Math.abs(data[i]);
      if (a > peak) peak = a;
      sum += data[i] * data[i];
      if (a > 0.001) last = i;
    }
    // Plain DFT over the first 4096 samples after onset, 10 Hz bins from 20 Hz to 4 kHz.
    const n = Math.min(4096, data.length);
    let best = 0, bestF = 0;
    for (let f = 20; f <= 4000; f += 10) {
      let re = 0, im = 0;
      const w = (2 * Math.PI * f) / rate;
      for (let i = 0; i < n; i++) { const win = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)); re += data[i] * win * Math.cos(w * i); im -= data[i] * win * Math.sin(w * i); }
      const mag = Math.hypot(re, im);
      if (mag > best) { best = mag; bestF = f; }
    }
    return {
      peak: +peak.toFixed(4),
      rms: +Math.sqrt(sum / (last + 1)).toFixed(4),
      durationMs: Math.round(((last + 1) / rate) * 1000),
      dominantHz: bestF,
      firstSample: +Math.abs(data[0]).toFixed(5),
      lastSample: +Math.abs(data[data.length - 1]).toFixed(5),
    };
  };
  const out = {};
  for (const name of ["bell", "tick", "thud"]) {
    const ctx = new OfflineAudioContext(1, rate * 3, rate);
    synth[name](ctx, 0);
    out[name] = analyse((await ctx.startRendering()).getChannelData(0));
  }
  return out;
});
await browser.close();
server.close();

console.table(results);
for (const [name, r] of Object.entries(results)) {
  assert.ok(r.peak > 0.02, `${name} is silent (peak ${r.peak})`);
  assert.ok(r.peak < 1, `${name} clips (peak ${r.peak})`);
  assert.ok(r.rms > 0.001, `${name} has no energy (rms ${r.rms})`);
  assert.ok(r.firstSample < 0.01 && r.lastSample < 0.001, `${name} starts or ends on a hard edge (click)`);
}
const { bell, tick, thud } = results;
assert.ok(bell.durationMs > 1000 && tick.durationMs < 150 && thud.durationMs < 400, "durations are not distinct");
assert.ok(thud.dominantHz < 200, `thud should be low (${thud.dominantHz} Hz)`);
assert.ok(tick.dominantHz > 1000, `tick should be high (${tick.dominantHz} Hz)`);
assert.ok(bell.dominantHz > 400 && bell.dominantHz < 900, `bell fundamental near 620 Hz (${bell.dominantHz} Hz)`);
console.log("audio: all checks passed");
