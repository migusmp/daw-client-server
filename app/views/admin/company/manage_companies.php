<?php
$title = "Gestionar Empresas";
$head = '<link rel="stylesheet" href="/assets/styles/admin/manage_companies.css">';
$headerVariant = "admin";
require_once __DIR__ . "/../../layout/header.php";
?>

<section class="manage-companies" aria-label="Gestión de empresas">
  <header class="manage-companies__hero">
    <div class="manage-companies__hero-copy">
      <p class="manage-companies__kicker">Administración</p>
      <h1 class="manage-companies__title">Gestión de Empresas</h1>
      <p class="manage-companies__lead">
        Panel visual para revisar empresas, validar datos de contacto y priorizar acciones administrativas.
      </p>
      <div class="manage-companies__hero-actions">
        <button class="mc-btn mc-btn--primary" type="button" data-company-new>Nueva empresa</button>
        <a class="mc-btn" href="/admin">Volver al panel</a>
      </div>
    </div>

    <aside class="manage-companies__hero-card" aria-label="Estado general">
      <h2 class="manage-companies__hero-card-title">Estado general</h2>
      <ul class="manage-companies__hero-list">
        <li>Empresas con perfil completo: 82%</li>
        <li>Registros pendientes de revisión: 6</li>
        <li>Última sincronización: hoy, 08:42</li>
      </ul>
    </aside>
  </header>

  <section class="manage-companies__stats" aria-label="Métricas rápidas">
    <article class="mc-stat">
      <p class="mc-stat__label">Empresas activas</p>
      <p class="mc-stat__value" data-company-total>0</p>
      <p class="mc-stat__meta">Empresas registradas actualmente</p>
    </article>

    <article class="mc-stat">
      <p class="mc-stat__label">Con contacto completo</p>
      <p class="mc-stat__value" data-company-complete>0</p>
      <p class="mc-stat__meta">Email y teléfono disponibles</p>
    </article>

    <article class="mc-stat">
      <p class="mc-stat__label">Ciudades distintas</p>
      <p class="mc-stat__value" data-company-cities>0</p>
      <p class="mc-stat__meta">Cobertura territorial actual</p>
    </article>
  </section>

  <section class="manage-companies__content" aria-label="Contenido principal">
    <article class="mc-panel">
      <header class="mc-panel__header">
        <div>
          <h2 class="mc-panel__title">Listado de empresas</h2>
          <p class="mc-panel__subtitle" data-companies-hint>Cargando empresas...</p>
        </div>
        <button class="mc-btn" type="button" data-companies-reload>Recargar</button>
      </header>

      <div class="mc-filters" aria-label="Filtros de empresas">
        <label class="mc-filter">
          <span>Buscar</span>
          <input type="search" placeholder="Nombre, ciudad o contacto" data-company-filter-query />
        </label>

        <label class="mc-filter">
          <span>Ciudad</span>
          <select data-company-filter-city>
            <option value="">Todas</option>
          </select>
        </label>

        <label class="mc-filter">
          <span>Contacto</span>
          <select data-company-filter-contact>
            <option value="all">Todos</option>
            <option value="complete">Completo</option>
            <option value="incomplete">Incompleto</option>
          </select>
        </label>

        <button class="mc-btn mc-btn--ghost" type="button" data-company-filters-reset>Limpiar filtros</button>
      </div>

      <div class="mc-table" role="table" aria-label="Tabla de empresas">
        <div class="mc-table__head" role="row">
          <span>Empresa</span>
          <span>Ciudad</span>
          <span>Contacto</span>
          <span>Acciones</span>
        </div>

        <div data-companies-rows>
          <div class="mc-table__row" role="row">
            <span>—</span>
            <span>—</span>
            <span>—</span>
            <span class="mc-table__actions-cell">
              <button class="mc-row-btn" type="button" disabled>Editar</button>
              <button class="mc-row-btn mc-row-btn--danger" type="button" disabled>Eliminar</button>
            </span>
          </div>
        </div>
      </div>
    </article>

    <aside class="mc-sidebar">
      <article class="mc-panel">
        <h2 class="mc-panel__title" data-company-form-title>Registrar empresa</h2>
        <form class="mc-form" data-company-crud-form aria-label="Formulario de empresa">
          <input type="hidden" name="id" />

          <label class="mc-field">
            <span>Nombre</span>
            <input type="text" name="name" placeholder="Nombre de la empresa" required />
          </label>

          <label class="mc-field">
            <span>Ciudad</span>
            <input type="text" name="city" placeholder="Ciudad" required />
          </label>

          <label class="mc-field">
            <span>Año de creación</span>
            <input type="number" name="creation_year" placeholder="2005" min="1800" max="2100" required />
          </label>

          <label class="mc-field">
            <span>Correo de contacto</span>
            <input type="email" name="contact_email" placeholder="correo@empresa.com" required />
          </label>

          <label class="mc-field">
            <span>Teléfono de contacto</span>
            <input type="text" name="contact_number" placeholder="+34 600 000 000" required />
          </label>

          <div class="mc-form__actions">
            <button class="mc-btn mc-btn--primary" type="submit" data-company-submit-btn>Guardar</button>
            <button class="mc-btn" type="button" data-company-form-reset>Limpiar</button>
            <button class="mc-btn" type="button" data-company-form-cancel hidden>Cancelar edición</button>
          </div>

          <p class="mc-form__status" data-company-form-status></p>
        </form>
      </article>

      <article class="mc-panel">
        <h2 class="mc-panel__title">Ayuda rápida</h2>
        <ul class="mc-quick-list">
          <li>Crear: rellena el formulario y pulsa Guardar.</li>
          <li>Editar: pulsa Editar en una fila para cargar datos.</li>
          <li>Eliminar: usa Eliminar en la fila de la empresa.</li>
        </ul>
      </article>
    </aside>
  </section>

  <div class="mc-modal" data-company-delete-modal hidden>
    <button class="mc-modal__backdrop" type="button" data-company-delete-cancel aria-label="Cerrar confirmación"></button>
    <div class="mc-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="mc-delete-title">
      <button class="mc-modal__close" type="button" data-company-delete-cancel aria-label="Cerrar">×</button>
      <h3 class="mc-modal__title" id="mc-delete-title">Confirmar eliminación</h3>
      <p class="mc-modal__text" data-company-delete-message></p>
      <div class="mc-modal__actions">
        <button class="mc-btn" type="button" data-company-delete-cancel>Cancelar</button>
        <button class="mc-btn mc-btn--danger" type="button" data-company-delete-confirm>Eliminar</button>
      </div>
    </div>
  </div>
</section>

<script type="module" src="/assets/js/admin/companies/manage_companies.js"></script>
<?php require_once __DIR__ . "/../../layout/footer.php"; ?>
