export function setupCompanyActions({
  companyData,
  companyEventsList,
  canDeleteCompany,
}) {
  if (canDeleteCompany) {
    document.getElementById("btn-delete")?.addEventListener("click", () => {
      console.log("DELETE company", companyData.id);
    });
  }

  const eventsById = new Map((companyEventsList ?? []).map((event) => [String(event.id), event]));
  document.querySelectorAll("[data-event-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const eventId = String(button.getAttribute("data-event-delete") ?? "");
      const selectedEvent = eventsById.get(eventId);
      console.log("DELETE event", selectedEvent?.id ?? eventId);
    });
  });
}
