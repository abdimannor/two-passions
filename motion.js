// Motion button. Motion is on unless the visitor turns it off; the choice lives in
// localStorage and on <html data-motion>, which both CSS and JS read.
// Runs in <head> so the first paint is already right.
(() => {
  const root = document.documentElement;
  const KEY = "motion";
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch {}
  const set = (value) => {
    root.dataset.motion = value;
    // The animated images are the default; the stills apply only when motion is off.
    document.querySelectorAll("source[data-still]").forEach((s) => { s.media = value === "off" ? "all" : "not all"; });
    dispatchEvent(new CustomEvent("motionchange", { detail: value }));
  };
  root.dataset.motion = saved === "off" ? "off" : "on";

  const ready = () => {
    const button = document.querySelector("[data-motion-toggle]");
    const sync = () => {
      const on = root.dataset.motion === "on";
      const label = on ? "Pausa rörelse" : "Starta rörelse";
      button?.setAttribute("aria-pressed", String(on));
      button?.setAttribute("aria-label", label);
      if (button) button.title = label;
    };
    const choose = (value) => {
      saved = value;
      try { localStorage.setItem(KEY, value); } catch {}
      set(value);
      sync();
    };
    if (button) { button.hidden = false; button.addEventListener("click", () => choose(root.dataset.motion === "on" ? "off" : "on")); }
    set(root.dataset.motion);
    sync();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
