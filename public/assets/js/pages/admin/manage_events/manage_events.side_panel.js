export function renderSidePanel(sideEl, event) {
  if (!sideEl) return;
  if (!event) {
    sideEl.innerHTML = `
      <h2 class="me-card__title">Panel lateral</h2>
      <div class="me-side-placeholder">Sin evento seleccionado</div>
    `;

    return;
  }

  sideEl.innerHTML = `
    <h1 class="me-card__title">Panel lateral</h1>
    <div class="data-event">
      <span>Nombre</span>
      <p>${event.name}</p>
    </div>
    <div class="data-event">
      <span>Lugar</span>
      <p>${event.place}</p>
    </div>
    <div class="data-event">
      <span>Capacidad</span>
      <p>${event.maximun_capacity}</p>
    </div>
    <div class="data-event">
      <span>Hora</span>
      <p>${event.hour}</p>
    </div>
    <div class="data-event">
      <span>Fecha</span>
      <p>${event.date}</p>
    </div>
    <div class="data-event">
      <span>Tipo de evento</span>
      <p>${event.event_type_name}</p>
    </div>
    <div class="data-event">
      <span>Empresa organizadora</span>
      <p>${event.company_name}</p>
    </div>
    <div class="data-event">
      <span>Precio</span>
      <p>${event.price}€</p>
    </div>

    <div class="side-btns">
      <button type="button" data-side-action="edit" data-edit-id="${event.id}">Editar</button>
      <button type="button" data-side-action="delete" data-delete-id="${event.id}">Eliminar</button>
    </div>
  `;
}