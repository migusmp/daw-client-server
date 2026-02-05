import {
  renderMessage,
  isEmpty,
  redirectTo,
} from "../utils/utils.js";

const formLogin = document.getElementById("form-login");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const errorsDiv = document.getElementById("error-msg");

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorsDiv.innerHTML = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (isEmpty(email))
    return renderMessage(errorsDiv, "Email field is empty");
  if (isEmpty(password))
    return renderMessage(errorsDiv, "Password field is empty");

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text);
    }

    if (!res.ok || data.status === "error") {
      throw new Error(data.message || "Request failed");
    }

    renderMessage(
      errorsDiv,
      data.message || "Login completed",
      "success",
    );
    emailInput.value = "";
    passwordInput.value = "";

    redirectTo("/", 1200);
  } catch (e) {
    renderMessage(errorsDiv, e.message ?? String(e));
  }
});
