// ====== CONFIG ======
// Cambia esto por tu página actual (la que ya tienes):
const RESUMEN_URL = "./dashboard.html"; // ejemplo: "./dash/index.html" o "./loquejatienes.html"

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const icon = document.getElementById("themeIcon");
  if (icon) icon.textContent = theme === "light" ? "☀" : "☾";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
}

document.addEventListener("DOMContentLoaded", () => {
  // init theme
  const saved = localStorage.getItem("theme");
  setTheme(saved || "dark");

  // theme btn
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  // go resumen
  const go = () => (window.location.href = RESUMEN_URL);
  const btn = document.getElementById("goResumen");
  if (btn) btn.addEventListener("click", go);

  // también: Enter desde teclado en botón
  btn?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") go();
  });
});
