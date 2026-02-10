import { $, getCompanyIdFromUrl } from "../../utils/utils.js";

const companyName = $("[data-company-name]");
const companyCity = $("[data-company-city]");
const companyCreationYear = $("[data-company-year]");
const companyEmail = $("[data-email-person]");
const companyNumber = $("[data-number-person]");

const loadingCompanyNote = $("[data-company-status]");
const updateForm = $("[data-company-form]");

const eventsBox = $("[data-company-events]");

const safeText = (v, fallback = "—") =>
  v === null || v === undefined || String(v).trim() === "" ? fallback : String(v);

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

  const btnDelete = document.createElement("button");
  btnDelete.type = "button";
  btnDelete.className = "event-btn event-btn--red";
  btnDelete.textContent = "Eliminar";
  btnDelete.dataset.action = "delete";
  btnDelete.dataset.id = String(ev?.id ?? "");

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