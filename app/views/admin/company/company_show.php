
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

<script type="module" src="/assets/js/admin/companies/company_show.js"></script>
<?php require_once __DIR__ . "/../../layout/footer.php"; ?>
