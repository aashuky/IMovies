export function getSavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  return savedTheme === "light" ? "light" : "dark";
}

export function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  return nextTheme;
}
