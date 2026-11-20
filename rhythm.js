// One shared beat for the diptych, framed as three rounds. Scroll progress through the
// two columns is split into Rond 1, 2 and 3 with a short rest between them. Inside a
// round, --beat (0 to 1) moves the poetry lines and the jabs; in a rest it holds still.
// Each round owns a third of the poetry lines. The tempo (BPM) sets how many jabs land
// per line. Other scripts listen for the "beat" event on window.
const root = document.documentElement;
const diptych = document.querySelector(".passions");
const poetry = [...document.querySelectorAll(".poetry .card-body p")];
const rounds = [...document.querySelectorAll("[data-round]")];
const tempo = document.querySelector("[data-tempo]");
const tempoOut = document.querySelector("[data-tempo-out]");

// The bout spans the page's whole scroll range, so Rond 1 opens at the top and
// Rond 3 closes at the bottom, whatever the viewport.
const ROUND = 0.3; // each round, as a share of the bout
const REST = 0.05; // each rest between rounds

// Wrap words in spans. Text nodes between them keep the spaces, so the text is unchanged.
const words = [];
for (const p of poetry) {
  const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const parts = node.textContent.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { frag.append(part); continue; }
      const span = document.createElement("span");
      span.className = "w";
      span.textContent = part;
      frag.append(span);
      words.push(span);
    }
    node.replaceWith(frag);
  }
}

// Tempo: 60 to 140 BPM, remembered. 80 BPM is one jab per line.
const clampBpm = (v) => Math.min(140, Math.max(60, Math.round(Number(v) / 5) * 5 || 100));
let bpm = 100;
try { bpm = clampBpm(localStorage.getItem("tempo") ?? 100); } catch {}

// Progress through the bout -> round, rest and beat.
const state = (p) => {
  for (let r = 0; r < 3; r++) {
    const start = r * (ROUND + REST);
    if (p < start) return { round: r - 1, rest: true, beat: r / 3 };
    if (p < start + ROUND || r === 2) {
      const local = Math.min(1, (p - start) / ROUND);
      return { round: r, rest: false, beat: (r + local) / 3 };
    }
  }
  return { round: 2, rest: false, beat: 1 };
};

let lineCount = 8;
let frame = 0;
let lastKey = "";
const update = () => {
  frame = 0;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const p = Math.min(1, Math.max(0, scrollY / max));
  const before = false;
  const after = p >= 0.995;
  const s = state(p);
  const round = before ? -1 : s.round;
  diptych.style.setProperty("--beat", s.beat.toFixed(4));
  diptych.toggleAttribute("data-rest", s.rest && !before && !after);
  root.toggleAttribute("data-rest", s.rest && !before && !after);
  const b = s.beat * lineCount;
  rounds.forEach((el, i) => {
    const current = i === round;
    if (current) el.setAttribute("aria-current", "step");
    else el.removeAttribute("aria-current");
    el.dataset.state = i < round || (current && (s.rest || after)) ? "done" : current ? "live" : "next";
    const fill = i < round ? 1 : i > round ? 0 : s.rest ? 1 : Math.min(1, Math.max(0, s.beat * 3 - i));
    el.style.setProperty("--fill", fill.toFixed(3));
  });
  const detail = {
    round,
    rest: s.rest || before || after,
    line: Math.floor(b + 1e-6),
    jab: Math.floor(b * (bpm / 80) + 1e-6),
    bpm,
  };
  const key = `${detail.round}|${detail.rest}|${detail.line}|${detail.jab}`;
  if (key !== lastKey) {
    lastKey = key;
    root.dataset.round = String(round + 1);
    dispatchEvent(new CustomEvent("beat", { detail }));
  }
};

const setTempo = (value, save) => {
  bpm = clampBpm(value);
  diptych.style.setProperty("--density", (bpm / 80).toFixed(3));
  if (tempo) tempo.value = String(bpm);
  if (tempoOut) tempoOut.textContent = `${bpm} BPM`;
  if (save) try { localStorage.setItem("tempo", String(bpm)); } catch {}
  dispatchEvent(new CustomEvent("tempochange", { detail: bpm }));
  lastKey = "";
  update();
};

// Group words into visual lines; each word gets k = line + its place in the line.
const measure = () => {
  const lines = [];
  let top = null;
  for (const w of words) {
    const t = Math.round(w.offsetTop);
    if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
    lines.at(-1).push(w);
  }
  lines.forEach((line, i) => line.forEach((w, j) => {
    w.style.setProperty("--k", (i + (j / line.length) * 0.9).toFixed(3));
  }));
  lineCount = Math.max(1, lines.length);
  diptych.style.setProperty("--n", lineCount);
  update();
};

root.classList.add("has-rhythm");
measure();
setTempo(bpm, false);
new ResizeObserver(measure).observe(diptych);
addEventListener("scroll", () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
addEventListener("resize", update);
addEventListener("motionchange", measure);
tempo?.addEventListener("input", () => setTempo(tempo.value, true));
window.twoPassions = { get bpm() { return bpm; } };
