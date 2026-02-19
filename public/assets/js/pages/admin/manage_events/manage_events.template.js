export function getManageEventsTemplate() {
    return `
    <section class="me-page" tabindex="0">
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
              <input class="me-input" type="search" placeholder="Empresa, nombre, lugar, tipo de evento" data-search-event/>
            </label>

            <label class="me-field">
              <span>Empresa</span>
              <select class="me-select" data-company-select>
                <option value="all">Todas</option>
              </select>
            </label>

            <label class="me-field">
              <span>Tipo de evento</span>
              <select class="me-select" data-event-type-select>
                <option value="all">Todos</option>
              </select>
            </label>

            <label class="me-field">
              <span>Estado (No implementado)</span>
              <select class="me-select" date-status-select>
                <option value="all">Todos</option>
                <option>Próximos</option>
                <option>Finalizados</option>
              </select>
            </label>

            <label class="me-field">
              <span>Precio máximo</span>
              <input class="me-input" type="number" min="0" step="0.01" placeholder="0.00" data-price-input/>
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
                  <th>Tipo de evento</th>
                </tr>
              </thead>
              <tbody class="tbody">
                <tr data-event-id-row="1">
                  <td>Festival Primavera 2026</td>
                  <td>Eventos Atlas S.L.</td>
                  <td>WiZink Center, Madrid</td>
                  <td>15/05/2026</td>
                  <td>39,90 €</td>
                  <td>21:00</td>
                  <td>Música</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <aside class="me-card me-card--side">
          <h2 class="me-card__title">Panel lateral</h2>
          <div class="me-side-placeholder">Sin evento seleccionado</div>
        </aside>
      </section>
    </section>
  `;
}
