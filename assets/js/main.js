
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => splash.remove(), 1000);
  }, 3500);
});
