import { $, fetchJson, normalizeText, toText } from "../../utils/utils.js";

const form = $("[data-event-crud-form]");
const listBox = $("[data-events-list]");
const hint = $("[data-events-hint]");
const statusBox = $("[data-event-form-status]");
const formTitle = $("[data-event-form-title]");
const submitBtn = $("[data-event-submit-btn]");
const cancelBtn = $("[data-event-form-cancel]");
const resetBtn = $("[data-event-form-reset]");
const reloadBtn = $("[data-events-reload]");
const newBtn = $("[data-event-new]");

const companySelect = $("[data-event-company-select]");
const eventTypeSelect = $("[data-event-type-select]");

const totalEl = $("[data-events-total]");
const avgPriceEl = $("[data-events-price-average]");
const totalCapacityEl = $("[data-events-capacity-total]");

const filterQueryInput = $("[data-event-filter-query]");
const filterCompanySelect = $("[data-event-filter-company]");
const filterTypeSelect = $("[data-event-filter-type]");
const filterFromInput = $("[data-event-filter-from]");
const filterToInput = $("[data-event-filter-to]");
const filterResetBtn = $("[data-event-filters-reset]");

const deleteModal = $("[data-event-delete-modal]");
const deleteMessage = $("[data-event-delete-message]");
const deleteConfirmBtn = $("[data-event-delete-confirm]");
const deleteCancelButtons = document.querySelectorAll("[data-event-delete-cancel]");

let events = [];
let companies = [];
let eventTypes = [];
let deletingEventId = 0;

function setStatus(message = "", type = "") {
  if (!statusBox) return;

  statusBox.textContent = message;
  statusBox.className = "me-form__status";

  if (type) {
    statusBox.classList.add(`is-${type}`);
  }
}

function setHint(message = "") {
  if (!hint) return;
  hint.textContent = message;
}

function getFormField(name) {
  if (!form) return null;

  const field = form.elements.namedItem(name);
  if (!field) return null;

  if (typeof RadioNodeList !== "undefined" && field instanceof RadioNodeList) {
    return null;
  }

  return field;
}

function shortHour(value) {
  const hour = toText(value, "").trim();
  if (!hour) return "";
  return hour.length >= 5 ? hour.slice(0, 5) : hour;
}

function populateSelect(selectElement, items, placeholder, selectedValue = "") {
  if (!selectElement) return;

  selectElement.innerHTML = "";

  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = placeholder;
  selectElement.append(firstOption);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = String(item.id);
    option.textContent = toText(item.name || item.nombre, `ID ${item.id}`);

    if (String(option.value) === String(selectedValue)) {
      option.selected = true;
    }

    selectElement.append(option);
  });
}

function updateStats(list) {
  const total = list.length;

  const totalCapacity = list.reduce((sum, event) => {
    return sum + (Number(event.maximun_capacity) || 0);
  }, 0);

  const totalPrice = list.reduce((sum, event) => {
    return sum + (Number(event.price) || 0);
  }, 0);

  const avgPrice = total > 0 ? (totalPrice / total).toFixed(2) : "0.00";

  if (totalEl) totalEl.textContent = String(total);
  if (avgPriceEl) avgPriceEl.textContent = `${avgPrice} €`;
  if (totalCapacityEl) totalCapacityEl.textContent = String(totalCapacity);
}

function readFilters() {
  return {
    query: normalizeText(filterQueryInput?.value || ""),
    companyId: String(filterCompanySelect?.value || ""),
    eventTypeId: String(filterTypeSelect?.value || ""),
    fromDate: String(filterFromInput?.value || ""),
    toDate: String(filterToInput?.value || ""),
  };
}

