const selectors = {
  form: "[data-event-crud-form]",
  list: "[data-events-list]",
  hint: "[data-events-hint]",
  status: "[data-event-form-status]",
  title: "[data-event-form-title]",
  submitBtn: "[data-event-submit-btn]",
  cancelBtn: "[data-event-form-cancel]",
  resetBtn: "[data-event-form-reset]",
  reloadBtn: "[data-events-reload]",
  newBtn: "[data-event-new]",
  companySelect: "[data-event-company-select]",
  eventTypeSelect: "[data-event-type-select]",
  total: "[data-events-total]",
  avgPrice: "[data-events-price-average]",
  totalCapacity: "[data-events-capacity-total]",
};

const state = {
  events: [],
  companies: [],
  eventTypes: [],
  editingId: 0,
};

const $ = (sel) => document.querySelector(sel);

const form = $(selectors.form);
const listBox = $(selectors.list);
const hint = $(selectors.hint);
const statusBox = $(selectors.status);
const formTitle = $(selectors.title);
const submitBtn = $(selectors.submitBtn);
const cancelBtn = $(selectors.cancelBtn);
const resetBtn = $(selectors.resetBtn);
const reloadBtn = $(selectors.reloadBtn);
const newBtn = $(selectors.newBtn);
const companySelect = $(selectors.companySelect);
const eventTypeSelect = $(selectors.eventTypeSelect);
const totalEl = $(selectors.total);
const avgPriceEl = $(selectors.avgPrice);
const totalCapacityEl = $(selectors.totalCapacity);

const setStatus = (message = "", type = "") => {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.className = "me-form__status";
  if (type) statusBox.classList.add(`is-${type}`);
};

const setHint = (message) => {
  if (!hint) return;
  hint.textContent = message;
};

const text = (value, fallback = "—") => {
  if (value === null || value === undefined) return fallback;
  const current = String(value).trim();
  return current === "" ? fallback : current;
};

const normalizeHour = (value) => {
  const hour = text(value, "");
  if (!hour) return "";
  return hour.length >= 5 ? hour.slice(0, 5) : hour;
};

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  let payload = null;

  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message = payload?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return payload ?? {};
};

const populateSelect = (selectEl, items, placeholder, selected = "") => {
  if (!selectEl) return;

  selectEl.innerHTML = "";

  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = placeholder;
  selectEl.append(firstOption);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = String(item.id);
    option.textContent = String(item.name || item.nombre || item.label || `ID ${item.id}`);
    if (String(option.value) === String(selected)) {
      option.selected = true;
    }
    selectEl.append(option);
  });
};

const updateStats = (events) => {
  const total = events.length;
  const totalCapacity = events.reduce((acc, event) => acc + (Number(event.maximun_capacity) || 0), 0);
  const totalPrice = events.reduce((acc, event) => acc + (Number(event.price) || 0), 0);
  const avgPrice = total > 0 ? (totalPrice / total).toFixed(2) : "0.00";

  if (totalEl) totalEl.textContent = String(total);
  if (avgPriceEl) avgPriceEl.textContent = `${avgPrice} €`;
  if (totalCapacityEl) totalCapacityEl.textContent = String(totalCapacity);
};

const resolveStatusClass = (event) => {
  const capacity = Number(event.maximun_capacity) || 0;
  const price = Number(event.price) || 0;

  if (capacity >= 5000) {
    return { className: "me-event-card__status me-event-card__status--full", label: "Aforo alto" };
  }
  if (price <= 0) {
    return { className: "me-event-card__status me-event-card__status--draft", label: "Gratis" };
  }
  return { className: "me-event-card__status me-event-card__status--live", label: "Activo" };
};

const buildEventCard = (event) => {
  const card = document.createElement("article");
  card.className = "me-event-card";

  const date = document.createElement("p");
  date.className = "me-event-card__date";
  const hour = normalizeHour(event.hour);
  date.textContent = `${text(event.date, "Sin fecha")}${hour ? ` · ${hour}` : ""}`;

  const title = document.createElement("h3");
  title.className = "me-event-card__title";
  title.textContent = text(event.name, "Evento sin nombre");

  const meta = document.createElement("p");
  meta.className = "me-event-card__meta";
  meta.textContent = `${text(event.company_name, `Empresa ${text(event.id_company)}`)} · ${text(event.event_type_name, `Tipo ${text(event.id_event_type)}`)} · ${text(event.place, "Sin lugar")}`;

  const priceInfo = document.createElement("p");
  priceInfo.className = "me-event-card__meta";
  priceInfo.textContent = `Precio: ${Number(event.price || 0).toFixed(2)} € · Aforo: ${text(event.maximun_capacity, "0")}`;

  const badgeData = resolveStatusClass(event);
  const status = document.createElement("p");
  status.className = badgeData.className;
  status.textContent = badgeData.label;

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
  card.append(date, title, meta, priceInfo, status, actions);
  return card;
};

const renderEvents = (events) => {
  if (!listBox) return;
  listBox.innerHTML = "";

  if (!events.length) {
    const empty = document.createElement("p");
    empty.className = "me-cards__empty";
    empty.textContent = "No hay eventos registrados todavía.";
    listBox.append(empty);
    return;
  }

  events.forEach((event) => listBox.append(buildEventCard(event)));
};

