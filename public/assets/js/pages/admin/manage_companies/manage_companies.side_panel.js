import { isCompanyComplete } from "./manage_companies.filters.js";
/**
 * 
 * @param {HTMLDivElement} sideContainer 
 * Div en el que se renderizará el contenido del panel lateral derecho
 * @param {{ 
 *    id: number, 
 *    name: string,
 *    city: string, 
 *    creation_year: string,
 *    email_person_in_charge: string,
 *    number_person_in_charge: string,
 *    event_type: {id: number, nombre: string}[] 
 *   }} company 
 * Datos de la empresa que se renderizarán 
 * @param {null|string} defaultContent 
 * @returns {void}
 */
export function renderSidePanel(sideContainer, company, defaultContent = null) {
  if (!sideContainer) return;

  sideContainer.innerHTML = "";

  if (!company) {
    if (defaultContent !== null) {
      sideContainer.innerHTML = defaultContent;
      return;
    }

    sideContainer.innerHTML = "";

    const empty = document.createElement("div");
    empty.className = "mc-side-empty";

    const icon = document.createElement("div");
    icon.className = "mc-side-empty__icon";
    icon.textContent = "👈";

    const title = document.createElement("div");
    title.className = "mc-side-empty__title";
    title.textContent = "Sin empresa seleccionada";

    const text = document.createElement("div");
    text.className = "mc-side-empty__text";
    text.textContent =
      "Selecciona una fila de la tabla para ver el detalle aquí.";

    const tips = document.createElement("div");
    tips.className = "mc-side-empty__tips";

    const tip1 = document.createElement("div");
    tip1.className = "mc-side-tip";
    tip1.innerHTML = "<strong>Tip:</strong> puedes usar Enter en una fila.";

    const tip2 = document.createElement("div");
    tip2.className = "mc-side-tip";
    tip2.innerHTML =
      "<strong>Tip:</strong> usa los filtros para encontrar más rápido.";

    tips.append(tip1, tip2);

    empty.append(icon, title, text, tips);
    sideContainer.append(empty);
    return;
  }

  const complete = isCompanyComplete(company);
  const statusClass = complete ? "mc-pill--ok" : "mc-pill--warn";
  const statusText = complete ? "Completa" : "Incompleta";

  const mcSide = document.createElement("div");
  mcSide.className = "mc-side";

  const sectionCompany = document.createElement("section");
  sectionCompany.className = "mc-side__company";

  const left = document.createElement("div");
  left.className = "mc-side__company-left";

  const name = document.createElement("div");
  name.className = "mc-side__name";
  name.textContent = company.name ?? "—";

  const meta = document.createElement("div");
  meta.className = "mc-side__meta";
  meta.textContent = `ID: ${company.id ?? "—"}`;

  left.append(name, meta);

  const pill = document.createElement("span");
  pill.className = `mc-pill ${statusClass}`;
  pill.textContent = statusText;

  sectionCompany.append(left, pill);

  const grid = document.createElement("section");
  grid.className = "mc-side__grid";

  grid.append(
    createKv("Ciudad", company.city ?? "—"),
    createKv("Email", company.email_person_in_charge ?? "—", true),
    createKv("Teléfono", company.number_person_in_charge ?? "—"),
    createKv("Estado", statusText),
  );

  const divider = document.createElement("div");
  divider.className = "mc-side__divider";

  const actions = createSideActionsSection(company.id);

  const note = document.createElement("div");
  note.className = "mc-side__note";
  note.innerHTML =
    "<strong>Tip:</strong> puedes editar o eliminar esta empresa desde los botones de abajo.";

  mcSide.append(sectionCompany, grid, divider, actions, note);
  sideContainer.append(mcSide);
}

function createKv(labelText, valueText, mono = false) {
  const article = document.createElement("article");
  article.className = "mc-kv";

  const label = document.createElement("div");
  label.className = "mc-kv__label";
  label.textContent = labelText;

  const value = document.createElement("div");
  value.className = mono ? "mc-kv__value mc-kv__mono" : "mc-kv__value";
  value.textContent = valueText;

  article.append(label, value);
  return article;
}

function createSideActionsSection(companyId) {
  const section = document.createElement("section");
  section.className = "mc-side__actions";

  const editBtn = document.createElement("button");
  editBtn.className = "mc-btn mc-btn--primary mc-btn--wide";
  editBtn.type = "button";
  editBtn.dataset.sideAction = "edit";
  editBtn.dataset.id = String(companyId);
  editBtn.textContent = "Editar";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "mc-btn mc-btn--danger mc-btn--wide";
  deleteBtn.type = "button";
  deleteBtn.dataset.sideAction = "delete";
  deleteBtn.dataset.id = String(companyId);
  deleteBtn.textContent = "Eliminar";

  section.append(editBtn, deleteBtn);
  return section;
}
