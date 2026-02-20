import { fetchJson, isEmptyOrNull } from "../../../utils.js";
import { normalize } from "../manage_companies/manage_companies.filters.js";
import { fillEventTypesSelect } from "../manage_companies/manage_companies.selects.js";
import { fillCompaniesSelect } from "./manage_events.select.js";

export function newEventModal(
  pageToAppendModal,
  allEventTypes = [],
  allCompanies = [],
) {
  if (allEventTypes.length === 0) return;
  if (allCompanies.length === 0) return;

  const form = document.createElement("form");
  form.className = "modal-form";
  const wrap = document.createElement("div");
  wrap.className = "modal-wrap";
  wrap.dataset.modal = "new-event";

  form.innerHTML = `
        <h1>Crea un nuevo evento</h1>
        <small>Formulario para crear un nuevo evento</small>
        <label for="event-name">Nombre del evento:</label>
        <input type="text" id="event-name" name="eventName" placeholder="Festival de verano 2026" required>

        <label for="place">Lugar</label>
        <input type="text" id="place" name="place" placeholder="Recinto ferial" required>

        <label for="capacity">Aforo</label>
        <input type="number" id="capacity" name="capacity" placeholder="800" required>

        <label for="hour">Hora</label>
        <input type="text" id="hour" name="hour" placeholder="21:00" required>

        <label for="date">Fecha</label>
        <input type="text" id="date" name="date" placeholder="10-7-2026" required>

        <label for="event-type">Tipo de evento</label>
        <select name="eventType" data-event-type>
        </select>

        <label for="company">Empresa organizadora</label>
        <select name="company" data-company-select>
        </select>

        <label for="price">Precio por entrada</label>
        <input type="number" id="price" name="price" placeholder="10" required>

        <button type="submit" data-create-event-btn disabled>Crear evento</button>
        <button data-create-event-cancel-btn>Cancelar</button>
    `;

  const eventTypeSelect = form.querySelector("[data-event-type]");
  const companySelect = form.querySelector("[data-company-select]");

  fillEventTypesSelect(allEventTypes, eventTypeSelect);
  fillCompaniesSelect(companySelect, allCompanies);

  const createEventBtn = form.querySelector("[data-create-event-btn]");

  form.addEventListener("input", (e) => {
    const {
      eventName,
      place,
      capacity,
      hour,
      date,
      eventType,
      company,
      price,
    } = getValuesFromCreateNewEventForm(form);

    if (
      !verifyCreateEventFields({
        eventName,
        place,
        capacity,
        hour,
        date,
        eventType,
        company,
        price,
      })
    ) {
      createEventBtn.disabled = true;
    } else {
        createEventBtn.disabled = false;
    }
  })

  createEventBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    const {
      eventName,
      place,
      capacity,
      hour,
      date,
      eventType,
      company,
      price,
    } = getValuesFromCreateNewEventForm(form);

    if (
      !verifyCreateEventFields({
        eventName,
        place,
        capacity,
        hour,
        date,
        eventType,
        company,
        price,
      })
    ) {
      console.error("Some errors on fields");
      return;
    }

    const responseData = await fetchJson("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    console.log(eventName);
  });

  form
    .querySelector("[data-create-event-cancel-btn]")
    .addEventListener("click", (e) => {
      e.preventDefault();
      destroyModal(pageToAppendModal);
    });

  wrap.append(form);
  pageToAppendModal.append(wrap);
}

export function destroyModal(pageToRemoveModal) {
  pageToRemoveModal.querySelector("[data-modal='new-event']")?.remove();
}

function getValuesFromCreateNewEventForm(form) {
  const eventName = normalize(form.eventName.value);
  const place = normalize(form.place.value);
  const capacity = normalize(form.capacity.value);
  const hour = normalize(form.hour.value);
  const date = normalize(form.date.value);
  const eventType = normalize(form.eventType.value);
  const company = normalize(form.company.value);
  const price = normalize(form.price.value);

  return { eventName, place, capacity, hour, date, eventType, company, price };
}

function verifyCreateEventFields({
  eventName,
  place,
  capacity,
  hour,
  date,
  eventType,
  company,
  price,
}) {
  if (isEmptyOrNull(eventName)) return false;
  if (isEmptyOrNull(place)) return false;
  if (isEmptyOrNull(capacity)) return false;
  if (isEmptyOrNull(hour)) return false;
  if (isEmptyOrNull(date)) return false;
  if (isEmptyOrNull(eventType)) return false;
  if (isEmptyOrNull(company)) return false;
  if (isEmptyOrNull(price)) return false;

  return true;
}
