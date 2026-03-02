async function requestCatalog(route) {
  try {
    const res = await fetch(route, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok || payload?.status !== "success") {
      return {
        ok: false,
        status: res.status,
        message: payload?.message || `Request failed (${res.status})`,
        data: null,
      };
    }

    return {
      ok: true,
      status: res.status,
      message: payload?.message || "OK",
      data: payload?.data ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: "No se pudo conectar con el servidor.",
      data: null,
      error,
    };
  }
}

export async function fetchPublicEventTypes() {
  const result = await requestCatalog("/api/public/event-types");
  if (!result.ok) {
    console.error("Error fetching public event types:", result.message);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchPublicCompanies({ idTipo = null, q = null } = {}) {
  const params = new URLSearchParams();
  if (idTipo) params.set("id_tipo", String(idTipo));
  if (q && String(q).trim() !== "") params.set("q", String(q).trim());

  const route = params.toString()
    ? `/api/public/companies?${params.toString()}`
    : "/api/public/companies";

  const result = await requestCatalog(route);
  if (!result.ok) {
    console.error("Error fetching public companies:", result.message);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchPublicEvents({
  q = null,
  idTipo = null,
  idEmpresa = null,
  fechaDesde = null,
  fechaHasta = null,
} = {}) {
  const params = new URLSearchParams();
  if (q && String(q).trim() !== "") params.set("q", String(q).trim());
  if (idTipo) params.set("id_tipo", String(idTipo));
  if (idEmpresa) params.set("id_empresa", String(idEmpresa));
  if (fechaDesde) params.set("fecha_desde", String(fechaDesde));
  if (fechaHasta) params.set("fecha_hasta", String(fechaHasta));

  const route = params.toString()
    ? `/api/public/events?${params.toString()}`
    : "/api/public/events";

  const result = await requestCatalog(route);
  if (!result.ok) {
    console.error("Error fetching public events:", result.message);
    return [];
  }

  return Array.isArray(result.data) ? result.data : [];
}