const resetForm = () => {
  if (!form) return;
  form.reset();

  const idInput = form.elements.namedItem("id");
  if (idInput && !(typeof RadioNodeList !== "undefined" && idInput instanceof RadioNodeList)) {
    idInput.value = "";
  }

  state.editingId = 0;
  if (formTitle) formTitle.textContent = "Registrar evento";
  if (submitBtn) submitBtn.textContent = "Guardar";
  if (cancelBtn) cancelBtn.hidden = true;
  setStatus("");
};

const fillFormForEdit = (event) => {
  if (!form) return;

  state.editingId = Number(event.id);
  if (formTitle) formTitle.textContent = "Editar evento";
  if (submitBtn) submitBtn.textContent = "Actualizar";
  if (cancelBtn) cancelBtn.hidden = false;
  setStatus("");

  const entries = {
    id: String(event.id),
    name: text(event.name, ""),
    id_company: String(event.id_company || ""),
    id_event_type: String(event.id_event_type || ""),
    place: text(event.place, ""),
    date: text(event.date, ""),
    hour: normalizeHour(event.hour),
    price: String(event.price ?? ""),
    maximun_capacity: String(event.maximun_capacity ?? ""),
    poster_image: text(event.poster_image, ""),
  };

  Object.entries(entries).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (!field) return;
    if (typeof RadioNodeList !== "undefined" && field instanceof RadioNodeList) return;
    field.value = value;
  });
};

const loadLookups = async () => {
  const [companiesPayload, eventTypesPayload] = await Promise.all([
    fetchJson("/api/companies", { method: "GET" }),
    fetchJson("/api/event-types", { method: "GET" }),
  ]);

  const companies = Array.isArray(companiesPayload?.data) ? companiesPayload.data : [];
  const eventTypesRaw = Array.isArray(eventTypesPayload?.data) ? eventTypesPayload.data : [];

  state.companies = companies.map((company) => ({
    id: Number(company.id),
    name: text(company.name, `Empresa ${company.id}`),
  }));

  state.eventTypes = eventTypesRaw.map((type) => ({
    id: Number(type.id),
    name: text(type.nombre, `Tipo ${type.id}`),
  }));

  populateSelect(companySelect, state.companies, "Selecciona empresa");
  populateSelect(eventTypeSelect, state.eventTypes, "Selecciona tipo");
};

const loadEvents = async () => {
  setHint("Cargando eventos...");
  try {
    const payload = await fetchJson("/api/events", { method: "GET" });
    const events = Array.isArray(payload?.data) ? payload.data : [];
    state.events = events;
    renderEvents(events);
    updateStats(events);
    setHint(`Mostrando ${events.length} eventos`);
  } catch (error) {
    state.events = [];
    renderEvents([]);
    updateStats([]);
    setHint("No se pudieron cargar los eventos.");
    setStatus(error.message || "Error cargando eventos", "error");
  }
};

const submitForm = async (e) => {
  e.preventDefault();
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

    setStatus(isEditing ? "Evento actualizado correctamente." : "Evento registrado correctamente.", "success");
    resetForm();
    await loadEvents();
  } catch (error) {
    setStatus(error.message || "No se pudo guardar el evento.", "error");
  }
};

const deleteEvent = async (event) => {
  try {
    setStatus("Eliminando evento...");
    await fetchJson(`/api/events?id=${encodeURIComponent(event.id)}`, {
      method: "DELETE",
    });
    setStatus("Evento eliminado correctamente.", "success");
    resetForm();
    await loadEvents();
  } catch (error) {
    setStatus(error.message || "No se pudo eliminar el evento.", "error");
  }
};

const onListClick = async (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (!target) return;

  const btn = target.closest("button[data-action][data-id]");
  if (!btn) return;

  const id = Number(btn.dataset.id || 0);
  if (!id) return;

  const event = state.events.find((item) => Number(item.id) === id);
  if (!event) return;

  const action = btn.dataset.action;
  if (action === "edit") {
    fillFormForEdit(event);
    return;
  }

  if (action === "delete") {
    const accepted = window.confirm(`¿Eliminar el evento "${text(event.name, "Sin nombre")}"?`);
    if (!accepted) return;
    await deleteEvent(event);
  }
};

if (form) form.addEventListener("submit", submitForm);
if (listBox) listBox.addEventListener("click", onListClick);
if (cancelBtn) cancelBtn.addEventListener("click", resetForm);
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    resetForm();
  });
}
if (reloadBtn) reloadBtn.addEventListener("click", loadEvents);
if (newBtn) {
  newBtn.addEventListener("click", () => {
    resetForm();
    const firstField = form?.elements?.namedItem("name");
    if (firstField && !(typeof RadioNodeList !== "undefined" && firstField instanceof RadioNodeList)) {
      firstField.focus();
    }
  });
}

const init = async () => {
  try {
    await loadLookups();
    await loadEvents();
  } catch (error) {
    setStatus(error.message || "No se pudo inicializar la pantalla.", "error");
    setHint("No se pudo cargar la configuración inicial.");
  }
};

init();
