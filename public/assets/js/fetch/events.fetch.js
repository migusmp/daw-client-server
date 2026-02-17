export async function allTypeOfEvents() {
    try {

    const res = await fetch(`/api/event-types`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("HTTP error:", res.status, payload);
      return null;
    }

    if (payload?.status !== "success") {
      console.error("API error:", payload);
      return null;
    }

    return payload?.data ?? null;
  } catch (e) {
    console.error("Network/JS error:", e);
    return null;
  }
}