function eventMatchesFilters(event, filters) {
  if (filters.companyId && String(event.id_company) !== filters.companyId) {
    return false;
  }

  if (filters.eventTypeId && String(event.id_event_type) !== filters.eventTypeId) {
    return false;
  }

  if (filters.fromDate || filters.toDate) {
    const eventDate = toText(event.date, "");

    if (!eventDate) return false;
    if (filters.fromDate && eventDate < filters.fromDate) return false;
    if (filters.toDate && eventDate > filters.toDate) return false;
  }

  if (!filters.query) {
    return true;
  }

  const searchable = [
    event.name,
    event.place,
    event.company_name,
    event.event_type_name,
    event.date,
    event.hour,
  ]
    .map((value) => normalizeText(value))
    .join(" ");

  return searchable.includes(filters.query);
}

function getFilteredEvents() {
  const filters = readFilters();
  return events.filter((event) => eventMatchesFilters(event, filters));
}

function getBadgeData(event) {
  const capacity = Number(event.maximun_capacity) || 0;
  const price = Number(event.price) || 0;

  if (capacity >= 5000) {
    return {
      className: "me-event-card__status me-event-card__status--full",
      label: "Aforo alto",
    };
  }

  if (price <= 0) {
    return {
      className: "me-event-card__status me-event-card__status--draft",
      label: "Gratis",
    };
  }

  return {
    className: "me-event-card__status me-event-card__status--live",
    label: "Activo",
  };
}

function buildEventCard(event) {
  const card = document.createElement("article");
  card.className = "me-event-card";

  const date = document.createElement("p");
  date.className = "me-event-card__date";
  const hour = shortHour(event.hour);
  date.textContent = `${toText(event.date, "Sin fecha")}${hour ? ` · ${hour}` : ""}`;

  const title = document.createElement("h3");
  title.className = "me-event-card__title";
  title.textContent = toText(event.name, "Evento sin nombre");

  const meta = document.createElement("p");
  meta.className = "me-event-card__meta";
  meta.textContent = `${toText(event.company_name, `Empresa ${toText(event.id_company)}`)} · ${toText(event.event_type_name, `Tipo ${toText(event.id_event_type)}`)} · ${toText(event.place, "Sin lugar")}`;

  const priceInfo = document.createElement("p");
  priceInfo.className = "me-event-card__meta";
  priceInfo.textContent = `Precio: ${Number(event.price || 0).toFixed(2)} € · Aforo: ${toText(event.maximun_capacity, "0")}`;

  const badge = getBadgeData(event);
  const badgeElement = document.createElement("p");
  badgeElement.className = badge.className;
  badgeElement.textContent = badge.label;

  const actions = document.createElement("div");
  actions.className = "me-event-card__actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "me-row-btn";
  editBtn.dataset.action = "edit";
  editBtn.dataset.id = String(event.id);
  editBtn.textContent = "Editar";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "me-row-btn me-row-btn--danger";
  deleteBtn.dataset.action = "delete";
  deleteBtn.dataset.id = String(event.id);
  deleteBtn.textContent = "Eliminar";

  actions.append(editBtn, deleteBtn);
  card.append(date, title, meta, priceInfo, badgeElement, actions);

  return card;
}

function renderEvents(list) {
  if (!listBox) return;

  listBox.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "me-cards__empty";
    empty.textContent = "No hay eventos registrados todavía.";
    listBox.append(empty);
    return;
  }

  list.forEach((event) => {
    listBox.append(buildEventCard(event));
  });
}

function refreshView() {
  const filteredEvents = getFilteredEvents();

  renderEvents(filteredEvents);
  updateStats(filteredEvents);

  if (!events.length) {
    setHint("No hay eventos registrados.");
    return;
  }

  if (filteredEvents.length === events.length) {
    setHint(`Mostrando ${filteredEvents.length} eventos`);
    return;
  }

  setHint(`Mostrando ${filteredEvents.length} de ${events.length} eventos`);
}

function setDeleteModalOpen(open) {
  if (!deleteModal) return;

  deleteModal.hidden = !open;
  deleteModal.classList.toggle("is-open", open);
  document.body.classList.toggle("admin-modal-open", open);
}

