export function getManageCompaniesTemplate() {
  return `
    <section class="mc-page">
      <article class="mc-hero reveal">
        <p class="mc-kicker">Administración</p>
        <h1 class="mc-title">Gestión de empresas</h1>
        <p class="mc-subtitle">Selecciona una empresa en la tabla para ver su detalle y gestionarla.</p>

        <div class="mc-hero-actions">
          <a class="mc-btn" href="/admin" data-link>Volver al panel</a>
          <button class="mc-btn mc-btn--primary" type="button" data-mc-new>Nueva empresa</button>
        </div>
      </article>

      <section class="mc-layout">
        <article class="mc-card mc-card--main">
          <header class="mc-card__head">
            <div>
              <h2 class="mc-card__title">Listado de empresas</h2>
              <p class="mc-card__subtitle">Tip: haz click en una fila (o Enter) para abrir el detalle.</p>
            </div>

            <div class="mc-head-actions">
              <button class="mc-btn" type="button" data-mc-reload>Recargar</button>
              <button class="mc-btn" type="button" data-mc-clear>Limpiar filtros</button>
            </div>
          </header>

          <div class="mc-filters">
            <label class="mc-field">
              <span>Buscar</span>
              <input class="mc-input" data-mc-search type="search" placeholder="Nombre, ciudad, email o teléfono" />
            </label>

            <label class="mc-field">
              <span>Ciudad</span>
              <select class="mc-select" data-mc-city>
                <option value="all">Todas</option>
                <option value="Albacete">Albacete</option>
                <option value="Madrid">Madrid</option>
                <option value="Valencia">Valencia</option>
              </select>
            </label>

            <label class="mc-field">
              <span>Tipo de evento</span>
              <select class="mc-select" data-mc-event-type>
                <option value="all">Todos</option>
              </select>
            </label>

            <label class="mc-field">
              <span>Estado</span>
              <select class="mc-select" data-mc-status>
                <option value="all">Todos</option>
                <option value="Completos">Completos</option>
                <option value="Incompletos">Incompletos</option>
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
                  <th>Enlace</th>
                </tr>
              </thead>

              <tbody data-mc-tbody>
                <tr
                  class="mc-row"
                  data-mc-row
                  data-id="1"
                  tabindex="0"
                  aria-selected="false"
                  title="Click para ver detalle"
                >
                  <td>
                    <div class="mc-company">
                      <span class="mc-dot mc-dot--ok"></span>
                      <div class="mc-company__meta">
                        <div class="mc-company__name">AreaProject</div>
                        <div class="mc-company__sub">
                          <span class="mc-pill mc-pill--ok">Completa</span>
                          <span class="mc-muted">ID: 1</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span class="mc-city">Albacete</span></td>
                  <td>
                    <div class="mc-contact">
                      <span class="mc-contact__email">contacto@areaproject.es</span>
                      <span class="mc-contact__phone">+34 967 000 111</span>
                    </div>
                  </td>
                </tr>

                <tr
                  class="mc-row is-selected"
                  data-mc-row
                  data-id="2"
                  tabindex="0"
                  aria-selected="true"
                  title="Click para ver detalle"
                >
                  <td>
                    <div class="mc-company">
                      <span class="mc-dot mc-dot--warn"></span>
                      <div class="mc-company__meta">
                        <div class="mc-company__name">Concilia2</div>
                        <div class="mc-company__sub">
                          <span class="mc-pill mc-pill--warn">Incompleta</span>
                          <span class="mc-muted">ID: 2</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span class="mc-city">Albacete</span></td>
                  <td>
                    <div class="mc-contact">
                      <span class="mc-contact__email">info@concilia2.es</span>
                      <span class="mc-contact__phone">—</span>
                    </div>
                  </td>
                </tr>

                <tr
                  class="mc-row"
                  data-mc-row
                  data-id="3"
                  tabindex="0"
                  aria-selected="false"
                  title="Click para ver detalle"
                >
                  <td>
                    <div class="mc-company">
                      <span class="mc-dot mc-dot--ok"></span>
                      <div class="mc-company__meta">
                        <div class="mc-company__name">Devaim</div>
                        <div class="mc-company__sub">
                          <span class="mc-pill mc-pill--ok">Completa</span>
                          <span class="mc-muted">ID: 3</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span class="mc-city">Valencia</span></td>
                  <td>
                    <div class="mc-contact">
                      <span class="mc-contact__email">rrhh@devaim.com</span>
                      <span class="mc-contact__phone">+34 960 222 333</span>
                    </div>
                  </td>
                </tr>

                <tr
                  class="mc-row"
                  data-mc-row
                  data-id="4"
                  tabindex="0"
                  aria-selected="false"
                  title="Click para ver detalle"
                >
                  <td>
                    <div class="mc-company">
                      <span class="mc-dot mc-dot--warn"></span>
                      <div class="mc-company__meta">
                        <div class="mc-company__name">NorteLabs</div>
                        <div class="mc-company__sub">
                          <span class="mc-pill mc-pill--warn">Incompleta</span>
                          <span class="mc-muted">ID: 4</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span class="mc-city">Madrid</span></td>
                  <td>
                    <div class="mc-contact">
                      <span class="mc-contact__email">hola@nortelabs.dev</span>
                      <span class="mc-contact__phone">+34 910 444 555</span>
                    </div>
                  </td>
                </tr>

                <tr
                  class="mc-row"
                  data-mc-row
                  data-id="5"
                  tabindex="0"
                  aria-selected="false"
                  title="Click para ver detalle"
                >
                  <td>
                    <div class="mc-company">
                      <span class="mc-dot mc-dot--ok"></span>
                      <div class="mc-company__meta">
                        <div class="mc-company__name">Feria Events</div>
                        <div class="mc-company__sub">
                          <span class="mc-pill mc-pill--ok">Completa</span>
                          <span class="mc-muted">ID: 5</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span class="mc-city">Albacete</span></td>
                  <td>
                    <div class="mc-contact">
                      <span class="mc-contact__email">eventos@feriaevents.es</span>
                      <span class="mc-contact__phone">+34 967 888 999</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <aside class="mc-card mc-card--side">
          <header>
            <h2 class="mc-card__title">Detalle</h2>
            <p class="mc-card__subtitle">Acciones disponibles para la empresa seleccionada.</p>
          </header>

          <div data-mc-side>
            <div class="mc-side-empty">
              <div class="mc-side-empty__icon">i</div>
              <div class="mc-side-empty__title">Sin empresa seleccionada</div>
              <div class="mc-side-empty__text">
                Selecciona una fila de la tabla para ver el detalle aquí.
              </div>

              <div class="mc-side-empty__tips">
                <div class="mc-side-tip"><strong>Tip:</strong> puedes usar Enter en una fila.</div>
                <div class="mc-side-tip"><strong>Tip:</strong> usa los filtros para encontrar más rápido.</div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </section>
  `;
}
