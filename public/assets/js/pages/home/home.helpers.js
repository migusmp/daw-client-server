export function formatPrice(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";

  return numeric.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });
}

export function formatDate(date, hour) {
  if (!date) return "—";

  const dateObj = new Date(`${date}T${hour || "00:00:00"}`);
  if (Number.isNaN(dateObj.getTime())) {
    return `${date} ${String(hour || "").slice(0, 5)}`.trim();
  }

  return dateObj.toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function buildHomeRoutes(user) {
  if (!user) {
    return [
      { path: "/", aName: "Inicio" },
      { path: "/login", aName: "Login", className: "btn-login" },
      { path: "/register", aName: "Register", className: "btn-register" },
    ];
  }

  if (user.role === "ADMIN") {
    return [
      { path: "/", aName: "Inicio" },
      { path: "/admin", aName: "Administración" },
    ];
  }

  return [{ path: "/", aName: "Inicio" }];
}

export function createInitialFilters() {
  return {
    q: "",
    id_tipo: "",
    id_empresa: "",
    fecha_desde: "",
    fecha_hasta: "",
  };
}

export function createHomeState(user) {
  return {
    user,
    types: [],
    filterCompanies: [],
    menuCompanies: [],
    events: [],
    selectedEvent: null,
    filters: createInitialFilters(),
    companyMenu: {
      id_tipo: "",
      q: "",
    },
  };
}
