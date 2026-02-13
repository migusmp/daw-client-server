import { redirectTo } from "../../utils.js";

export async function renderAdminCompanyPage({ app }) {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return redirectTo("/admin");

    app.innerHTML = `
        <a href="#" id="back-link" data-link>Volver</a>
        
    `;

    const backLink = document.getElementById("back-link");
    backLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.history.back();
    })
}