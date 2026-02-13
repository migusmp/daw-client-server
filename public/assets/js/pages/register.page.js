import { fetchMe } from "../fetch/user.js";
import { redirectTo, renderHeader, verifyUserIsLogged } from "../utils.js";

export function renderRegister({ app, headerNav }) {
  // Verifica que el usuario esta logueado, y si lo está
  // redirige a "/"
  verifyUserIsLogged();
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
        <p class="error-register"></p>
      </article>
    </section>
  `;

  const inputName = document.getElementById("name");
  const inputEmail = document.getElementById("email");
  const inputPassword = document.getElementById("password");

  const form = document.querySelector(".login-form");

  const errorRegister = document.querySelector(".error-register");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = inputName.value.trim();
    const email = inputEmail.value.trim().toLowerCase();
    const password = inputPassword.value;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: nombre, email, password }),
      });

      const payload = await res.json();

      if (!res.ok || payload?.status !== "success") {
        errorRegister.textContent = payload?.message || "Error en el registro";
        return;
      }

      await fetchMe();
    } catch (e) {
      console.error(e);
      errorRegister.textContent = "Error en el registro";
    }
  });
}
