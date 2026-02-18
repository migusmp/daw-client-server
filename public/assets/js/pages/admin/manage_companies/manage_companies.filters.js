export function companyMatchesFilters(company, filters) {
  const query = normalize(filters.q);
  if (query) {
    const haystack = normalize(
      `${company.name} ${company.city} ${company.email_person_in_charge} ${company.number_person_in_charge}`,
    );

    if (!haystack.includes(query)) return false;
  }

  if (filters.city !== "all") {
    if (normalize(company.city) !== normalize(filters.city)) return false;
  }

  if (filters.eventType !== "all") {
    if (!companyHasEventType(company, filters.eventType)) return false;
  }

  if (filters.status !== "all") {
    const complete = isCompanyComplete(company);
    if (filters.status === "Completos" && !complete) return false;
    if (filters.status === "Incompletos" && complete) return false;
  }

  return true;
}

export function companyHasEventType(company, eventTypeId) {
  if (eventTypeId === "all") return true;

  const list = company?.event_type;
  if (!Array.isArray(list) || list.length === 0) return false;

  return list.some((type) => String(type.id) === String(eventTypeId));
}

export function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function isCompanyComplete(company) {
  const hasId = company?.id != null;

  const hasName = (company?.name ?? "").trim() !== "";
  const hasCity = (company?.city ?? "").trim() !== "";
  const hasYear = String(company?.creation_year ?? "").trim() !== "";
  const hasEmail = (company?.email_person_in_charge ?? "").trim() !== "";
  const hasPhone = (company?.number_person_in_charge ?? "").trim() !== "";

  return hasId && hasName && hasCity && hasYear && hasEmail && hasPhone;
}
