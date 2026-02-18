import { COMPANY_LINK_SVG } from "./manage_companies.constants.js";
import { isCompanyComplete } from "./manage_companies.filters.js";

export function fillCompaniesTable(tbody, companies) {
  if (!Array.isArray(companies)) return;

  tbody.innerHTML = "";

  companies.forEach((company) => {
    const tr = document.createElement("tr");
    tr.className = "mc-row";
    tr.setAttribute("data-mc-row", "");
    tr.dataset.id = String(company.id);
    tr.tabIndex = 0;
    tr.setAttribute("aria-selected", "false");
    tr.title = "Click para ver detalle";

    const complete = isCompanyComplete(company);

    const dotClass = complete ? "mc-dot--ok" : "mc-dot--warn";
    const pillClass = complete ? "mc-pill--ok" : "mc-pill--warn";
    const pillText = complete ? "Completa" : "Incompleta";

    const tdCompany = document.createElement("td");

    const companyDiv = document.createElement("div");
    companyDiv.className = "mc-company";

    const dot = document.createElement("span");
    dot.className = `mc-dot ${dotClass}`;

    const meta = document.createElement("div");
    meta.className = "mc-company__meta";

    const name = document.createElement("div");
    name.className = "mc-company__name";
    name.textContent = company.name;

    const sub = document.createElement("div");
    sub.className = "mc-company__sub";

    const pill = document.createElement("span");
    pill.className = `mc-pill ${pillClass}`;
    pill.textContent = pillText;

    const muted = document.createElement("span");
    muted.className = "mc-muted";
    muted.textContent = `ID: ${company.id}`;

    sub.append(pill, muted);
    meta.append(name, sub);
    companyDiv.append(dot, meta);
    tdCompany.append(companyDiv);

    const tdCity = document.createElement("td");
    const spanCity = document.createElement("span");
    spanCity.className = "mc-city";
    spanCity.textContent = company.city ?? "—";
    tdCity.append(spanCity);

    const tdContact = document.createElement("td");
    const contact = document.createElement("div");
    contact.className = "mc-contact";

    const email = document.createElement("span");
    email.className = "mc-contact__email";
    email.textContent = company.email_person_in_charge ?? company.email ?? "—";

    const phone = document.createElement("span");
    phone.className = "mc-contact__phone";
    phone.textContent = company.number_person_in_charge || company.phone || "—";

    contact.append(email, phone);
    tdContact.append(contact);

    const tdProfile = document.createElement("td");
    const linkProfile = document.createElement("a");
    linkProfile.href = `/admin/company?id=${company.id}`;
    linkProfile.dataset.link = "";
    linkProfile.innerHTML = COMPANY_LINK_SVG;

    tdProfile.append(linkProfile);

    tr.append(tdCompany, tdCity, tdContact, tdProfile);
    tbody.append(tr);
  });
}

export function setSelectedRow(tbody, id) {
  tbody.querySelectorAll("tr[data-mc-row]").forEach((tr) => {
    const isSelected = Number(tr.dataset.id) === id;
    tr.classList.toggle("is-selected", isSelected);
    tr.setAttribute("aria-selected", isSelected ? "true" : "false");
  });
}
