import { appState } from "../../state.js";
import { redirectTo, renderHeaderLinks } from "../../utils.js";

export async function renderManageCompaniesPage({ app, headerNav }) {
  const { user } = appState.getState();

  if (user?.role !== "ADMIN" || user === null) {
    return redirectTo("/");
  }

  renderHeaderLinks(headerNav, [
    { path: "/", aName: "Inicio" },
    { path: "/admin", aName: "Administración" },
    { path: "/admin/manage-companies", aName: "Gestión empresas" },
  ]);

  app.innerHTML = `
    <section class="mc-page">
      <article class="mc-hero reveal">
        <p class="mc-kicker">Administración</p>
        <h1 class="mc-title">Gestión de empresas</h1>
        <p class="mc-subtitle">Espacio base para crear, editar y revisar empresas registradas.</p>

        <div class="mc-hero-actions">
          <a class="mc-btn" href="/admin" data-link>Volver al panel</a>
          <button class="mc-btn mc-btn--primary" type="button">Nueva empresa</button>
        </div>
      </article>

      <section class="mc-layout">
        <article class="mc-card mc-card--main">
          <header class="mc-card__head">
            <div>
              <h2 class="mc-card__title">Listado de empresas</h2>
              <p class="mc-card__subtitle">Aquí podrás mostrar la tabla real cuando implementes la funcionalidad.</p>
            </div>
            <button class="mc-btn" type="button">Recargar</button>
          </header>

          <div class="mc-filters">
            <label class="mc-field">
              <span>Buscar</span>
              <input class="mc-input" type="search" placeholder="Nombre, ciudad o email" />
            </label>

            <label class="mc-field">
              <span>Ciudad</span>
              <select class="mc-select">
                <option>Todas</option>
              </select>
            </label>

            <label class="mc-field">
              <span>Estado</span>
              <select class="mc-select">
                <option>Todos</option>
                <option>Completos</option>
                <option>Incompletos</option>
              </select>
            </label>
          </div>

          <div class="mc-table-wrap">
            <table class="mc-table" aria-label="Tabla de empresas">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Ciudad</th>
                  <th>Contacto</th>
                  <th>Fundación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="mc-table__status" colspan="5">Aquí aparecerán las empresas cuando conectes los datos.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <aside class="mc-card mc-card--side">
          <h2 class="mc-card__title">Panel lateral</h2>
          <p class="mc-card__subtitle">Puedes usar este bloque para formulario de alta/edición o detalle de la empresa seleccionada.</p>
          <div class="mc-side-placeholder">Sin empresa seleccionada</div>
        </aside>
      </section>
    </section>
  `;
}
