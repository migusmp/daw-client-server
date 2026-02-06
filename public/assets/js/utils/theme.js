(() => {
  const STORAGE_KEY = "theme";

  function getCurrentTheme() {
    const attr = document.documentElement.dataset.theme;
    return attr === "dark" || attr === "light" ? attr : null;
  }

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {}
      return;
    }

    document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  function prefersDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function updateToggles() {
    const theme = getCurrentTheme() ?? (prefersDark() ? "dark" : "light");
    const isDark = theme === "dark";

    const hasHeaderToggle = !!document.querySelector("header [data-theme-toggle]");
    document.querySelectorAll("footer [data-theme-toggle]").forEach((el) => {
      el.style.display = hasHeaderToggle ? "none" : "";
    });

    document.querySelectorAll("[data-theme-toggle]").forEach((el) => {
      el.setAttribute("aria-checked", String(isDark));
      el.setAttribute(
        "aria-label",
        isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
      );
      el.setAttribute("title", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    });
  }

  function toggleTheme() {
    const current = getCurrentTheme() ?? (prefersDark() ? "dark" : "light");
    applyTheme(current === "dark" ? "light" : "dark");
    updateToggles();
  }

  function animateToggles() {
    const toggles = document.querySelectorAll("[data-theme-toggle]");
    toggles.forEach((el) => {
      el.classList.remove("is-animating");
      el.offsetWidth;
      el.classList.add("is-animating");
    });

    window.setTimeout(() => {
      document.querySelectorAll("[data-theme-toggle].is-animating").forEach((el) => {
        el.classList.remove("is-animating");
      });
    }, 700);
  }

  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const btn = target?.closest?.("[data-theme-toggle]");
    if (!btn) return;
    e.preventDefault();
    animateToggles();
    toggleTheme();
  });

  updateToggles();
})();
