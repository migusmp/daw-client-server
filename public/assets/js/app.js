import { fetchMe } from "./fetch/user.js";
import { renderAdminPanel } from "./pages/admin/admin_panel.page.js";
import { renderAdminCompanyPage } from "./pages/admin/company.page.js";
import { renderManageCompaniesPage } from "./pages/admin/manage_companies.page.js";
import { renderManageEventsPage } from "./pages/admin/manage_events.page.js";
import { renderHome } from "./pages/home.page.js";
import { renderLogin } from "./pages/login.page.js";
import { renderNotFound } from "./pages/not_found.page.js";
import { renderRegister } from "./pages/register.page.js";
import { appState } from "./state.js";

const app = document.querySelector("#app");
const headerNav = document.querySelector("#header-navegation");

const routes = {
    "/": renderHome,
    "/login": renderLogin,
    "/register": renderRegister,
    "/admin": renderAdminPanel,
    "/admin/company": renderAdminCompanyPage,
    "/admin/manage-companies": renderManageCompaniesPage,
    "/admin/manage-events": renderManageEventsPage,
};

const pageStylesByRoute = {
    "/": ["/assets/styles/spa/pages/home.css"],
    "/login": ["/assets/styles/spa/pages/auth.css"],
    "/register": ["/assets/styles/spa/pages/auth.css"],
    "/admin": [
      "/assets/styles/spa/pages/home.css",
      "/assets/styles/spa/pages/admin.css",
    ],
    "/admin/company": [
      "/assets/styles/spa/pages/admin/company_show.css"
    ],
    "__not_found__": [
      "/assets/styles/spa/pages/not_found.css",
    ],
};

const PAGE_STYLE_ATTR = "data-spa-page-style";

function normalizePath(path = "/") {
    if (!path) return "/";

    const [pathname] = String(path).split(/[?#]/, 1);
    if (!pathname || pathname === "/") return "/";
    return pathname.replace(/\/+$/, "") || "/";
}

function normalizeStyleKey(href) {
  try {
    // clave consistente para comparar: pathname
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href;
  }
}

function syncPageStyles(pathname) {
  const currentPath = normalizePath(pathname);
  const styleRouteKey = Object.prototype.hasOwnProperty.call(pageStylesByRoute, currentPath)
    ? currentPath
    : "__not_found__";

  // expected: [{ href, key }]
  const expected = (pageStylesByRoute[styleRouteKey] ?? []).map((href) => ({
    href,                 // lo que vas a cargar en link.href (tal cual)
    key: normalizeStyleKey(href), // lo que vas a comparar
  }));

  const expectedKeys = new Set(expected.map((s) => s.key));
  const activeLinks = document.querySelectorAll(`link[${PAGE_STYLE_ATTR}]`);

  // Quitar los que sobran
  activeLinks.forEach((link) => {
    const key = link.getAttribute("data-style-key") || normalizeStyleKey(link.getAttribute("href"));
    if (!expectedKeys.has(key)) link.remove();
  });

  // Añadir los que faltan
  expected.forEach(({ href, key }) => {
    const selector = `link[${PAGE_STYLE_ATTR}][data-style-key="${key}"]`;
    if (document.querySelector(selector)) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href; // IMPORTANTE: cargar el href original
    link.setAttribute(PAGE_STYLE_ATTR, "true");
    link.setAttribute("data-style-key", key);
    document.head.appendChild(link);
  });
}

function render() {
    const path = normalizePath(window.location.pathname);
    const page = routes[path];

    syncPageStyles(path);

    if (page) page({ app, headerNav });
    else renderNotFound({ app, headerNav });
}

export function go(path) {
    history.pushState({}, "", path);
    render();
}

async function loadCurrentUser() {
  await fetchMe();
}

async function initApp() {
  await loadCurrentUser();

  appState.subscribe(() => {
    render();
  });

  render();
}

if (app) {
  // Intercepta clicks en <a data-link>
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-link]");
    if (!a) return;

    e.preventDefault();
    go(a.getAttribute("href"));
  });

  // Botones atrás/adelante
  window.addEventListener("popstate", render);

  initApp().catch((e) => {
    console.error("Error inicializando la app", e);
    render();
  });
} else {
  console.error("No se encontró #app");
}