function openDeleteModal(event) {
  deletingEventId = Number(event.id || 0);

  if (deleteMessage) {
    deleteMessage.textContent = `Vas a eliminar el evento "${toText(event.name, "Sin nombre")}". Esta acción no se puede deshacer.`;
  }

  setDeleteModalOpen(true);
}

function closeDeleteModal() {
  deletingEventId = 0;
  setDeleteModalOpen(false);
}

function resetForm(clearStatus = true) {
  if (!form) return;

  form.reset();

  const idField = getFormField("id");
  if (idField) {
    idField.value = "";
  }

  if (formTitle) formTitle.textContent = "Registrar evento";
  if (submitBtn) submitBtn.textContent = "Guardar";
  if (cancelBtn) cancelBtn.hidden = true;

  if (clearStatus) {
    setStatus("");
  }
}

function loadEventInForm(event) {
  const idField = getFormField("id");
  const nameField = getFormField("name");
  const companyField = getFormField("id_company");
  const typeField = getFormField("id_event_type");
  const placeField = getFormField("place");
  const dateField = getFormField("date");
  const hourField = getFormField("hour");
  const priceField = getFormField("price");
  const capacityField = getFormField("maximun_capacity");
  const posterField = getFormField("poster_image");

  if (idField) idField.value = String(event.id || "");
  if (nameField) nameField.value = toText(event.name, "");
  if (companyField) companyField.value = String(event.id_company || "");
  if (typeField) typeField.value = String(event.id_event_type || "");
  if (placeField) placeField.value = toText(event.place, "");
  if (dateField) dateField.value = toText(event.date, "");
  if (hourField) hourField.value = shortHour(event.hour);
  if (priceField) priceField.value = String(event.price ?? "");
  if (capacityField) capacityField.value = String(event.maximun_capacity ?? "");
  if (posterField) posterField.value = toText(event.poster_image, "");

  if (formTitle) formTitle.textContent = "Editar evento";
  if (submitBtn) submitBtn.textContent = "Actualizar";
  if (cancelBtn) cancelBtn.hidden = false;

  setStatus("");
}

function mapCompanies(data) {
  return data.map((company) => ({
    id: Number(company.id),
    name: toText(company.name, `Empresa ${company.id}`),
  }));
}

function mapEventTypes(data) {
  return data.map((type) => ({
    id: Number(type.id),
    name: toText(type.nombre || type.name, `Tipo ${type.id}`),
  }));
}

async function loadLookups() {
  const selectedCompanyFilter = String(filterCompanySelect?.value || "");
  const selectedTypeFilter = String(filterTypeSelect?.value || "");

  const [companiesResponse, eventTypesResponse] = await Promise.all([
    fetchJson("/api/companies", { method: "GET" }),
    fetchJson("/api/event-types", { method: "GET" }),
  ]);

  const companiesData = Array.isArray(companiesResponse?.data)
    ? companiesResponse.data
    : [];

  const eventTypesData = Array.isArray(eventTypesResponse?.data)
    ? eventTypesResponse.data
    : [];

  companies = mapCompanies(companiesData);
  eventTypes = mapEventTypes(eventTypesData);

  populateSelect(companySelect, companies, "Selecciona empresa");
  populateSelect(eventTypeSelect, eventTypes, "Selecciona tipo");
  populateSelect(
    filterCompanySelect,
    companies,
    "Todas las empresas",
    selectedCompanyFilter,
  );
  populateSelect(filterTypeSelect, eventTypes, "Todos los tipos", selectedTypeFilter);
}

async function loadEvents() {
  setHint("Cargando eventos...");

  try {
    const response = await fetchJson("/api/events", { method: "GET" });
    events = Array.isArray(response?.data) ? response.data : [];
    refreshView();
  } catch (error) {
    events = [];
    renderEvents([]);
    updateStats([]);

    setHint("No se pudieron cargar los eventos.");
    setStatus(error.message || "Error cargando eventos", "error");
  }
}

