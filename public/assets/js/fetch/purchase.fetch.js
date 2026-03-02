async function requestPurchase(route, options = {}) {
  try {
    const res = await fetch(route, {
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers ?? {}),
      },
      ...options,
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok || payload?.status !== "success") {
      return {
        ok: false,
        status: res.status,
        message: payload?.message || `Request failed (${res.status})`,
        data: payload?.data ?? null,
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

export async function createTicketOrder(idEvento) {
  return requestPurchase("/api/tickets", {
    method: "POST",
    body: JSON.stringify({
      id_evento: Number(idEvento),
    }),
  });
}

export async function payTicketOrder(idTicket, totalPagado) {
  return requestPurchase("/api/tickets/pay", {
    method: "PUT",
    body: JSON.stringify({
      id_ticket: Number(idTicket),
      total_pagado: Number(totalPagado),
    }),
  });
}

export async function cancelTicketOrder(idTicket) {
  return requestPurchase("/api/tickets/cancel", {
    method: "PUT",
    body: JSON.stringify({
      id_ticket: Number(idTicket),
    }),
  });
}

export async function createEntradaForTicket({ idEvento, idTicket, precioPagado }) {
  return requestPurchase("/api/entradas", {
    method: "POST",
    body: JSON.stringify({
      id_evento: Number(idEvento),
      id_ticket: Number(idTicket),
      precio_pagado: Number(precioPagado),
    }),
  });
}
