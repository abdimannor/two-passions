// One shared beat for the diptych. Scroll progress through the two columns becomes
// --beat (0 to 1). CSS turns it into lines: poetry types itself out line by line,
// and boxing answers every new line with a jab. Native animation-timeline drives
// --beat where supported; otherwise this script writes it on scroll.
const root = document.documentElement;
const diptych = document.querySelector(".passions");
const poetry = [...document.querySelectorAll(".poetry .card-body p")];
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const native = CSS.supports("animation-timeline: view()");

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
  diptych.style.setProperty("--n", lines.length);
};

let frame = 0;
const fallback = () => {
  frame = 0;
  const r = diptych.getBoundingClientRect();
  const total = r.height + innerHeight;
  // Mirrors animation-range: cover 8% cover 38%.
  const raw = (innerHeight - r.top) / total;
  const beat = Math.min(1, Math.max(0, (raw - 0.08) / 0.30));
  diptych.style.setProperty("--beat", beat.toFixed(4));
};

root.classList.add("has-rhythm");
measure();
new ResizeObserver(measure).observe(diptych);
if (!native) {
  root.classList.add("rhythm-js");
  addEventListener("scroll", () => { if (!frame) frame = requestAnimationFrame(fallback); }, { passive: true });
  fallback();
}
reduce.addEventListener("change", measure);