async function saveEvent(event) {
  event.preventDefault();
  if (!form) return;

  const data = new FormData(form);
  const payload = {
    id: Number(data.get("id") || 0),
    name: String(data.get("name") || "").trim(),
    id_company: Number(data.get("id_company") || 0),
    id_event_type: Number(data.get("id_event_type") || 0),
    place: String(data.get("place") || "").trim(),
    date: String(data.get("date") || "").trim(),
    hour: String(data.get("hour") || "").trim(),
    price: Number(data.get("price") || 0),
    maximun_capacity: Number(data.get("maximun_capacity") || 0),
    poster_image: String(data.get("poster_image") || "").trim(),
  };

  const isEditing = payload.id > 0;

  try {
    setStatus(isEditing ? "Actualizando evento..." : "Registrando evento...");

    await fetchJson("/api/events", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    resetForm(false);
    setStatus(
      isEditing
        ? "Evento actualizado correctamente."
        : "Evento registrado correctamente.",
      "success",
    );

    await loadEvents();
  } catch (error) {
    setStatus(error.message || "No se pudo guardar el evento.", "error");
  }
}

async function deleteEvent(id) {
  try {
    setStatus("Eliminando evento...");

    await fetchJson(`/api/events?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    resetForm(false);
    setStatus("Evento eliminado correctamente.", "success");

    await loadEvents();
  } catch (error) {
    setStatus(error.message || "No se pudo eliminar el evento.", "error");
  }
}

async function confirmDeleteEvent() {
  const id = Number(deletingEventId || 0);
  closeDeleteModal();

  if (!id) return;
  await deleteEvent(id);
}

function onListClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const button = target.closest("button[data-action][data-id]");
  if (!button) return;

  const eventId = Number(button.dataset.id || 0);
  if (!eventId) return;

  const selectedEvent = events.find((item) => Number(item.id) === eventId);
  if (!selectedEvent) return;

  if (button.dataset.action === "edit") {
    loadEventInForm(selectedEvent);
    return;
  }

  if (button.dataset.action === "delete") {
    openDeleteModal(selectedEvent);
  }
}

function clearFilters() {
  if (filterQueryInput) filterQueryInput.value = "";
  if (filterCompanySelect) filterCompanySelect.value = "";
  if (filterTypeSelect) filterTypeSelect.value = "";
  if (filterFromInput) filterFromInput.value = "";
  if (filterToInput) filterToInput.value = "";

  refreshView();
}

function prepareNewEventForm() {
  resetForm();

  const firstField = getFormField("name");
  if (firstField) {
    firstField.focus();
  }
}

if (form) form.addEventListener("submit", saveEvent);
if (listBox) listBox.addEventListener("click", onListClick);
if (cancelBtn) cancelBtn.addEventListener("click", () => resetForm());
if (resetBtn) resetBtn.addEventListener("click", () => resetForm());
if (reloadBtn) reloadBtn.addEventListener("click", loadEvents);
if (newBtn) newBtn.addEventListener("click", prepareNewEventForm);

if (filterQueryInput) filterQueryInput.addEventListener("input", refreshView);
if (filterCompanySelect) filterCompanySelect.addEventListener("change", refreshView);
if (filterTypeSelect) filterTypeSelect.addEventListener("change", refreshView);
if (filterFromInput) filterFromInput.addEventListener("change", refreshView);
if (filterToInput) filterToInput.addEventListener("change", refreshView);
if (filterResetBtn) filterResetBtn.addEventListener("click", clearFilters);

if (deleteConfirmBtn) deleteConfirmBtn.addEventListener("click", confirmDeleteEvent);
if (deleteCancelButtons.length) {
  deleteCancelButtons.forEach((button) => {
    button.addEventListener("click", closeDeleteModal);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && deleteModal && !deleteModal.hidden) {
    closeDeleteModal();
  }
});

async function init() {
  try {
    await loadLookups();
    await loadEvents();
  } catch (error) {
    setStatus(error.message || "No se pudo inicializar la pantalla.", "error");
    setHint("No se pudo cargar la configuración inicial.");
  }
}

init();
