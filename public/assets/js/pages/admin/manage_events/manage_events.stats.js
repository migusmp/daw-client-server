export function updateStats(
  totalEventsStat,
  mediumPrice,
  totalCapacityEvents,
  allEvents,
) {
  if (!Array.isArray(allEvents)) return;
  let totalCapacity = 0;
  let totalPrice = 0;
  const eventsSize = allEvents.length;
  totalEventsStat.textContent = eventsSize;

  allEvents.forEach((e) => {
    totalCapacity += e.maximun_capacity;
    totalPrice += e.price;
  });

  totalCapacityEvents.textContent = totalCapacity;

  mediumPrice.textContent = totalPrice / eventsSize + "€";
}