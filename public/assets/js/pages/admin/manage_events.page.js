import { appState } from "../../state.js";
import { redirectTo, renderHeaderLinks } from "../../utils.js";

export async function renderManageEventsPage({ app, headerNav }) {
  const { user } = appState.getState();

  if (user?.role !== "ADMIN" || user === null) {
    return redirectTo("/");
  }

  renderHeaderLinks(headerNav, [
    { path: "/", aName: "Inicio" },
    { path: "/admin", aName: "Administración" },
    { path: "/admin/manage-events", aName: "Gestión eventos" },
  ]);

  app.innerHTML = `
    <section class="me-page">
      <article class="me-hero reveal">
        <p class="me-kicker">Administración</p>
        <h1 class="me-title">Gestión de eventos</h1>
        <p class="me-subtitle">Base de trabajo para filtrar, crear y mantener el catálogo de eventos.</p>

        <div class="me-hero-actions">
          <a class="me-btn" href="/admin" data-link>Volver al panel</a>
          <button class="me-btn me-btn--primary" type="button">Nuevo evento</button>
        </div>
      </article>

      <section class="me-stats" aria-label="Métricas de eventos">
        <article class="me-stat">
          <p class="me-stat__label">Publicados</p>
          <p class="me-stat__value" data-events-total>0</p>
          <p class="me-stat__meta">Eventos registrados actualmente</p>
        </article>

        <article class="me-stat">
          <p class="me-stat__label">Precio medio</p>
          <p class="me-stat__value" data-events-price-average>0 €</p>
          <p class="me-stat__meta">Promedio en el catálogo</p>
        </article>

        <article class="me-stat">
          <p class="me-stat__label">Aforo total</p>
          <p class="me-stat__value" data-events-capacity-total>0</p>
          <p class="me-stat__meta">Suma de capacidades máximas</p>
        </article>
      </section>

      <section class="me-layout">
        <article class="me-card me-card--main">
          <header class="me-card__head">
            <div>
              <h2 class="me-card__title">Agenda de eventos</h2>
              <p class="me-card__subtitle">Estructura lista para que añadas la lógica de filtrado y acciones CRUD.</p>
            </div>
            <div class="me-card__actions">
              <button class="me-btn" type="button">Recargar</button>
              <button class="me-btn" type="button" data-events-clear-filters>Limpiar filtros</button>
            </div>
          </header>

          <div class="me-filters">
            <label class="me-field">
              <span>Buscar</span>
              <input class="me-input" type="search" placeholder="Nombre, lugar o tipo" />
            </label>

            <label class="me-field">
              <span>Empresa</span>
              <select class="me-select">
                <option>Todas</option>
              </select>
            </label>

            <label class="me-field">
              <span>Fecha</span>
              <input class="me-input" type="date" />
            </label>

            <label class="me-field">
              <span>Estado</span>
              <select class="me-select">
                <option>Todos</option>
                <option>Próximos</option>
                <option>Finalizados</option>
              </select>
            </label>

            <label class="me-field">
              <span>Precio</span>
              <input class="me-input" type="number" min="0" step="0.01" placeholder="0.00" />
            </label>
          </div>

          <div class="me-table-wrap">
            <table class="me-table" aria-label="Tabla de eventos">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Empresa</th>
                  <th>Lugar</th>
                  <th>Fecha</th>
                  <th>Precio</th>
                  <th>Hora</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="me-table__status" colspan="7">Aquí aparecerán los eventos cuando conectes los datos.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <aside class="me-card me-card--side">
          <h2 class="me-card__title">Panel lateral</h2>
          <p class="me-card__subtitle">Reserva este bloque para formulario de alta/edición o vista previa del evento seleccionado.</p>
          <div class="me-side-placeholder">Sin evento seleccionado</div>
        </aside>
      </section>
    </section>
  `;

  const clearFiltersBtn = app.querySelector("[data-events-clear-filters]");
  const filterFields = app.querySelectorAll(".me-filters .me-input, .me-filters .me-select");

  clearFiltersBtn?.addEventListener("click", () => {
    filterFields.forEach((field) => {
      if (field.tagName === "SELECT") {
        field.selectedIndex = 0;
        return;
      }

      field.value = "";
    });
  });
}
