import { fetchAllUsers } from "../../fetch/admin.fetch.js";
import { fetchAllCompanies } from "../../fetch/companies.fetch.js";
import { appState } from "../../state.js";
import { redirectTo, renderHeaderLinks } from "../../utils.js";

export async function renderAdminPanel({ app, headerNav }) {
  const { user } = appState.getState();

  if (user?.role !== "ADMIN" || user === null) {
    redirectTo("/");
  }

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
    
    <section class="users-resume">
      <div class="stat-users-registered" data-stat-users-registered>
        <strong>Usuarios registrados</strong>
        <span data-users-registered>-</span>
      </div>
      <div class="stat-admin-users-registered" data-stat-admin-users-registered>
        <strong>Administradores registrados</strong>
        <span data-admin-users-registered>-</span>
      </div>
    </section>

    <section class="companies-section" data-companies-section>
      <h2 class="companies-section__title">Empresas registradas</h2>
    </section>
  `;
  const usersRegistered = document.querySelector("[data-users-registered]");
  const adminUsersRegistered = document.querySelector("[data-admin-users-registered]");
  
  const companiesSection = document.querySelector("[data-companies-section]");

  // Obtenemos los usuarios de la bbdd
  const users = await fetchAllUsers();
  const companies = await fetchAllCompanies();

  if (usersRegistered) usersRegistered.textContent = users.length;
  if (adminUsersRegistered)
    adminUsersRegistered.textContent = users.filter(u => u.role === "ADMIN").length;

  companies.forEach(c => {
    renderCompanieComponent(companiesSection, c);
  })

}

function renderCompanieComponent(renderDiv, company) {
  if (!company) return;

  const link = document.createElement("a");
  link.href = "/admin/company/" + company.id;
  const h3 = document.createElement("h3");
  h3.textContent = company.name;

  const pCity = document.createElement("p");
  pCity.textContent = company.city;

  const pCreationYear = document.createElement("p");
  pCreationYear.textContent = company.creation_year;

  link.append(h3, pCity, pCreationYear);
  renderDiv.append(link);
}
