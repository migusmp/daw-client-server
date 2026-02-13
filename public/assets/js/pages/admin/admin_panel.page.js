import { appState } from "../../state.js";
import { renderHeaderLinks } from "../../utils.js";

export function renderAdminPanel({ app, headerNav }) {
  const { user } = appState.getState();
  const routes = user?.role === "ADMIN"
    ? [
      { path: "/", aName: "Inicio" },
      { path: "/admin", aName: "Administración" },
    ]
    : [{ path: "/", aName: "Inicio" }];

  renderHeaderLinks(headerNav, routes);

  app.innerHTML = `
    <section class="home-page">
      <article class="home-hero reveal">
        <p class="home-kicker">Administración</p>
        <h1 class="home-title">Panel de administración</h1>
        <p class="home-subtitle">Gestiona recursos y configuración del portal desde este panel.</p>
      </article>
    </section>
    // TODO
    <section class="users-resume"></section>
  `;
}
