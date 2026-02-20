import { normalize } from "../manage_companies/manage_companies.filters.js";

export function eventMatchFilters(e, filters) {
  if (!e) return;
  if (!filters) return;

  const query = normalize(filters.q);
  // TODO
  if (query) {
    const heystack = normalize(
      `${e.name} ${e.company_name} ${e.place} ${e.event_type_name}`,
    );
    if (!heystack.includes(query)) return false;
  }

  if (filters.company !== "all" && e.id_company !== Number(filters.company)) {
    return false;
  }

  if (filters.price !== null) {
    const eventPrice = Number(e.price);
    if (eventPrice === null || eventPrice > filters.price) return false;
  }

  if (filters.event_type !== "all" && e.id_event_type !== filters.event_type) {
    return false;
  }

  return true;
}