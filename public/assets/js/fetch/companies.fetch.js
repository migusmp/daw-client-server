export async function fetchAllCompanies() {
    try {
        const res = await fetch("/api/companies", { method: "GET" });
        const payload = await res.json();
        
        if (!res.ok || payload?.status !== "success") {
            console.error(e);
            return;
        }

        return Array.isArray(payload?.data) ? payload?.data : [];
    } catch (e) {
        console.error(e);
    }
}

export async function fetchCompanyWithId(id) {
  try {
    const params = new URLSearchParams({ id: String(id) });

    const res = await fetch(`/api/companies/show?${params}`, {
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

export async function fetchCompanyEvents(id) {
  try {
    const params = new URLSearchParams({ id: String(id) });

    const res = await fetch(`/api/company/events?${params}`, {
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