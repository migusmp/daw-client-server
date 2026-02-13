import { fetchMe, renderHeader, verifyUserIsLogged } from "../utils.js";

export function renderLogin({ app, headerNav }) {
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
        <h1 class="login-title">Iniciar sesi&oacute;n</h1>
        <p class="login-subtitle">Accede para continuar en la plataforma.</p>

        <form class="login-form login-form--modern" novalidate>
          <div class="form-field">
            <label class="login-label" for="email">Correo</label>
            <div class="input-wrap" data-icon="@">
              <input class="login-input" type="email" name="email" id="email" placeholder="juan@example.com" required>
            </div>
            <p class="error-email field-feedback"></p>
          </div>

          <div class="form-field">
            <label class="login-label" for="password">Contrase&ntilde;a</label>
            <div class="input-wrap" data-icon="*">
              <input class="login-input" type="password" name="password" id="password" placeholder="*******" required>
            </div>
            <p class="error-password field-feedback"></p>
          </div>

          <button class="login-submit" type="submit">Entrar</button>
          <p class="form-helper">
            ¿No tienes cuenta?
            <a class="inline-link" href="/register" data-link>Crear cuenta</a>
          </p>
        </form>
        <p class="success-login"></p>
      </article>
    </section>
  `;

  const form = document.querySelector(".login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const errorEmail = document.querySelector(".error-email");
  const errorPassword = document.querySelector(".error-password");

  const successLoginMsg = document.querySelector(".success-login");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEmail.textContent = "";
    errorPassword.textContent = "";
    successLoginMsg.textContent = "";

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;
    if (!email || email.length == 0) {
      errorEmail.textContent = "El campo email está vacío";
      return;
    }

    if (!email.includes("@")) {
      errorEmail.textContent = "Formato de email inválido";
      return;
    }

    if (!password || password.length < 4) {
      errorPassword.textContent = "Email or password are incorrect";
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await res.json();

      if (!res.ok) {
        errorPassword.textContent = payload.message || "Error de login";
        return;
      }

      successLoginMsg.textContent = payload.message;

      emailInput.value = "";
      passwordInput.value = "";
      // Fetcheamos la informacion del usuario en el login para que al redirigir me salga la información
      // almacenada en el appState
      await fetchMe();
    } catch (e) {
      console.error(e);
    }
  });
}
