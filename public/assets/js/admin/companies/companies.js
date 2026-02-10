import { escapeText } from "../../utils/utils.js";
const $ = (sel) => document.querySelector(sel);

export const loadCompanies = async (containerSelector = ".companies_list") => {
  const container = $(containerSelector);
  if (!container) {
    console.warn("No existe el contenedor:", containerSelector);
    return;
  }

  try {
    const res = await fetch("/api/companies", { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const info = await res.json();

    const companies = Array.isArray(info?.data) ? info.data : [];

    renderCompanies(companies, container);
  } catch (e) {
    console.error(e);
    container.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = "No se han podido cargar las empresas correctamente";
    container.append(p);
  }
};

const createRow = (company) => {
  const link = document.createElement("a");
  link.className = "company-presentation";
  link.href = `/admin/company?id=${encodeURIComponent(company.id)}`;

  const companyTitle = document.createElement("h3");
  companyTitle.className = "company-name";
  companyTitle.textContent = escapeText(company.name || "Sin nombre");

  const city = document.createElement("p");
  city.className = "company-ubication";
  city.textContent = escapeText(company.city || "Sin ciudad");

  const creationYear = document.createElement("p");
  creationYear.className = "company-creation-year";
  creationYear.textContent = escapeText(
    company.creation_year || "Sin año de creación",
  );

  link.append(companyTitle, city, creationYear);
  return link;
};

export const renderCompanies = (companies = [], containerEl) => {
  containerEl.innerHTML = "";

  if (!companies.length) {
    const p = document.createElement("p");
    p.textContent = "No hay empresas para mostrar";
    containerEl.append(p);
    return;
  }

  companies.forEach((c) => containerEl.append(createRow(c)));
};
