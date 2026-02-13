import { fetchMe } from "./fetch/user.js";
import { renderAdminPanel } from "./pages/admin/admin_panel.page.js";
import { renderHome } from "./pages/home.page.js";
import { renderLogin } from "./pages/login.page.js";
import { renderRegister } from "./pages/register.page.js";
import { appState } from "./state.js";

const app = document.querySelector("#app");
const headerNav = document.querySelector("#header-navegation");

const routes = {
    "/": renderHome,
    "/login": renderLogin,
    "/register": renderRegister,
    "/admin": renderAdminPanel,
};

const pageStylesByRoute = {
    "/": ["/assets/styles/spa/pages/home.css"],
    "/login": ["/assets/styles/spa/pages/auth.css"],
    "/register": ["/assets/styles/spa/pages/auth.css"],
    "/admin": [
      "/assets/styles/spa/pages/home.css",
      "/assets/styles/spa/pages/admin.css",
    ],
};

const PAGE_STYLE_ATTR = "data-spa-page-style";

function normalizePath(path = "/") {
    if (!path) return "/";

    const [pathname] = String(path).split(/[?#]/, 1);
    if (!pathname || pathname === "/") return "/";
    return pathname.replace(/\/+$/, "") || "/";
}

function syncPageStyles(pathname) {
    const currentPath = normalizePath(pathname);
    const expectedStyles = new Set(pageStylesByRoute[currentPath] ?? []);
    const activeStyleLinks = document.querySelectorAll(`link[${PAGE_STYLE_ATTR}]`);

    activeStyleLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (!expectedStyles.has(href)) link.remove();
    });

    expectedStyles.forEach((href) => {
        const selector = `link[${PAGE_STYLE_ATTR}][href="${href}"]`;
        if (document.querySelector(selector)) return;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.setAttribute(PAGE_STYLE_ATTR, "true");
        document.head.appendChild(link);
    });
}

function render() {
    const path = normalizePath(window.location.pathname);
    const page = routes[path];

    syncPageStyles(path);

    if (page) page({ app, headerNav });
    else app.innerHTML = "<h1>404</h1><p>Ruta no encontrada</p>";
}

export function go(path) {
    history.pushState({}, "", normalizePath(path));
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
