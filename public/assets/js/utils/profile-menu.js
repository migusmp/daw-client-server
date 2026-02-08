(() => {
  const container = document.querySelector("[data-profile-menu]");
  const button = document.querySelector("[data-profile-menu-button]");
  const panel = document.querySelector("[data-profile-menu-panel]");

  if (!container || !button || !panel) return;

  const focusableSelector = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  function isOpen() {
    return container.classList.contains("is-open");
  }

  function setAria(open) {
    button.setAttribute("aria-expanded", open ? "true" : "false");
    panel.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function openMenu() {
    if (isOpen()) return;
    container.classList.add("is-open");
    setAria(true);

    window.requestAnimationFrame(() => {
      const first = panel.querySelector(focusableSelector);
      if (first instanceof HTMLElement) {
        first.focus?.({ preventScroll: true });
      }
    });
  }

  function closeMenu({ focusButton = true } = {}) {
    if (!isOpen()) return;
    container.classList.remove("is-open");
    setAria(false);

    if (focusButton) {
      window.requestAnimationFrame(() => {
        button.focus?.({ preventScroll: true });
      });
    }
  }

  button.addEventListener("click", (e) => {
    e.preventDefault();
    if (isOpen()) closeMenu();
    else openMenu();
  });

  document.addEventListener("click", (e) => {
    if (!isOpen()) return;
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    if (container.contains(target)) return;
    closeMenu({ focusButton: false });
  });

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key !== "Escape") return;
    e.preventDefault();
    closeMenu();
  });

  setAria(false);
})();

