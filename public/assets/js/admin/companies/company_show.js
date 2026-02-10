import { $, getCompanyIdFromUrl } from "../../utils/utils.js";

const empresaName = $(".company-page__title");

const companyName = $("[data-company-name]");
const companyCity = $("[data-company-city]");
const companyCreationYear = $("[data-company-year]");
const companyEmail = $("[data-email-person]");
const companyNumber = $("[data-number-person]");

const loadingCompanyNote = $("[data-company-status]");
const updateForm = $("[data-company-form]");

const eventsBox = $("[data-company-events]");

// --- Modales (solo UI) ---
const updateModal = $('[data-modal="event-update"]');
const deleteModal = $('[data-modal="event-delete"]');

const updateEventIdEl = $("[data-update-event-id]");
const updateEventNameEl = $("[data-update-event-name]");
const deleteEventIdEl = $("[data-delete-event-id]");
const deleteEventNameEl = $("[data-delete-event-name]");

const updateEventForm = $("[data-event-update-form]");

let lastFocusedEl = null;

const safeText = (v, fallback = "—") =>
  v === null || v === undefined || String(v).trim() === "" ? fallback : String(v);

const normalizeTime = (value) => {
  const t = safeText(value, "");
  if (!t) return "";
  return t.length >= 5 ? t.slice(0, 5) : t;
};

const setText = (el, value, fallback = "—") => {
  if (!el) return;
  el.textContent = safeText(value, fallback);
};

const setFormValue = (form, name, value) => {
  if (!form || !form.elements) return;
  const el = form.elements.namedItem(name);
  if (!el) return;
  if (typeof RadioNodeList !== "undefined" && el instanceof RadioNodeList) return;
  el.value = value;
};

const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-modal-open");

  if (lastFocusedEl && lastFocusedEl.isConnected) {
    lastFocusedEl.focus();
  }
  lastFocusedEl = null;
};

const openModal = (modal) => {
  if (!modal) return;

  // Cierra cualquier otro modal abierto
  document.querySelectorAll("[data-modal].is-open").forEach((m) => closeModal(m));

  lastFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-modal-open");

  const focusTarget =
    modal.querySelector("button[data-modal-close]") ||
    modal.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
  if (focusTarget instanceof HTMLElement) {
    focusTarget.focus();
  }
};

const bindModalHandlers = () => {
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const closeTrigger = target.closest("[data-modal-close]");
    if (!closeTrigger) return;

    const modal = closeTrigger.closest("[data-modal]");
    if (modal) closeModal(modal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const opened = document.querySelector("[data-modal].is-open");
    if (!opened) return;
    e.preventDefault();
    closeModal(opened);
  });
};

