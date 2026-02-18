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
const ctx = { app, headerNav };

/** 1) Un solo mapa: render + estilos */
const PAGES = {
  "/": {
    render: renderHome,
    styles: ["/assets/styles/spa/pages/home.css"],
  },
  "/login": {
    render: renderLogin,
    styles: ["/assets/styles/spa/pages/auth.css"],
  },
  "/register": {
    render: renderRegister,
    styles: ["/assets/styles/spa/pages/auth.css"],
  },
  "/admin": {
    render: renderAdminPanel,
    styles: [
      "/assets/styles/spa/pages/home.css",
      "/assets/styles/spa/pages/admin.css",
    ],
  },
  "/admin/company": {
    render: renderAdminCompanyPage,
    styles: ["/assets/styles/spa/pages/admin/company_show.css"],
  },
  "/admin/manage-companies": {
    render: renderManageCompaniesPage,
    styles: ["/assets/styles/spa/pages/admin/manage_companies.css"],
  },
  "/admin/manage-events": {
    render: renderManageEventsPage,
    styles: ["/assets/styles/spa/pages/admin/manage_events.css"],
  },
};

const NOT_FOUND = {
  render: renderNotFound,
  styles: ["/assets/styles/spa/pages/not_found.css"],
};

const STYLE_ATTR = "data-spa-style";

// Normalizar ruta
function pathOf(urlPath = "/") {
  const p = (urlPath || "/").split("?")[0].split("#")[0];
  return p !== "/" ? p.replace(/\/+$/, "") : "/";
}

function setPageStyles(hrefs = []) {
  // elimina estilos SPA anteriores
  document.querySelectorAll(`link[${STYLE_ATTR}]`).forEach((l) => l.remove());

  // añade estilos de la página
  hrefs.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(STYLE_ATTR, "1");
    document.head.appendChild(link);
  });
}

function render() {
  const path = pathOf(window.location.pathname);
  const page = PAGES[path] ?? NOT_FOUND;

  setPageStyles(page.styles);
  page.render(ctx);
}

export function go(path) {
  history.pushState({}, "", path);
  render();
}

function setupNavigation() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-link]");
    if (!a) return;
    e.preventDefault();
    go(a.getAttribute("href"));
  });

  window.addEventListener("popstate", render);
}

async function initApp() {
  await fetchMe();
  appState.subscribe(render);
  render();
}

if (!app) {
  console.error("No se encontró #app");
} else {
  setupNavigation();
  initApp().catch((e) => {
    console.error("Error inicializando la app", e);
    render();
  });
}