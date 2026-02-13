import { go } from "./app.js";
import { appState } from "./state.js";

const PROFILE_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
    <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
  </svg>
`;

const normalizePath = (value = "/") => {
  if (!value) return "/";

  let path = value;
  try {
    path = new URL(value, window.location.origin).pathname;
  } catch {
    path = value.split(/[?#]/, 1)[0];
  }

  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
};

const isActionRoute = ({ className = "" }) =>
  className.includes("btn-login") || className.includes("btn-register");

const logoutUser = async () => {
  try {
    await fetch("/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch (e) {
    console.error("Error al cerrar sesión", e);
  } finally {
    appState.setState({ user: null });
    go("/");
  }
};

const buildLink = ({ path, aName, className = "" }, currentPath, { mobile = false } = {}) => {
  const isActive = normalizePath(currentPath) === normalizePath(path);
  const classes = [
    "nav-link",
    className,
    mobile ? "nav-link--mobile" : "",
    isActive ? "is-active" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const ariaCurrent = isActive ? ' aria-current="page"' : "";

  return `<a href="${path}" data-link class="${classes}"${ariaCurrent}>${aName}</a>`;
};

const buildButton = (button = {}, { mobile = false } = {}) => {
  const {
    path = "",
    className = "",
    label = "Botón",
    icon = "",
  } = button;
  const classes = [
    "nav-link",
    "nav-button",
    className,
    mobile ? "nav-link--mobile nav-button--mobile" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const iconHtml = icon
    ? `<span class="nav-button__icon" aria-hidden="true">${icon}</span>`
    : "";
  const labelHtml = (mobile || !icon)
    ? `<span class="nav-button__label">${label}</span>`
    : "";
  const content = `${iconHtml}${labelHtml}`;

  if (path) {
    return `<a href="${path}" data-link class="${classes}" aria-label="${label}" title="${label}">${content}</a>`;
  }

  return `<button type="button" class="${classes}" aria-label="${label}" title="${label}">${content}</button>`;
};

const setupMobileMenu = (headerEl) => {
  const menuButton = headerEl.querySelector(".nav-menu-toggle");
  const mobileMenu = headerEl.querySelector(".nav-mobile-menu");
  if (!menuButton || !mobileMenu) return;

  const setOpen = (isOpen) => {
    headerEl.classList.toggle("is-menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    mobileMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
  };

  setOpen(false);

  menuButton.onclick = (event) => {
    event.preventDefault();
    setOpen(!headerEl.classList.contains("is-menu-open"));
  };

  mobileMenu.onclick = async (event) => {
    if (event.target.closest("[data-logout-button]")) {
      event.preventDefault();
      setOpen(false);
      await logoutUser();
      return;
    }

    if (event.target.closest("a[data-link]")) setOpen(false);
  };
};

const setupProfileMenu = (headerEl) => {
  if (typeof headerEl._cleanupProfileMenu === "function") {
    headerEl._cleanupProfileMenu();
    headerEl._cleanupProfileMenu = null;
  }

  const profileMenu = headerEl.querySelector("[data-profile-menu]");
  const trigger = headerEl.querySelector("[data-profile-menu-trigger]");
  const panel = headerEl.querySelector("[data-profile-menu-panel]");
  const logoutButton = headerEl.querySelector("[data-profile-logout]");
  if (!profileMenu || !trigger || !panel || !logoutButton) return;

  const setOpen = (isOpen) => {
    profileMenu.classList.toggle("is-open", isOpen);
    trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  };

  setOpen(false);

  const onTriggerClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!profileMenu.classList.contains("is-open"));
  };

  const onDocumentClick = (event) => {
    if (!profileMenu.contains(event.target)) setOpen(false);
  };

  const onDocumentKeydown = (event) => {
    if (event.key === "Escape") setOpen(false);
  };

  const onLogoutClick = async (event) => {
    event.preventDefault();
    setOpen(false);
    await logoutUser();
  };

  trigger.addEventListener("click", onTriggerClick);
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeydown);
  logoutButton.addEventListener("click", onLogoutClick);

  headerEl._cleanupProfileMenu = () => {
    trigger.removeEventListener("click", onTriggerClick);
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onDocumentKeydown);
    logoutButton.removeEventListener("click", onLogoutClick);
  };
};

export const renderHeader = (headerEl, routes = [], options = {}) => {
  if (!headerEl) return;

  const { user } = appState.getState();
  const { buttons = [] } = options;
  const currentPath = normalizePath(window.location.pathname);
  const mainRoutes = routes.filter((route) => !isActionRoute(route));
  const actionRoutes = routes.filter(isActionRoute);
  const hasSession = Boolean(user);
  const allButtons = [...buttons];

  const mainLinks = mainRoutes
    .map((route) => buildLink(route, currentPath))
    .join("");
  const actionLinks = hasSession
    ? ""
    : actionRoutes.map((route) => buildLink(route, currentPath)).join("");
  const actionButtons = allButtons
    .map((button) => buildButton(button))
    .join("");
  const mobileLinks = (hasSession ? mainRoutes : routes)
    .map((route) => buildLink(route, currentPath, { mobile: true }))
    .join("");
  const mobileButtons = allButtons
    .map((button) => buildButton(button, { mobile: true }))
    .join("");
  const profileMenu = hasSession
    ? `
      <div class="nav-profile-menu" data-profile-menu>
        <button
          type="button"
          class="nav-link nav-button nav-profile-button"
          data-profile-menu-trigger
          aria-expanded="false"
          aria-haspopup="menu"
          aria-controls="profile-menu-panel"
          aria-label="Abrir menú de perfil"
          title="Perfil"
        >
          <span class="nav-button__icon" aria-hidden="true">${PROFILE_ICON}</span>
        </button>
        <div
          id="profile-menu-panel"
          class="nav-profile-menu__panel"
          data-profile-menu-panel
          role="menu"
          aria-hidden="true"
        >
          <button type="button" class="nav-profile-menu__item nav-profile-menu__item--danger" data-profile-logout data-logout-button>
            Logout
          </button>
        </div>
      </div>
    `
    : "";
  const mobileSessionAction = hasSession
    ? `
      <button type="button" class="nav-link nav-button nav-link--mobile nav-button--mobile nav-mobile-logout" data-logout-button>
        <span class="nav-button__label">Logout</span>
      </button>
    `
    : "";

  headerEl.innerHTML = `
    <div class="nav-desktop">
      <div class="nav-links-main">${mainLinks}</div>
      <div class="nav-links-actions">${actionLinks}${actionButtons}${profileMenu}</div>
    </div>

    <button class="nav-menu-toggle" type="button" aria-controls="mobile-navigation" aria-expanded="false" aria-label="Abrir menú de navegación">
      <span class="nav-menu-toggle__icon" aria-hidden="true">
        <span class="nav-menu-toggle__bar"></span>
      </span>
    </button>

    <div id="mobile-navigation" class="nav-mobile-menu" aria-hidden="true">
      <div class="nav-mobile-menu__links">${mobileLinks}</div>
      <div class="nav-mobile-menu__actions">${mobileButtons}${mobileSessionAction}</div>
    </div>
  `;

  setupMobileMenu(headerEl);
  setupProfileMenu(headerEl);
};

export const renderHeaderLinks = renderHeader;

export const fetchMe = async () => {
  try {
    const res = await fetch("/api/me", { method: "GET" });
    const payload = await res.json();

    if (!res.ok || payload?.status !== "success" || !payload?.data) {
      console.error("Error: " + res);
      return;
    }
    appState.setState({ user: payload.data });
    return;
  } catch (e) {
    appState.setState({ user: null });
  }
}

export const redirectTo = (route, time = 0) =>
  setTimeout(() => go(route), time);

export const verifyUserIsLogged = () => {
  const { user } = appState.getState();
  if (user) redirectTo("/");
}

export const userIsLogged = () => {
  const { user } = appState.getState();
  return user ? true : false;
}
