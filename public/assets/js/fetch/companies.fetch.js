async function requestCompanyApi(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
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
        payload,
      };
    }

    return {
      ok: true,
      status: res.status,
      message: payload?.message || "OK",
      payload,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: "No se pudo conectar con el servidor.",
      payload: null,
      error,
    };
  }
}

export async function fetchAllCompanies() {
  const result = await requestCompanyApi("/api/companies", { method: "GET" });

  if (!result.ok) {
    console.error("Error fetching companies:", result.message, result.payload || result.error);
    return [];
  }

  return Array.isArray(result.payload?.data) ? result.payload.data : [];
}

export async function fetchCompanyWithId(id) {
  const params = new URLSearchParams({ id: String(id) });
  const result = await requestCompanyApi(`/api/companies/show?${params}`, {
    method: "GET",
  });

  if (!result.ok) {
    console.error("Error fetching company by id:", result.message, result.payload || result.error);
    return null;
  }

  return result.payload?.data ?? null;
}

export async function fetchCompanyEvents(id) {
  const params = new URLSearchParams({ id: String(id) });
  const result = await requestCompanyApi(`/api/company/events?${params}`, {
    method: "GET",
  });

  if (!result.ok) {
    console.error("Error fetching company events:", result.message, result.payload || result.error);
    return null;
  }

  return result.payload?.data ?? null;
}

export async function createCompany(companyData) {
  return requestCompanyApi("/api/companies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: companyData.name,
      city: companyData.city,
      creation_year: companyData.creation_year,
      contact_email: companyData.contact_email,
      contact_number: companyData.contact_number,
    }),
  });
}

export async function updateCompany(companyData) {
  return requestCompanyApi("/api/companies", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: companyData.id,
      name: companyData.name,
      city: companyData.city,
      creation_year: companyData.creation_year,
      contact_email: companyData.contact_email,
      contact_number: companyData.contact_number,
    }),
  });
}

export async function deleteCompanyById(id) {
  const params = new URLSearchParams({ id: String(id) });
  return requestCompanyApi(`/api/companies?${params}`, {
    method: "DELETE",
  });
}

// Compatibilidad con código existente.
export async function registerNewCompany(newCompanyData) {
  const result = await createCompany(newCompanyData);
  return result.ok ? result.payload : null;
}
