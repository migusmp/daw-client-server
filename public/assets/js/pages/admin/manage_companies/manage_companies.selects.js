/**
 * Rellena un <select> con los tipos de evento.
 *
 * @param {{ id: number, nombre: string }[]} eventsType
 *   Lista de tipos de evento (cada uno con id y nombre).
 *   Ej: { id: 1, nombre: "Concierto" }
 * @param {HTMLSelectElement} select
 *   Select donde se insertarán los <option>.
 * @returns {void}
 */
export function fillEventTypesSelect(eventsType, select) {
  if (!Array.isArray(eventsType)) return;

  eventsType.forEach((eventType) => {
    const option = document.createElement("option");
    option.value = eventType.id;
    eventType.nombre =
      eventType.nombre.charAt(0).toUpperCase() + eventType.nombre.slice(1);
    option.textContent = eventType.nombre;

    select.append(option);
  });
}
/**
 * 
 * @param {HTMLSelectElement} citySelect 
 * Select donde se insertarán las ciudades del array que se pasa por parámetros
 * @param {{ 
 *    id: number, 
 *    name: string,
 *    city: string, 
 *    creation_year: string,
 *    email_person_in_charge: string,
 *    number_person_in_charge: string,
 *    event_type: {id: number, nombre: string}[] 
 *   }[]} companies 
 * Lista de empresas de las que se extraerán las ciudades que existen
 * @returns {void}
 */
export function fillCitySelect(citySelect, companies) {
  if (!Array.isArray(companies)) return;

  citySelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Todas";
  citySelect.append(allOption);

  const cities = [
    ...new Set(
      companies
        .map((company) => {
          return company.city;
        })
        .join(" ")
        .split(" "),
    ),
  ];

  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelect.append(option);
  });
}
