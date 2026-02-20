export function fillCompaniesSelect(select, arrCompanies) {
  if (!Array.isArray(arrCompanies)) return;

  arrCompanies.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.name;
    select.append(option);
  });
}

export function fillTypeEventSelect(select, arrEventTypes) {
  if (!Array.isArray(arrEventTypes)) return;

  arrEventTypes.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.nombre.charAt(0).toUpperCase() + c.nombre.slice(1);
    select.append(option);
  });
}