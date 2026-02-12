import { renderHeader } from "../utils.js";

export function renderRegister({ app, headerNav }) {
  const routes = [
    { path: "/", aName: "Inicio" },
    { path: "/login", aName: "Login", className: "btn-login" },
    { path: "/register", aName: "Register", className: "btn-register" },
  ];

  renderHeader(headerNav, routes);

  app.innerHTML = `
    <section class="login-page">
      <article class="login-card">
        <h1 class="login-title">Crear cuenta</h1>
        <p class="login-subtitle">Reg&iacute;strate para empezar a usar la plataforma.</p>

        <form class="login-form login-form--modern" novalidate>
          <div class="form-field">
            <label class="login-label" for="name">Nombre</label>
            <div class="input-wrap" data-icon="Aa">
              <input class="login-input" type="text" name="name" id="name" placeholder="Juan P&eacute;rez" required>
            </div>
          </div>

          <div class="form-field">
            <label class="login-label" for="email">Correo</label>
            <div class="input-wrap" data-icon="@">
              <input class="login-input" type="email" name="email" id="email" placeholder="juan@example.com" required>
            </div>
          </div>

          <div class="form-field">
            <label class="login-label" for="password">Contrase&ntilde;a</label>
            <div class="input-wrap" data-icon="*">
              <input class="login-input" type="password" name="password" id="password" placeholder="*******" required>
            </div>
          </div>

          <button class="login-submit" type="submit">Registrarme</button>
          <p class="form-helper">
            ¿Ya tienes cuenta?
            <a class="inline-link" href="/login" data-link>Iniciar sesi&oacute;n</a>
          </p>
        </form>
      </article>
    </section>
  `;
}
