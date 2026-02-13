import { renderAdminPanel } from "./pages/admin/admin_panel.page.js";
import { renderHome } from "./pages/home.page.js";
import { renderLogin } from "./pages/login.page.js";
import { renderRegister } from "./pages/register.page.js";
import { appState } from "./state.js";
import { fetchMe } from "./utils.js";

const app = document.querySelector("#app");
const headerNav = document.querySelector("#header-navegation");

const routes = {
    "/": renderHome,
    "/login": renderLogin,
    "/register": renderRegister,
    "/admin": renderAdminPanel,
};

function render() {
    const path = window.location.pathname;
    const page = routes[path];

    if (page) page({ app, headerNav });
    else app.innerHTML = "<h1>404</h1><p>Ruta no encontrada</p>";
}

export function go(path) {
    history.pushState({}, "", path);
    render();
}

async function loadCurrentUser() {
  await fetchMe();
}

function initApp() {
  appState.subscribe(() => {
    render();
  });

  render();
  loadCurrentUser();
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

  initApp();
} else {
  console.error("No se encontró #app");
}
