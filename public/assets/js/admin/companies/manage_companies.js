const selectors = {
  form: "[data-company-crud-form]",
  rows: "[data-companies-rows]",
  hint: "[data-companies-hint]",
  status: "[data-company-form-status]",
  title: "[data-company-form-title]",
  submitBtn: "[data-company-submit-btn]",
  cancelBtn: "[data-company-form-cancel]",
  resetBtn: "[data-company-form-reset]",
  reloadBtn: "[data-companies-reload]",
  newBtn: "[data-company-new]",
  total: "[data-company-total]",
  complete: "[data-company-complete]",
  cities: "[data-company-cities]",
  filterQuery: "[data-company-filter-query]",
  filterCity: "[data-company-filter-city]",
  filterContact: "[data-company-filter-contact]",
  filterReset: "[data-company-filters-reset]",
};

const state = {
  companies: [],
  editingId: 0,
  filters: {
    query: "",
    city: "",
    contact: "all",
  },
};

const $ = (sel) => document.querySelector(sel);

const form = $(selectors.form);
const rowsBox = $(selectors.rows);
const hint = $(selectors.hint);
const statusBox = $(selectors.status);
const formTitle = $(selectors.title);
const submitBtn = $(selectors.submitBtn);
const cancelBtn = $(selectors.cancelBtn);
const resetBtn = $(selectors.resetBtn);
const reloadBtn = $(selectors.reloadBtn);
const newBtn = $(selectors.newBtn);
const totalEl = $(selectors.total);
const completeEl = $(selectors.complete);
const citiesEl = $(selectors.cities);
const filterQueryInput = $(selectors.filterQuery);
const filterCitySelect = $(selectors.filterCity);
const filterContactSelect = $(selectors.filterContact);
const filterResetBtn = $(selectors.filterReset);

const setStatus = (message = "", type = "") => {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.className = "mc-form__status";
  if (type) statusBox.classList.add(`is-${type}`);
};

const setHint = (message) => {
  if (!hint) return;
  hint.textContent = message;
};

const toText = (value, fallback = "—") => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text === "" ? fallback : text;
};

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

const hasCompleteContact = (company) => {
  const hasEmail = normalizeText(company.email_person_in_charge) !== "";
  const hasPhone = normalizeText(company.number_person_in_charge) !== "";
  return hasEmail && hasPhone;
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

const updateStats = (companies) => {
  const total = companies.length;
  const complete = companies.filter((company) => hasCompleteContact(company)).length;

  const uniqueCities = new Set(
    companies
      .map((company) => toText(company.city, ""))
      .filter((city) => city !== "")
      .map((city) => city.toLowerCase()),
  ).size;

  if (totalEl) totalEl.textContent = String(total);
  if (completeEl) completeEl.textContent = String(complete);
  if (citiesEl) citiesEl.textContent = String(uniqueCities);
};

const populateCityFilter = (companies) => {
  if (!filterCitySelect) return;

  const previous = normalizeText(filterCitySelect.value);
  const cityMap = new Map();

  companies.forEach((company) => {
    const rawCity = String(company.city ?? "").trim();
    if (!rawCity) return;
    const key = normalizeText(rawCity);
    if (!cityMap.has(key)) {
      cityMap.set(key, rawCity);
    }
  });

  const orderedCities = [...cityMap.entries()].sort((a, b) =>
    a[1].localeCompare(b[1], "es", { sensitivity: "base" }),
  );

  filterCitySelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "Todas";
  filterCitySelect.append(allOption);

  orderedCities.forEach(([key, label]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = label;
    filterCitySelect.append(option);
  });

  if (previous && cityMap.has(previous)) {
    filterCitySelect.value = previous;
  }
};

const buildRow = (company) => {
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
};

const renderCompanies = (companies) => {
  if (!rowsBox) return;
  rowsBox.innerHTML = "";

  if (!companies.length) {
    const row = document.createElement("div");
    row.className = "mc-table__row";
    row.setAttribute("role", "row");

    const text = document.createElement("span");
    text.className = "mc-table__empty";
    text.textContent = "No hay empresas registradas todavía.";
    text.style.gridColumn = "1 / -1";
    row.append(text);

    rowsBox.append(row);
    return;
  }

  companies.forEach((company) => rowsBox.append(buildRow(company)));
};

const syncFiltersFromInputs = () => {
  state.filters.query = normalizeText(filterQueryInput?.value ?? "");
  state.filters.city = normalizeText(filterCitySelect?.value ?? "");

  const contactFilter = String(filterContactSelect?.value || "all");
  state.filters.contact = ["all", "complete", "incomplete"].includes(contactFilter) ? contactFilter : "all";
};

const getFilteredCompanies = () => {
  const { query, city, contact } = state.filters;

  return state.companies.filter((company) => {
    if (city && normalizeText(company.city) !== city) {
      return false;
    }

    if (contact === "complete" && !hasCompleteContact(company)) {
      return false;
    }

    if (contact === "incomplete" && hasCompleteContact(company)) {
      return false;
    }

    if (!query) {
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

    return searchable.includes(query);
  });
};

const applyCompanyFilters = () => {
  syncFiltersFromInputs();

  const filtered = getFilteredCompanies();
  const total = state.companies.length;

  renderCompanies(filtered);
  updateStats(filtered);

  if (!total) {
    setHint("No hay empresas registradas.");
    return;
  }

  if (filtered.length === total) {
    setHint(`Mostrando ${filtered.length} empresas`);
    return;
  }

  setHint(`Mostrando ${filtered.length} de ${total} empresas`);
};

const resetForm = () => {
  if (!form) return;

  form.reset();
  const idInput = form.elements.namedItem("id");
  if (idInput && !(typeof RadioNodeList !== "undefined" && idInput instanceof RadioNodeList)) {
    idInput.value = "";
  }

  state.editingId = 0;
  if (formTitle) formTitle.textContent = "Registrar empresa";
  if (submitBtn) submitBtn.textContent = "Guardar";
  if (cancelBtn) cancelBtn.hidden = true;
  setStatus("");
};

const fillFormForEdit = (company) => {
  if (!form) return;

  state.editingId = Number(company.id);
  if (formTitle) formTitle.textContent = "Editar empresa";
  if (submitBtn) submitBtn.textContent = "Actualizar";
  if (cancelBtn) cancelBtn.hidden = false;
  setStatus("");

  const entries = {
    id: String(company.id),
    name: toText(company.name, ""),
    city: toText(company.city, ""),
    creation_year: toText(company.creation_year, ""),
    contact_email: toText(company.email_person_in_charge, ""),
    contact_number: toText(company.number_person_in_charge, ""),
  };

  Object.entries(entries).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (!field) return;
    if (typeof RadioNodeList !== "undefined" && field instanceof RadioNodeList) return;
    field.value = value;
  });
};

