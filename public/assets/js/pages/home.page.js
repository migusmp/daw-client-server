import { appState } from "../state.js";
import { renderHeaderLinks } from "../utils.js";

export function renderHome({ app, headerNav }) {
  const { user } = appState.getState();
  const routes = !user ? [
    { path: "/", aName: "Inicio" },
    { path: "/login", aName: "Login", className: "btn-login"},
    { path: "/register", aName: "Register", className: "btn-register"},
  ] : user.role === "ADMIN" ? [
    { path: "/", aName: "Inicio" },
    { path: "/admin", aName: "Administración" },
  ] : [
    { path: "/", aName: "Inicio" },
  ];
  renderHeaderLinks(headerNav, routes);

  app.innerHTML = `
    <section class="home-page">
      <article class="home-hero reveal">
        <p class="home-kicker">Panel ciudadano</p>
        <h1 class="home-title">Bienvenido al portal</h1>
        <p class="home-subtitle">
          Gestiona tu perfil, consulta tus datos y accede r&aacute;pido a las secciones principales.
        </p>
      </article>

      ${
        user
          ? `
            <article class="user-card reveal reveal-delay-1">
              <div class="user-card-head">
                <h2 class="user-card-title">Tu informaci&oacute;n</h2>
                <span class="user-role-badge">${user.role}</span>
              </div>

              <div class="user-grid">
                <p class="user-row"><span class="user-label">Nombre</span><strong>${user.name}</strong></p>
                <p class="user-row"><span class="user-label">Email</span><strong>${user.email}</strong></p>
              </div>
            </article>
          `
          : `
            <article class="user-empty-card reveal reveal-delay-1">
              <p class="user-empty-title">A&uacute;n no has iniciado sesi&oacute;n</p>
              <p class="user-empty">
                Para ver tu informaci&oacute;n personal necesitas autenticarte.
              </p>
              <a class="inline-link" href="/login" data-link>Ir al login</a>
            </article>
          `
      }
    </section>
  `;
}
