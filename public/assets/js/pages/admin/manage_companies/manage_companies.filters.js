/**
 * Comprueba si una empresa cumple los filtros de búsqueda.
 *
 * - `q`: búsqueda por texto (nombre, ciudad, email y teléfono de contacto).
 * - `city`: filtra por ciudad (o "all" para todas).
 * - `eventType`: filtra por tipo de evento (id o "all").
 * - `status`: filtra por completitud ("Completos", "Incompletos" o "all").
 *
 * @param {{
 *   id?: number|string,
 *   name?: string,
 *   city?: string,
 *   creation_year?: string|number,
 *   email_person_in_charge?: string,
 *   number_person_in_charge?: string,
 *   event_type?: { id: number|string, nombre: string }[]
 * }} company Empresa a evaluar.
 *
 * @param {{
 *   q?: string,
 *   city?: string,
 *   eventType?: string|number,
 *   status?: "all"|"Completos"|"Incompletos"|string
 * }} filters Filtros seleccionados en la UI.
 *
 * @returns {boolean} `true` si la empresa pasa los filtros, `false` si no.
 *
 * @example
 * companyMatchesFilters(company, { q: "ana", city: "Albacete", eventType: "all", status: "all" })
 */
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

/**
 * Indica si una empresa tiene asignado un tipo de evento concreto.
 *
 * @param {{
 *   event_type?: { id: number|string, nombre: string }[]
 * }} company Empresa (debe incluir `event_type`).
 *
 * @param {string|number} eventTypeId Id del tipo de evento a buscar.
 * @returns {boolean} `true` si lo tiene, `false` si no.
 *
 * @example
 * companyHasEventType(company, 3)       // true/false
 * companyHasEventType(company, "all")   // true (si tú lo llamas así desde filtros)
 */
export function companyHasEventType(company, eventTypeId) {
  if (eventTypeId === "all") return true;

  const list = company?.event_type;
  if (!Array.isArray(list) || list.length === 0) return false;

  return list.some((type) => String(type.id) === String(eventTypeId));
}

/**
 * Normaliza un valor convirtiéndolo a string, quitando espacios
 * al inicio y al final y pasándolo a minúsculas.
 *
 * @param {*} value Valor a normalizar (string, number, null, undefined, etc.).
 * @returns {string} Texto normalizado en minúsculas.
 *
 * @example
 * normalize("  Hola ") // "hola"
 * normalize(null)      // ""
 */
export function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/**
 *
 * @param {{
 *    id: number,
 *    name: string,
 *    city: string,
 *    creation_year: string,
 *    email_person_in_charge: string
 *    number_person_in_charge: string,
 *    event_type: { id: number, nombre: string }
 *  }} company
 * Objeto con los datos de la empresa, a través de los cuales verificaremos si está completa o no la información de dicha empresa
 * @returns {boolean}
 */
export function isCompanyComplete(company) {
  const hasId = company?.id != null;

  const hasName = (company?.name ?? "").trim() !== "";
  const hasCity = (company?.city ?? "").trim() !== "";
  const hasYear = String(company?.creation_year ?? "").trim() !== "";
  const hasEmail = (company?.email_person_in_charge ?? "").trim() !== "";
  const hasPhone = (company?.number_person_in_charge ?? "").trim() !== "";

  return hasId && hasName && hasCity && hasYear && hasEmail && hasPhone;
}
