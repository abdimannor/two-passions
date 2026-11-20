// "Spara som affisch": draws the diptych to a 1080 x 1350 canvas and downloads a PNG.
// Headline, the two still frames and the three shared keywords, in the page's own
// colours and fonts (read from the CSS custom properties). Nothing leaves the browser.
const button = document.querySelector("[data-poster]");

const load = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

// Draw an image to fill a box, cropped from the centre (object-fit: cover).
const cover = (g, img, x, y, w, h) => {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / s;
  const sh = h / s;
  g.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
};

const draw = async () => {
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  const c = { paper: v("--paper"), ink: v("--ink"), soft: v("--ink-soft"), poetry: v("--poetry"), boxing: v("--boxing"), pt: v("--poetry-tint"), bt: v("--boxing-tint") };
  const serif = v("--serif");
  const sans = v("--sans");
  const title = document.querySelector("h1").textContent.trim();
  const labels = [...document.querySelectorAll(".passion-card .label")].map((el) => el.textContent.trim());
  const keywords = [...document.querySelectorAll(".bridge-grid strong")].map((el) => el.textContent.trim());
  const stills = [...document.querySelectorAll("source[data-still]")].map((s) => s.getAttribute("srcset"));
  const [a, b] = await Promise.all(stills.map(load));
  await document.fonts?.ready;

  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  g.fillStyle = c.paper;
  g.fillRect(0, 0, W, H);

  // Headline
  g.fillStyle = c.ink;
  g.textBaseline = "alphabetic";
  g.font = `700 22px ${sans}`;
  g.letterSpacing = "6px";
  g.fillText("TVÅ PASSIONER", 72, 112);
  g.letterSpacing = "0px";
  g.font = `400 150px ${serif}`;
  g.fillText(title, 66, 262);

  // The diptych: two tinted panels, each with its still frame and an offset shadow
  const top = 330;
  const pw = (W - 72 * 2 - 24) / 2;
  const ph = 560;
  [[a, c.poetry, c.pt, labels[0]], [b, c.boxing, c.bt, labels[1]]].forEach(([img, accent, tint, label], i) => {
    const x = 72 + i * (pw + 24);
    g.fillStyle = tint;
    g.fillRect(x, top, pw, ph);
    const ix = x + 28;
    const iy = top + 28;
    const iw = pw - 56;
    const ih = iw * 0.75;
    g.fillStyle = accent;
    g.fillRect(ix + 14, iy + 14, iw, ih);
    cover(g, img, ix, iy, iw, ih);
    g.fillStyle = accent;
    g.font = `700 24px ${sans}`;
    g.letterSpacing = "5px";
    g.fillText(label.toUpperCase(), ix, top + ph - 40);
    g.letterSpacing = "0px";
  });
  g.strokeStyle = c.ink;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(72, top - 1);
  g.lineTo(W - 72, top - 1);
  g.moveTo(72, top + ph + 1);
  g.lineTo(W - 72, top + ph + 1);
  g.stroke();

  // Shared core: the three keywords on the ink band, with the gradient rule
  const band = top + ph + 60;
  g.fillStyle = c.ink;
  g.fillRect(0, band, W, H - band);
  const cw = (W - 72 * 2 - 48) / 3;
  const grad = g.createLinearGradient(72, 0, W - 72, 0);
  grad.addColorStop(0, c.poetry);
  grad.addColorStop(1, c.boxing);
  keywords.forEach((word, i) => {
    const x = 72 + i * (cw + 24);
    g.fillStyle = grad;
    g.fillRect(x, band + 110, cw, 4);
    g.fillStyle = "#8e95a3";
    g.font = `italic 400 34px ${serif}`;
    g.fillText(["I", "II", "III"][i], x, band + 175);
    g.fillStyle = c.paper;
    g.font = `400 56px ${serif}`;
    g.fillText(word, x, band + 250, cw);
  });
  return canvas;
};

const save = async () => {
  button.disabled = true;
  try {
    const canvas = await draw();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "two-passions-affisch.png";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    button.disabled = false;
  }
};

if (button && "toBlob" in HTMLCanvasElement.prototype) {
  button.hidden = false;
  button.addEventListener("click", save);
  window.twoPassionsPoster = draw;
}
