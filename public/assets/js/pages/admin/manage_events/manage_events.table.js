export function renderEventsOnTable(tbody, arrEvents) {
  if (!Array.isArray(arrEvents) || !tbody) return;

  tbody.innerHTML = "";
  if (arrEvents.length === 0) {
    const tr = document.createElement("tr");
    const tdStatus = document.createElement("td");
    tdStatus.className = "me-table__status";
    tdStatus.colSpan = 7;
    tdStatus.textContent = "No hay eventos para mostrar con estos filtros.";
    tr.append(tdStatus);
    tbody.append(tr);
    return;
  }

  arrEvents.forEach((e) => {
    const tr = document.createElement("tr");
    tr.className = "me-row";
    tr.setAttribute("data-event-id-row", e.id);

    const tdEventName = document.createElement("td");
    const eventName = document.createElement("p");
    eventName.className = "me-event-name";
    eventName.textContent = e.name ?? "Sin nombre";

    const eventMeta = document.createElement("span");
    eventMeta.className = "me-event-meta";
    eventMeta.textContent = `ID ${e.id}`;
    tdEventName.append(eventName, eventMeta);

    const tdCompanyName = document.createElement("td");
    const companyPill = document.createElement("span");
    companyPill.className = "me-company-pill";
    companyPill.textContent = e.company_name ?? "Sin empresa";
    tdCompanyName.append(companyPill);

    const tdEventPlace = document.createElement("td");
    tdEventPlace.className = "me-cell-place";
    tdEventPlace.textContent = e.place ?? "Sin lugar";

    const tdDate = document.createElement("td");
    const dateChip = document.createElement("span");
    dateChip.className = "me-date-chip";
    dateChip.textContent = e.date ?? "-";
    tdDate.append(dateChip);

    const tdPrice = document.createElement("td");
    const rawPrice = e.price ?? "";
    const priceWithCurrency =
      rawPrice === "" || rawPrice === null
        ? "-"
        : typeof rawPrice === "string" && rawPrice.includes("€")
          ? rawPrice
          : `${rawPrice} €`;
    const priceValue = document.createElement("span");
    priceValue.className = "me-price-value";
    priceValue.textContent = priceWithCurrency;
    tdPrice.append(priceValue);

    const tdTimeStamp = document.createElement("td");
    const timeChip = document.createElement("span");
    timeChip.className = "me-time-chip";
    timeChip.textContent = e.hour ?? "-";
    tdTimeStamp.append(timeChip);

    const tdEventType = document.createElement("td");
    const typePill = document.createElement("span");
    typePill.className = "me-type-pill";
    typePill.textContent = e.event_type_name ?? "Sin tipo";
    tdEventType.append(typePill);

    tr.append(
      tdEventName,
      tdCompanyName,
      tdEventPlace,
      tdDate,
      tdPrice,
      tdTimeStamp,
      tdEventType,
    );
    tbody.append(tr);
  });
}