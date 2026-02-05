import { renderMessage, isEmpty, redirectTo } from "../utils/utils.js";

const registerForm = document.getElementById("form-register");
const inputName = document.getElementById("name");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const errorsDiv = document.getElementById("error-msg");

if (!registerForm || !inputName || !inputEmail || !inputPassword || !errorsDiv) {
  throw new Error("Register form elements not found");
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorsDiv.innerHTML = "";

  const name = inputName.value.trim();
  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();

  if (isEmpty(name)) return renderMessage(errorsDiv, "Name field is empty");
  if (isEmpty(email)) return renderMessage(errorsDiv, "Email field is empty");
  if (isEmpty(password)) return renderMessage(errorsDiv, "Password field is empty");

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
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

    renderMessage(errorsDiv, data.message || "Register completed", "success");
    inputName.value = "";
    inputEmail.value = "";
    inputPassword.value = "";

    redirectTo("/", 1200);
  } catch (err) {
    console.error(err);
  }
});
