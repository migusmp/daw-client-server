function setStatus(statusEl, message = "", type = "") {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove("is-error", "is-success");
  if (type === "error") statusEl.classList.add("is-error");
  if (type === "success") statusEl.classList.add("is-success");
}

export function setupCompanyEditModal({ companyData, onUpdated }) {
  const btnEdit = document.getElementById("btn-edit");
  const modal = document.getElementById("company-edit-modal");
  const form = document.getElementById("company-edit-form");
  const submitButton = document.getElementById("company-edit-submit");
  const status = document.getElementById("company-edit-status");
  const closeEls = modal?.querySelectorAll("[data-company-modal-close]") ?? [];

  if (!btnEdit || !modal || !form || !submitButton || !status) return;

  const trackedFields = ["name", "city", "creation_year", "contact_email", "contact_number"];
  let escListener = null;
  let initialSnapshot = null;

  const getFormSnapshot = () => {
    const formData = new FormData(form);
    return {
      name: String(formData.get("name") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      creation_year: String(formData.get("creation_year") ?? "").trim(),
      contact_email: String(formData.get("contact_email") ?? "").trim(),
      contact_number: String(formData.get("contact_number") ?? "").trim(),
    };
  };

  const hasFormChanges = () => {
    if (!initialSnapshot) return false;
    const currentSnapshot = getFormSnapshot();
    return trackedFields.some((field) => currentSnapshot[field] !== initialSnapshot[field]);
  };

  const syncSubmitState = () => {
    submitButton.disabled = !hasFormChanges();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-company-modal-open");
    setStatus(status, "", "");

    if (escListener) {
      document.removeEventListener("keydown", escListener);
      escListener = null;
    }
  };

  const openModal = () => {
    form.reset();
    initialSnapshot = getFormSnapshot();
    syncSubmitState();

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-company-modal-open");
    setStatus(status, "", "");

    form.querySelector('input[name="name"]')?.focus();

    escListener = (event) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", escListener);
  };

  btnEdit.addEventListener("click", openModal);
  closeEls.forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  form.addEventListener("input", syncSubmitState);
  form.addEventListener("change", syncSubmitState);
  initialSnapshot = getFormSnapshot();
  syncSubmitState();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(status, "", "");

    if (!hasFormChanges()) {
      syncSubmitState();
      return;
    }

    const formData = new FormData(form);
    const payload = {
      id: Number(companyData.id),
      name: String(formData.get("name") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      creation_year: Number(formData.get("creation_year") ?? 0),
      contact_email: String(formData.get("contact_email") ?? "").trim(),
      contact_number: String(formData.get("contact_number") ?? "").trim(),
    };

    submitButton.disabled = true;

    try {
      const res = await fetch("/api/companies", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const response = await res.json().catch(() => null);
      if (!res.ok || response?.status !== "success") {
        throw new Error(response?.message || "No se pudo actualizar la empresa.");
      }

      closeModal();
      await onUpdated?.();
    } catch (error) {
      setStatus(status, error?.message || "Ocurrió un error al actualizar.", "error");
    } finally {
      syncSubmitState();
    }
  });
}

export function setupEventEditModal({
  companyData,
  companyEventsList,
  safe,
  onUpdated,
}) {
  const eventEditButtons = document.querySelectorAll("[data-event-edit]");
  const modal = document.getElementById("event-edit-modal");
  const form = document.getElementById("event-edit-form");
  const submitButton = document.getElementById("event-edit-submit");
  const status = document.getElementById("event-edit-status");
  const subtitle = document.getElementById("event-edit-subtitle");
  const closeEls = modal?.querySelectorAll("[data-event-modal-close]") ?? [];
  const eventsById = new Map((companyEventsList ?? []).map((event) => [String(event.id), event]));

  if (!modal || !form || !submitButton || !status) return;

  let escListener = null;

  const setFieldValue = (name, value) => {
    const field = form.elements.namedItem(name);
    if (!field) return;
    field.value = value;
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-event-modal-open");
    setStatus(status, "", "");

    if (escListener) {
      document.removeEventListener("keydown", escListener);
      escListener = null;
    }
  };

  const openModal = (eventData) => {
    if (!eventData) return;

    setFieldValue("id", String(eventData.id ?? ""));
    setFieldValue("name", String(eventData.name ?? ""));
    setFieldValue("place", String(eventData.place ?? ""));
    setFieldValue("date", String(eventData.date ?? ""));
    setFieldValue("hour", String(eventData.hour ?? "").slice(0, 5));
    setFieldValue("price", String(eventData.price ?? 0));
    setFieldValue("maximun_capacity", String(eventData.maximun_capacity ?? 1));
    setFieldValue("poster_image", String(eventData.poster_image ?? ""));

    const eventTypeField = form.elements.namedItem("id_event_type");
    if (eventTypeField) {
      const typeValue = String(eventData.id_event_type ?? "");
      const hasType = Array.from(eventTypeField.options).some((option) => option.value === typeValue);
      if (typeValue && !hasType) {
        const option = document.createElement("option");
        option.value = typeValue;
        option.textContent = `Tipo ${typeValue}`;
        eventTypeField.append(option);
      }
      eventTypeField.value = typeValue;
    }

    if (subtitle) {
      subtitle.textContent = `ID ${safe(eventData.id)} · ${safe(eventData.name)}`;
    }

    setStatus(status, "", "");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-event-modal-open");
    form.querySelector('input[name="name"]')?.focus();

    escListener = (event) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", escListener);
  };

  eventEditButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const eventId = button.getAttribute("data-event-edit");
      const eventData = eventsById.get(String(eventId));
      openModal(eventData);
    });
  });

  closeEls.forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  form.addEventListener("submit", async (submitEvent) => {
    submitEvent.preventDefault();
    setStatus(status, "", "");

    const formData = new FormData(form);
    const payload = {
      id: Number(formData.get("id") ?? 0),
      name: String(formData.get("name") ?? "").trim(),
      id_event_type: Number(formData.get("id_event_type") ?? 0),
      id_company: Number(companyData.id),
      place: String(formData.get("place") ?? "").trim(),
      date: String(formData.get("date") ?? "").trim(),
      hour: String(formData.get("hour") ?? "").trim(),
      price: Number(formData.get("price") ?? 0),
      maximun_capacity: Number(formData.get("maximun_capacity") ?? 0),
      poster_image: String(formData.get("poster_image") ?? "").trim(),
    };

    if (payload.id_event_type <= 0) {
      setStatus(status, "Selecciona un tipo de evento válido.", "error");
      return;
    }

    submitButton.disabled = true;

    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const response = await res.json().catch(() => null);
      if (!res.ok || response?.status !== "success") {
        throw new Error(response?.message || "No se pudo actualizar el evento.");
      }

      closeModal();
      await onUpdated?.();
    } catch (error) {
      setStatus(status, error?.message || "Ocurrió un error al actualizar el evento.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}
