import { appState } from "../state.js";
import { renderHeaderLinks } from "../utils.js";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderNotFound({ app, headerNav }) {
  const { user } = appState.getState();

  const routes = !user
    ? [
        { path: "/", aName: "Inicio" },
        { path: "/login", aName: "Login", className: "btn-login" },
        { path: "/register", aName: "Register", className: "btn-register" },
      ]
    : user.role === "ADMIN"
      ? [
          { path: "/", aName: "Inicio" },
          { path: "/admin", aName: "Administración" },
        ]
      : [{ path: "/", aName: "Inicio" }];

  renderHeaderLinks(headerNav, routes);

  const rawPath = window.location.pathname || "/";
  const safePath = escapeHtml(rawPath);
  const secondaryAction = user?.role === "ADMIN"
    ? { href: "/admin", label: "Ir al panel" }
    : !user
      ? { href: "/login", label: "Iniciar sesión" }
      : null;
  const secondaryLink = secondaryAction
    ? `<a class="nf-btn nf-btn--ghost" href="${secondaryAction.href}" data-link>${secondaryAction.label}</a>`
    : "";

  app.innerHTML = `
    <section class="not-found-page">
      <article class="not-found-card reveal">
        <p class="nf-kicker">Error 404</p>
        <h1 class="nf-title">No pudimos encontrar esta página</h1>
        <p class="nf-subtitle">
          La ruta <code class="nf-path">${safePath}</code> no existe o ya no está disponible.
        </p>

        <div class="nf-actions">
          <a class="nf-btn nf-btn--primary" href="/" data-link>Volver al inicio</a>
          ${secondaryLink}
        </div>
      </article>
    </section>
  `;
}
