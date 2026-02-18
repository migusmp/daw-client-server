import {
  fetchCompanyEvents,
  fetchCompanyWithId,
} from "../../fetch/companies.fetch.js";
import { appState } from "../../state.js";
import { redirectTo, renderHeaderLinks } from "../../utils.js";
import { fetchEventTypes, safe } from "./company/company.helpers.js";
import {
  renderCompanyLoadingHtml,
  renderCompanyNotFoundHtml,
  renderCompanyPageHtml,
} from "./company/company.templates.js";
import {
  setupCompanyDeleteModal,
  setupCompanyEditModal,
  setupEventDeleteModal,
  setupEventEditModal,
} from "./company/company.modals.js";

export async function renderAdminCompanyPage({ app, headerNav }) {
  document.body.classList.remove(
    "is-company-modal-open",
    "is-company-delete-modal-open",
    "is-event-modal-open",
    "is-event-delete-modal-open",
  );

  const { user } = appState.getState();
  if (user?.role !== "ADMIN" || user === null) {
    return redirectTo("/");
  }

  renderHeaderLinks(headerNav, [
    { path: "/", aName: "Inicio" },
    { path: "/admin", aName: "Administración" },
  ]);

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return redirectTo("/admin");

  app.innerHTML = renderCompanyLoadingHtml();

  const companyData = await fetchCompanyWithId(id);
  if (!companyData) {
    app.innerHTML = renderCompanyNotFoundHtml({ id });
    return;
  }

  const [companyEvents, eventTypes] = await Promise.all([
    fetchCompanyEvents(id),
    fetchEventTypes(),
  ]);

  const companyEventsList = Array.isArray(companyEvents) ? companyEvents : [];
  const canDeleteCompany = companyEventsList.length === 0;

  app.innerHTML = renderCompanyPageHtml({
    companyData,
    companyEventsList,
    eventTypes,
    canDeleteCompany,
  });

  const backLink = document.getElementById("back-link");
  backLink?.addEventListener("click", (event) => {
    event.preventDefault();
    window.history.back();
    //redirectTo("/admin");
  });

  setupCompanyEditModal({
    companyData,
    onUpdated: () => renderAdminCompanyPage({ app, headerNav }),
  });

  setupCompanyDeleteModal({
    companyData,
    canDeleteCompany,
    onDeleted: () => redirectTo("/admin/manage-companies"),
  });

  setupEventEditModal({
    companyData,
    companyEventsList,
    safe,
    onUpdated: () => renderAdminCompanyPage({ app, headerNav }),
  });

  setupEventDeleteModal({
    companyEventsList,
    onUpdated: () => renderAdminCompanyPage({ app, headerNav }),
  });
}