const loadCompanies = async () => {
  setHint("Cargando empresas...");
  try {
    const payload = await fetchJson("/api/companies", { method: "GET" });
    const companies = Array.isArray(payload?.data) ? payload.data : [];
    state.companies = companies;

    populateCityFilter(companies);
    applyCompanyFilters();
  } catch (error) {
    state.companies = [];
    renderCompanies([]);
    updateStats([]);
    populateCityFilter([]);
    setHint("No se pudieron cargar las empresas.");
    setStatus(error.message || "Error cargando empresas", "error");
  }
};

const submitForm = async (e) => {
  e.preventDefault();
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

    setStatus(isEditing ? "Empresa actualizada correctamente." : "Empresa registrada correctamente.", "success");
    resetForm();
    await loadCompanies();
  } catch (error) {
    setStatus(error.message || "No se pudo guardar la empresa.", "error");
  }
};

const deleteCompany = async (id) => {
  try {
    setStatus("Eliminando empresa...");
    await fetchJson(`/api/companies?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setStatus("Empresa eliminada correctamente.", "success");
    resetForm();
    await loadCompanies();
  } catch (error) {
    setStatus(error.message || "No se pudo eliminar la empresa.", "error");
  }
};

const onTableClick = async (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (!target) return;

  const btn = target.closest("button[data-action][data-id]");
  if (!btn) return;

  const id = Number(btn.dataset.id || 0);
  if (!id) return;

  const company = state.companies.find((item) => Number(item.id) === id);
  if (!company) return;

  const action = btn.dataset.action;
  if (action === "edit") {
    fillFormForEdit(company);
    return;
  }

  if (action === "delete") {
    const accepted = window.confirm(`¿Eliminar la empresa "${toText(company.name, "Sin nombre")}"?`);
    if (!accepted) return;
    await deleteCompany(id);
  }
};

if (form) form.addEventListener("submit", submitForm);
if (rowsBox) rowsBox.addEventListener("click", onTableClick);
if (cancelBtn) cancelBtn.addEventListener("click", resetForm);
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    resetForm();
  });
}
if (reloadBtn) reloadBtn.addEventListener("click", loadCompanies);
if (newBtn) {
  newBtn.addEventListener("click", () => {
    resetForm();
    const firstField = form?.elements?.namedItem("name");
    if (firstField && !(typeof RadioNodeList !== "undefined" && firstField instanceof RadioNodeList)) {
      firstField.focus();
    }
  });
}
if (filterQueryInput) filterQueryInput.addEventListener("input", applyCompanyFilters);
if (filterCitySelect) filterCitySelect.addEventListener("change", applyCompanyFilters);
if (filterContactSelect) filterContactSelect.addEventListener("change", applyCompanyFilters);
if (filterResetBtn) {
  filterResetBtn.addEventListener("click", () => {
    if (filterQueryInput) filterQueryInput.value = "";
    if (filterCitySelect) filterCitySelect.value = "";
    if (filterContactSelect) filterContactSelect.value = "all";
    applyCompanyFilters();
  });
}

loadCompanies();