const loadCompany = async () => {
  const id = getCompanyIdFromUrl();

  if (!id) {
    if (loadingCompanyNote) loadingCompanyNote.textContent = "ID inválido en la URL.";
    return;
  }

  try {
    if (loadingCompanyNote) loadingCompanyNote.textContent = "Cargando empresa...";

    const res = await fetch(`/api/companies/show?id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = await res.json();
    const c = payload?.data;

    if (!c) {
      if (loadingCompanyNote) loadingCompanyNote.textContent = "Empresa no encontrada.";
      return;
    }

    if (empresaName) empresaName.textContent = safeText("Empresa - " + c.name, "Empresa");

    // --- IZQUIERDA: datos ---
    if (companyName) companyName.textContent = safeText(c.name, "Sin nombre");
    if (companyCity) companyCity.textContent = safeText(c.city, "Sin ciudad");
    if (companyCreationYear)
      companyCreationYear.textContent = safeText(c.creation_year, "Sin año de creación");
    if (companyEmail)
      companyEmail.textContent = safeText(c.email_person_in_charge, "Sin email");
    if (companyNumber)
      companyNumber.textContent = safeText(c.number_person_in_charge, "Sin número");

    // --- DERECHA: form (values + placeholders) ---
    if (updateForm) {
      updateForm.name.value = safeText(c.name, "");
      updateForm.name.placeholder = safeText(c.name, "Nombre de la empresa");

      updateForm.city.value = safeText(c.city, "");
      updateForm.city.placeholder = safeText(c.city, "Ciudad");

      updateForm.creation_year.value = safeText(c.creation_year, "");
      updateForm.creation_year.placeholder = safeText(c.creation_year, "2005");

      updateForm.contact_email.value = safeText(c.email_person_in_charge, "");
      updateForm.contact_email.placeholder = safeText(c.email_person_in_charge, "correo@empresa.com");

      updateForm.contact_number.value = safeText(c.number_person_in_charge, "");
      updateForm.contact_number.placeholder = safeText(c.number_person_in_charge, "+34 600 000 000");
    }

    if (loadingCompanyNote) loadingCompanyNote.textContent = "";
  } catch (e) {
    console.error(e);
    if (loadingCompanyNote) loadingCompanyNote.textContent = "No se pudo cargar la empresa.";
  }
};

const createEventCard = (ev) => {
  const card = document.createElement("div");
  card.className = "event-card";

  const title = document.createElement("h4");
  title.className = "event-title";
  title.textContent = safeText(ev?.name, "Evento sin nombre");

  const meta1 = document.createElement("p");
  meta1.className = "event-meta";
  const date = safeText(ev?.date, "");
  const hour = safeText(ev?.hour, "");
  const place = safeText(ev?.place, "");
  meta1.textContent = `${date}${hour ? " · " + hour : ""}${place ? " · " + place : ""}`;

  const meta2 = document.createElement("p");
  meta2.className = "event-meta";
  const price =
    ev?.price === 0 ? "Gratis" : (ev?.price != null ? `${ev.price}€` : "—");
  const cap =
    ev?.maximun_capacity != null ? `Aforo: ${ev.maximun_capacity}` : "Aforo: —";
  meta2.textContent = `${price} · ${cap}`;

  // (opcional) poster
  if (ev?.poster_image) {
    const img = document.createElement("img");
    img.className = "event-poster";
    img.alt = `Cartel de ${safeText(ev?.name, "evento")}`;
    img.src = `/${ev.poster_image}`; // ajusta si tu ruta base es distinta
    card.append(img);
  }

  // --- Acciones ---
  const actions = document.createElement("div");
  actions.className = "event-actions";

  const btnUpdate = document.createElement("button");
  btnUpdate.type = "button";
  btnUpdate.className = "event-btn event-btn--blue";
  btnUpdate.textContent = "Actualizar";
  btnUpdate.dataset.action = "update";
  btnUpdate.dataset.id = String(ev?.id ?? "");
  btnUpdate.dataset.eventName = safeText(ev?.name, "");
  btnUpdate.dataset.eventPlace = safeText(ev?.place, "");
  btnUpdate.dataset.eventDate = safeText(ev?.date, "");
  btnUpdate.dataset.eventHour = safeText(ev?.hour, "");
  btnUpdate.dataset.eventPrice = ev?.price != null ? String(ev.price) : "";
  btnUpdate.dataset.eventCapacity =
    ev?.maximun_capacity != null ? String(ev.maximun_capacity) : "";
  btnUpdate.dataset.eventPoster = safeText(ev?.poster_image, "");

  const btnDelete = document.createElement("button");
  btnDelete.type = "button";
  btnDelete.className = "event-btn event-btn--red";
  btnDelete.textContent = "Eliminar";
  btnDelete.dataset.action = "delete";
  btnDelete.dataset.id = String(ev?.id ?? "");
  btnDelete.dataset.eventName = safeText(ev?.name, "");
  btnDelete.dataset.eventPlace = safeText(ev?.place, "");
  btnDelete.dataset.eventDate = safeText(ev?.date, "");
  btnDelete.dataset.eventHour = safeText(ev?.hour, "");
  btnDelete.dataset.eventPrice = ev?.price != null ? String(ev.price) : "";
  btnDelete.dataset.eventCapacity =
    ev?.maximun_capacity != null ? String(ev.maximun_capacity) : "";
  btnDelete.dataset.eventPoster = safeText(ev?.poster_image, "");

  actions.append(btnUpdate, btnDelete);

  card.append(title, meta1, meta2, actions);
  return card;
};

export const loadEvents = async () => {
  const id = getCompanyIdFromUrl();
  if (!id) {
    if (eventsBox) eventsBox.textContent = "ID inválido. No se pueden cargar eventos.";
    return;
  }

  if (!eventsBox) return;

  try {
    eventsBox.innerHTML = `<p class="company-note">Cargando eventos...</p>`;

    const res = await fetch(`/api/company/events?id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = await res.json();
    const events = Array.isArray(payload?.data) ? payload.data : [];

    eventsBox.innerHTML = "";

    if (!events.length) {
      eventsBox.innerHTML = `<p class="company-note">Esta empresa todavía no tiene eventos.</p>`;
      return;
    }

    const list = document.createElement("div");
    list.className = "events-grid";

    events.forEach((ev) => list.append(createEventCard(ev)));
    eventsBox.append(list);
  } catch (e) {
    console.error(e);
    eventsBox.innerHTML = `<p class="company-note">No se pudieron cargar los eventos.</p>`;
  }
};

loadEvents();
loadCompany();

bindModalHandlers();

// Abre modales al hacer click en "Actualizar" / "Eliminar"
if (eventsBox) {
  eventsBox.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const btn = target.closest("button[data-action][data-id]");
    if (!btn) return;

    const action = btn.dataset.action;
    if (action !== "update" && action !== "delete") return;

    e.preventDefault();

    const ctx = {
      id: btn.dataset.id ?? "",
      name: btn.dataset.eventName ?? "",
      place: btn.dataset.eventPlace ?? "",
      date: btn.dataset.eventDate ?? "",
      hour: btn.dataset.eventHour ?? "",
      price: btn.dataset.eventPrice ?? "",
      capacity: btn.dataset.eventCapacity ?? "",
      poster: btn.dataset.eventPoster ?? "",
    };

    if (action === "update") {
      setText(updateEventIdEl, ctx.id);
      setText(updateEventNameEl, ctx.name || "Evento");

      setFormValue(updateEventForm, "id", ctx.id);
      setFormValue(updateEventForm, "name", ctx.name);
      setFormValue(updateEventForm, "place", ctx.place);
      setFormValue(updateEventForm, "date", ctx.date);
      setFormValue(updateEventForm, "hour", normalizeTime(ctx.hour));
      setFormValue(updateEventForm, "price", ctx.price);
      setFormValue(updateEventForm, "maximun_capacity", ctx.capacity);
      setFormValue(updateEventForm, "poster_image", ctx.poster);

      openModal(updateModal);
      return;
    }

    setText(deleteEventIdEl, ctx.id);
    setText(deleteEventNameEl, ctx.name || "Evento");
    openModal(deleteModal);
  });
}
