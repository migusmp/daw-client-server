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
