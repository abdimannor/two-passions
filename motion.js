// Motion switch. The OS "reduce motion" setting is the default, but a visible
// switch can override it. The choice lives in localStorage and on <html data-motion>,
// which both CSS and JS read. Runs in <head> so the first paint is already right.
(() => {
  const root = document.documentElement;
  const KEY = "motion";
  const os = matchMedia("(prefers-reduced-motion: reduce)");
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch {}
  const set = (value) => {
    root.dataset.motion = value;
    // Picture sources that swap GIFs for stills follow the switch, not only the OS.
    document.querySelectorAll("source[data-still]").forEach((s) => { s.media = value === "on" ? "not all" : "all"; });
    dispatchEvent(new CustomEvent("motionchange", { detail: value }));
  };
  root.dataset.motion = saved === "on" || saved === "off" ? saved : os.matches ? "off" : "on";

  const ready = () => {
    const button = document.querySelector("[data-motion-toggle]");
    const notice = document.querySelector("[data-motion-notice]");
    const sync = () => {
      button?.setAttribute("aria-pressed", String(root.dataset.motion === "on"));
      if (notice) notice.hidden = !(saved === null && os.matches && root.dataset.motion === "off");
    };
    const choose = (value) => {
      saved = value;
      try { localStorage.setItem(KEY, value); } catch {}
      set(value);
      sync();
    };
    if (button) { button.hidden = false; button.addEventListener("click", () => choose(root.dataset.motion === "on" ? "off" : "on")); }
    notice?.querySelector("button")?.addEventListener("click", () => { choose("on"); button?.focus(); });
    os.addEventListener("change", () => { if (saved === null) set(os.matches ? "off" : "on"); sync(); });
    set(root.dataset.motion);
    sync();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
