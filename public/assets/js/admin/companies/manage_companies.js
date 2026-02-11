import { $, fetchJson, normalizeText, toText } from "../../utils/utils.js";

const form = $("[data-company-crud-form]");
const rowsBox = $("[data-companies-rows]");
const hint = $("[data-companies-hint]");
const statusBox = $("[data-company-form-status]");
const formTitle = $("[data-company-form-title]");
const submitBtn = $("[data-company-submit-btn]");
const cancelBtn = $("[data-company-form-cancel]");
const resetBtn = $("[data-company-form-reset]");
const reloadBtn = $("[data-companies-reload]");
const totalEl = $("[data-company-total]");
const completeEl = $("[data-company-complete]");
const filterQueryInput = $("[data-company-filter-query]");
const filterCitySelect = $("[data-company-filter-city]");
const filterContactSelect = $("[data-company-filter-contact]");
const filterResetBtn = $("[data-company-filters-reset]");
const deleteModal = $("[data-company-delete-modal]");
const deleteMessage = $("[data-company-delete-message]");
const deleteConfirmBtn = $("[data-company-delete-confirm]");
const deleteCancelButtons = document.querySelectorAll("[data-company-delete-cancel]");

let companies = [];
let deletingCompanyId = 0;

function setStatus(message = "", type = "") {
  if (!statusBox) return;

  statusBox.textContent = message;
  statusBox.className = "mc-form__status";

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

function hasCompleteContact(company) {
  const hasEmail = normalizeText(company.email_person_in_charge) !== "";
  const hasPhone = normalizeText(company.number_person_in_charge) !== "";
  return hasEmail && hasPhone;
}

function updateStats(list) {
  const total = list.length;
  const complete = list.filter((company) => hasCompleteContact(company)).length;

  if (totalEl) totalEl.textContent = String(total);
  if (completeEl) completeEl.textContent = String(complete);
}

function fillCityFilter() {
  if (!filterCitySelect) return;

  const currentValue = normalizeText(filterCitySelect.value);
  const citiesMap = new Map();

  companies.forEach((company) => {
    const cityLabel = toText(company.city, "").trim();
    if (!cityLabel) return;

    const cityKey = normalizeText(cityLabel);
    if (!citiesMap.has(cityKey)) {
      citiesMap.set(cityKey, cityLabel);
    }
  });

  const sortedCities = [...citiesMap.entries()].sort((a, b) =>
    a[1].localeCompare(b[1], "es", { sensitivity: "base" }),
  );

  filterCitySelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "Todas";
  filterCitySelect.append(allOption);

  sortedCities.forEach(([key, label]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = label;
    filterCitySelect.append(option);
  });

  if (currentValue && citiesMap.has(currentValue)) {
    filterCitySelect.value = currentValue;
  }
}

function readFilters() {
  const contactValue = String(filterContactSelect?.value || "all");

  return {
    query: normalizeText(filterQueryInput?.value || ""),
    city: normalizeText(filterCitySelect?.value || ""),
    contact: ["all", "complete", "incomplete"].includes(contactValue)
      ? contactValue
      : "all",
  };
}

function companyMatchesFilters(company, filters) {
  if (filters.city && normalizeText(company.city) !== filters.city) {
    return false;
  }

  if (filters.contact === "complete" && !hasCompleteContact(company)) {
    return false;
  }

  if (filters.contact === "incomplete" && hasCompleteContact(company)) {
    return false;
  }

  if (!filters.query) {
    return true;
  }

  const searchable = [
    company.name,
    company.city,
    company.creation_year,
    company.email_person_in_charge,
    company.number_person_in_charge,
  ]
    .map((value) => normalizeText(value))
    .join(" ");

  return searchable.includes(filters.query);
}

function getFilteredCompanies() {
  const filters = readFilters();
  return companies.filter((company) => companyMatchesFilters(company, filters));
}

function buildCompanyRow(company) {
  const row = document.createElement("div");
  row.className = "mc-table__row";
  row.setAttribute("role", "row");

  const name = document.createElement("span");
  name.textContent = toText(company.name, "Sin nombre");

  const city = document.createElement("span");
  city.textContent = toText(company.city, "Sin ciudad");

  const contact = document.createElement("span");
  contact.textContent = `${toText(company.email_person_in_charge)} · ${toText(company.number_person_in_charge)}`;

  const actions = document.createElement("span");
  actions.className = "mc-table__actions-cell";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "mc-row-btn";
  editBtn.dataset.action = "edit";
  editBtn.dataset.id = String(company.id);
  editBtn.textContent = "Editar";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "mc-row-btn mc-row-btn--danger";
  deleteBtn.dataset.action = "delete";
  deleteBtn.dataset.id = String(company.id);
  deleteBtn.textContent = "Eliminar";

  actions.append(editBtn, deleteBtn);
  row.append(name, city, contact, actions);

  return row;
}

function renderCompanies(list) {
  if (!rowsBox) return;

  rowsBox.innerHTML = "";

  if (!list.length) {
    const row = document.createElement("div");
    row.className = "mc-table__row";
    row.setAttribute("role", "row");

    const text = document.createElement("span");
    text.className = "mc-table__empty";
    text.style.gridColumn = "1 / -1";
    text.textContent = "No hay empresas registradas todavía.";

    row.append(text);
    rowsBox.append(row);
    return;
  }

  list.forEach((company) => {
    rowsBox.append(buildCompanyRow(company));
  });
}

function refreshView() {
  const filteredCompanies = getFilteredCompanies();

  renderCompanies(filteredCompanies);
  updateStats(filteredCompanies);

  if (!companies.length) {
    setHint("No hay empresas registradas.");
    return;
  }

  if (filteredCompanies.length === companies.length) {
    setHint(`Mostrando ${filteredCompanies.length} empresas`);
    return;
  }

  setHint(`Mostrando ${filteredCompanies.length} de ${companies.length} empresas`);
}

function setDeleteModalOpen(open) {
  if (!deleteModal) return;

  deleteModal.hidden = !open;
  deleteModal.classList.toggle("is-open", open);
  document.body.classList.toggle("admin-modal-open", open);
}

function openDeleteModal(company) {
  deletingCompanyId = Number(company.id || 0);

  if (deleteMessage) {
    deleteMessage.textContent = `Vas a eliminar la empresa "${toText(company.name, "Sin nombre")}". Esta acción no se puede deshacer.`;
  }

  setDeleteModalOpen(true);
}

function closeDeleteModal() {
  deletingCompanyId = 0;
  setDeleteModalOpen(false);
}

function resetForm(clearStatus = true) {
  if (!form) return;

  form.reset();

  const idField = getFormField("id");
  if (idField) {
    idField.value = "";
  }

  if (formTitle) formTitle.textContent = "Registrar empresa";
  if (submitBtn) submitBtn.textContent = "Guardar";
  if (cancelBtn) cancelBtn.hidden = true;

  if (clearStatus) {
    setStatus("");
  }
}

function loadCompanyInForm(company) {
  const idField = getFormField("id");
  const nameField = getFormField("name");
  const cityField = getFormField("city");
  const yearField = getFormField("creation_year");
  const emailField = getFormField("contact_email");
  const phoneField = getFormField("contact_number");

  if (idField) idField.value = String(company.id || "");
  if (nameField) nameField.value = toText(company.name, "");
  if (cityField) cityField.value = toText(company.city, "");
  if (yearField) yearField.value = toText(company.creation_year, "");
  if (emailField) emailField.value = toText(company.email_person_in_charge, "");
  if (phoneField) phoneField.value = toText(company.number_person_in_charge, "");

  if (formTitle) formTitle.textContent = "Editar empresa";
  if (submitBtn) submitBtn.textContent = "Actualizar";
  if (cancelBtn) cancelBtn.hidden = false;
  setStatus("");
}

async function loadCompanies() {
  setHint("Cargando empresas...");

  try {
    const response = await fetchJson("/api/companies", { method: "GET" });
    companies = Array.isArray(response?.data) ? response.data : [];

    fillCityFilter();
    refreshView();
  } catch (error) {
    companies = [];
    fillCityFilter();
    renderCompanies([]);
    updateStats([]);

    setHint("No se pudieron cargar las empresas.");
    setStatus(error.message || "Error cargando empresas", "error");
  }
}

async function saveCompany(event) {
  event.preventDefault();
  if (!form) return;

  const data = new FormData(form);
  const payload = {
    id: Number(data.get("id") || 0),
    name: String(data.get("name") || "").trim(),
    city: String(data.get("city") || "").trim(),
    creation_year: Number(data.get("creation_year") || 0),
    contact_email: String(data.get("contact_email") || "").trim(),
    contact_number: String(data.get("contact_number") || "").trim(),
  };

  const isEditing = payload.id > 0;

  try {
    setStatus(isEditing ? "Actualizando empresa..." : "Registrando empresa...");

    await fetchJson("/api/companies", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    resetForm(false);
    setStatus(
      isEditing
        ? "Empresa actualizada correctamente."
        : "Empresa registrada correctamente.",
      "success",
    );

    await loadCompanies();
  } catch (error) {
    setStatus(error.message || "No se pudo guardar la empresa.", "error");
  }
}

async function deleteCompany(id) {
  try {
    setStatus("Eliminando empresa...");

    await fetchJson(`/api/companies?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    resetForm(false);
    setStatus("Empresa eliminada correctamente.", "success");

    await loadCompanies();
  } catch (error) {
    setStatus(error.message || "No se pudo eliminar la empresa.", "error");
  }
}

async function confirmDeleteCompany() {
  const id = Number(deletingCompanyId || 0);
  closeDeleteModal();

  if (!id) return;
  await deleteCompany(id);
}

function onRowsClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const button = target.closest("button[data-action][data-id]");
  if (!button) return;

  const companyId = Number(button.dataset.id || 0);
  if (!companyId) return;

  const company = companies.find((item) => Number(item.id) === companyId);
  if (!company) return;

  if (button.dataset.action === "edit") {
    loadCompanyInForm(company);
    return;
  }

  if (button.dataset.action === "delete") {
    openDeleteModal(company);
  }
}

function clearFilters() {
  if (filterQueryInput) filterQueryInput.value = "";
  if (filterCitySelect) filterCitySelect.value = "";
  if (filterContactSelect) filterContactSelect.value = "all";
  refreshView();
}

if (form) form.addEventListener("submit", saveCompany);
if (rowsBox) rowsBox.addEventListener("click", onRowsClick);
if (cancelBtn) cancelBtn.addEventListener("click", () => resetForm());
if (resetBtn) resetBtn.addEventListener("click", () => resetForm());
if (reloadBtn) reloadBtn.addEventListener("click", loadCompanies);

if (filterQueryInput) filterQueryInput.addEventListener("input", refreshView);
if (filterCitySelect) filterCitySelect.addEventListener("change", refreshView);
if (filterContactSelect) filterContactSelect.addEventListener("change", refreshView);
if (filterResetBtn) filterResetBtn.addEventListener("click", clearFilters);

if (deleteConfirmBtn) deleteConfirmBtn.addEventListener("click", confirmDeleteCompany);
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

loadCompanies();
