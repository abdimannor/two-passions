// Compact control bar on narrow screens: motion and sound stay in the row, tempo and
// poster fold into a small panel behind a "Mer" disclosure button. Without JS (or on wide
// screens) every control is shown inline, so nothing depends on this script.
const bar = document.querySelector(".controls");
const toggle = document.querySelector("[data-more-toggle]");
const panel = document.getElementById("controls-more");

if (bar && toggle && panel) {
  bar.dataset.collapsible = "";
  toggle.hidden = false;
  const set = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    bar.toggleAttribute("data-open", open);
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    set(open);
    if (open) panel.querySelector("input, button:not([hidden])")?.focus();
  });
  bar.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && bar.hasAttribute("data-open")) { set(false); toggle.focus(); }
  });
}
