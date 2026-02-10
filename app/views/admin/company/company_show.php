
<?php
$title = 'Empresas';
$head = '<link rel="stylesheet" href="/assets/styles/admin/company_show.css">';
$headerVariant = 'admin';
require_once __DIR__ . "/../../layout/header.php";
?>

<section class="company-page" aria-label="Detalle empresa">
  <header class="company-page__header">
    <div>
      <h2 class="company-page__title">Empresa</h2>
      <p class="company-page__subtitle">Detalle, edición y eventos</p>
    </div>
    <a class="company-page__back" href="/admin">Volver</a>
  </header>

  <div class="company-grid">
    <!-- IZQUIERDA: datos -->
    <div class="company-card">
      <h3 class="company-card__title">Datos actuales</h3>

      <dl class="company-dl">
        <div class="company-dl__row">
          <dt>Nombre</dt>
          <dd data-company-name>—</dd>
        </div>
        <div class="company-dl__row">
          <dt>Ciudad</dt>
          <dd data-company-city>—</dd>
        </div>
        <div class="company-dl__row">
          <dt>Año</dt>
          <dd data-company-year>—</dd>
        </div>
        <div class="company-dl__row">
          <dt>Email</dt>
          <dd data-email-person>—</dd>
        </div>
        <div class="company-dl__row">
          <dt>Número</dt>
          <dd data-number-person>—</dd>
        </div>
      </dl>

      <p class="company-note" data-company-status>Cargando empresa...</p>
    </div>

    <!-- DERECHA: editar -->
    <div class="company-card">
      <h3 class="company-card__title">Actualizar empresa</h3>

      <form class="company-form" data-company-form>
        <label class="company-field">
          <span>Nombre</span>
          <input type="text" name="name" placeholder="Nombre de la empresa" required />
        </label>

        <label class="company-field">
          <span>Ciudad</span>
          <input type="text" name="city" placeholder="Ciudad" required />
        </label>

        <label class="company-field">
          <span>Año de creación</span>
          <input type="number" name="creation_year" placeholder="2005" min="1800" max="2100" />
        </label>

        <label class="company-field">
          <span>Correo de contacto</span>
          <input type="email" name="contact_email" placeholder="correo@empresa.com" autocomplete="email" />
        </label>

        <label class="company-field">
          <span>Número de contacto</span>
          <input type="tel" name="contact_number" placeholder="+34 600 000 000" autocomplete="tel" />
        </label>

        <button class="company-btn" type="submit">Guardar cambios</button>
        <p class="company-note" data-company-form-status></p>
      </form>
    </div>
  </div>

  <!-- ABAJO: eventos -->
  <div class="company-events">
    <div class="company-card">
      <h3 class="company-card__title">Eventos de esta empresa</h3>

      <div class="events-list" data-company-events>
        <p class="company-note">Aquí se listarán los eventos cuando crees el endpoint.</p>
      </div>
    </div>
  </div>
</section>

<!-- MODALS (solo UI, sin funcionalidad) -->
<div class="modal" data-modal="event-update" aria-hidden="true">
  <div class="modal__backdrop" data-modal-close aria-hidden="true"></div>
  <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="event-update-title">
    <header class="modal__header">
      <div class="modal__heading">
        <p class="modal__kicker">Evento</p>
        <h3 class="modal__title" id="event-update-title">Actualizar evento</h3>
        <p class="modal__subtitle">
          <span class="modal__chip">ID <strong data-update-event-id>—</strong></span>
          <span class="modal__chip" data-update-event-name>—</span>
        </p>
      </div>

      <button class="modal__icon-btn" type="button" data-modal-close aria-label="Cerrar modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
        </svg>
      </button>
    </header>

    <div class="modal__body">
      <p class="modal__note">
        Este modal solo gestiona la UI. Conecta aquí tu endpoint/handler cuando quieras.
      </p>

      <form class="modal__form" data-event-update-form autocomplete="off">
        <input type="hidden" name="id" />

        <div class="modal__grid">
          <label class="modal-field">
            <span>Nombre</span>
            <input type="text" name="name" placeholder="Nombre del evento" />
          </label>

          <label class="modal-field">
            <span>Lugar</span>
            <input type="text" name="place" placeholder="Ubicación" />
          </label>

          <label class="modal-field">
            <span>Fecha</span>
            <input type="date" name="date" />
          </label>

          <label class="modal-field">
            <span>Hora</span>
            <input type="time" name="hour" />
          </label>

          <label class="modal-field">
            <span>Precio</span>
            <input type="number" name="price" min="0" step="0.01" placeholder="0.00" />
          </label>

          <label class="modal-field">
            <span>Aforo máximo</span>
            <input type="number" name="maximun_capacity" min="0" placeholder="100" />
          </label>

          <label class="modal-field modal-field--full">
            <span>Cartel (ruta)</span>
            <input type="text" name="poster_image" placeholder="/uploads/cartel.jpg" />
          </label>
        </div>
      </form>
    </div>

    <footer class="modal__footer">
      <button class="modal__btn" type="button" data-modal-close>Cancelar</button>
      <button class="modal__btn modal__btn--primary" type="button">Guardar cambios</button>
    </footer>
  </div>
</div>

<div class="modal" data-modal="event-delete" aria-hidden="true">
  <div class="modal__backdrop" data-modal-close aria-hidden="true"></div>
  <div class="modal__dialog modal__dialog--danger" role="dialog" aria-modal="true" aria-labelledby="event-delete-title">
    <header class="modal__header">
      <div class="modal__heading">
        <p class="modal__kicker modal__kicker--danger">Peligro</p>
        <h3 class="modal__title" id="event-delete-title">Eliminar evento</h3>
        <p class="modal__subtitle">
          <span class="modal__chip">ID <strong data-delete-event-id>—</strong></span>
          <span class="modal__chip" data-delete-event-name>—</span>
        </p>
      </div>

      <button class="modal__icon-btn" type="button" data-modal-close aria-label="Cerrar modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
        </svg>
      </button>
    </header>

    <div class="modal__body">
      <div class="modal__danger">
        <p class="modal__danger-title">Vas a eliminar este evento.</p>
        <p class="modal__danger-text">Esta acción no se puede deshacer.</p>
      </div>
      <p class="modal__note">
        El botón de eliminar no hace nada todavía (solo UI). Cuando conectes tu backend, engancha la acción aquí.
      </p>
    </div>

    <footer class="modal__footer">
      <button class="modal__btn" type="button" data-modal-close>Cancelar</button>
      <button class="modal__btn modal__btn--danger" type="button">Eliminar</button>
    </footer>
  </div>
</div>

<script type="module" src="/assets/js/admin/companies/company_show.js"></script>
<?php require_once __DIR__ . "/../../layout/footer.php"; ?>
