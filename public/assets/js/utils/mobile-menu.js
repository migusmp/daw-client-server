(() => {
  const menu = document.querySelector("[data-mobile-menu]");
  const openButton = document.querySelector("[data-mobile-menu-button]");

  if (!menu || !openButton) return;

  const panel = menu.querySelector(".mobile-menu__panel");
  if (!panel) return;

  const closeTriggers = menu.querySelectorAll("[data-mobile-menu-close]");

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  function isOpen() {
    return menu.classList.contains("is-open");
  }

  function setAria(open) {
    openButton.setAttribute("aria-expanded", open ? "true" : "false");
    openButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function getFocusable() {
    return Array.from(panel.querySelectorAll(focusableSelector)).filter((el) => {
      return el instanceof HTMLElement && el.getClientRects().length > 0;
    });
  }

  function openMenu() {
    if (isOpen()) return;
    menu.classList.add("is-open");
    setAria(true);

    window.requestAnimationFrame(() => {
      const primaryLink = panel.querySelector(".mobile-menu__link");
      const first = primaryLink instanceof HTMLElement ? primaryLink : getFocusable()[0];
      first?.focus?.({ preventScroll: true });
    });
  }

  function closeMenu({ focusButton = true } = {}) {
    if (!isOpen()) return;
    menu.classList.remove("is-open");
    setAria(false);

    if (focusButton) {
      window.requestAnimationFrame(() => {
        openButton.focus?.({ preventScroll: true });
      });
    }
  }

  openButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (isOpen()) closeMenu();
    else openMenu();
  });

  closeTriggers.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
    });
  });

  menu.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const link = target?.closest?.("a");
    if (!link) return;
    if (!panel.contains(link)) return;
    closeMenu({ focusButton: false });
  });

  document.addEventListener("click", (e) => {
    if (!isOpen()) return;
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    if (panel.contains(target) || openButton.contains(target)) return;
    closeMenu({ focusButton: false });
  });

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key !== "Tab") return;

    const focusables = getFocusable();
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || active === panel) {
        e.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 861px)").matches) {
      closeMenu({ focusButton: false });
    }
  });

  setAria(false);
})();
