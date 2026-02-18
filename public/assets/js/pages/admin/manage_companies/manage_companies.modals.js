import {
  createCompany,
  deleteCompanyById,
  updateCompany,
} from "../../../fetch/companies.fetch.js";

const MODAL_ROOT_SELECTOR = '[data-mc-modal-root="true"]';

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function setStatus(statusEl, message = "", type = "") {
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.classList.remove("is-success", "is-error");

  if (type === "success") statusEl.classList.add("is-success");
  if (type === "error") statusEl.classList.add("is-error");
}

function removeExistingModal(app) {
  const existing = app.querySelector(MODAL_ROOT_SELECTOR);
  if (existing) existing.remove();
  document.body.classList.remove("is-mc-modal-open");
}

function normalizeCompanyPayload(form, companyId = null) {
  const formData = new FormData(form);

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    creation_year: Number(formData.get("creation_year") ?? 0),
    contact_email: String(formData.get("contact_email") ?? "").trim(),
    contact_number: String(formData.get("contact_number") ?? "").trim(),
  };

  if (companyId != null) {
    payload.id = Number(companyId);
  }

  return payload;
}

function validateCompanyPayload(payload) {
  if (!payload.name) return "El nombre de la empresa es obligatorio.";
  if (!payload.city) return "La ciudad es obligatoria.";
  if (!Number.isInteger(payload.creation_year) || payload.creation_year < 1800 || payload.creation_year > 2100) {
    return "El año de creación debe estar entre 1800 y 2100.";
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contact_email);
  if (!emailOk) return "El correo de contacto no es válido.";

  if (!payload.contact_number) return "El teléfono de contacto es obligatorio.";

  return "";
}

function mountModal(app, modalNode) {
  removeExistingModal(app);
  app.appendChild(modalNode);
  document.body.classList.add("is-mc-modal-open");
}

function wireCloseHandlers({ modal, closeModal, focusEl = null }) {
  const closeEls = modal.querySelectorAll("[data-modal-close]");
  closeEls.forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  const escListener = (event) => {
    if (event.key === "Escape") closeModal();
  };
  document.addEventListener("keydown", escListener);

  if (focusEl) {
    setTimeout(() => {
      focusEl.focus();
      focusEl.select?.();
    }, 0);
  }

  return () => {
    document.removeEventListener("keydown", escListener);
  };
}

function createCompanyFormModal({ app, mode, company = null, onSuccess }) {
  const isCreate = mode === "create";
  const title = isCreate ? "Nueva empresa" : "Editar empresa";
  const subtitle = isCreate
    ? "Registra una nueva empresa en el sistema municipal."
    : `Actualiza los datos de ${company?.name ?? "la empresa seleccionada"}.`;
  const submitLabel = isCreate ? "Crear empresa" : "Guardar cambios";

  const wrap = document.createElement("section");
  wrap.className = "mc-modal";
  wrap.dataset.mcModalRoot = "true";

  wrap.innerHTML = `
    <div class="mc-modal__backdrop" data-modal-close></div>

    <div class="mc-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="mc-modal-title">
      <header class="mc-modal__header">
        <div>
          <p class="mc-modal__kicker">Gestión de empresas</p>
          <h3 class="mc-modal__title" id="mc-modal-title">${safeText(title)}</h3>
          <p class="mc-modal__subtitle">${safeText(subtitle)}</p>
        </div>

        <button type="button" class="mc-modal__icon-btn" data-modal-close aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
          </svg>
        </button>
      </header>

      <form class="mc-modal__form" autocomplete="off" novalidate>
        ${
          !isCreate
            ? `<p class="mc-modal__id">ID empresa: <strong>${safeText(company?.id ?? "—")}</strong></p>`
            : ""
        }

        <div class="mc-modal__grid">
          <label class="mc-modal__field">
            <span>Nombre</span>
            <input type="text" name="name" value="${safeText(company?.name ?? "")}" required />
          </label>

          <label class="mc-modal__field">
            <span>Ciudad</span>
            <input type="text" name="city" value="${safeText(company?.city ?? "")}" required />
          </label>

          <label class="mc-modal__field">
            <span>Año de creación</span>
            <input type="number" min="1800" max="2100" name="creation_year" value="${safeText(company?.creation_year ?? "")}" required />
          </label>

          <label class="mc-modal__field">
            <span>Email de contacto</span>
            <input type="email" name="contact_email" value="${safeText(company?.email_person_in_charge ?? "")}" required />
          </label>

          <label class="mc-modal__field mc-modal__field--full">
            <span>Teléfono de contacto</span>
            <input type="text" name="contact_number" value="${safeText(company?.number_person_in_charge ?? "")}" required />
          </label>
        </div>

        <p class="mc-modal__status" data-status aria-live="polite"></p>

        <footer class="mc-modal__footer">
          <button class="mc-btn" type="button" data-modal-close>Cancelar</button>
          <button class="mc-btn mc-btn--primary" type="submit" data-submit>${submitLabel}</button>
        </footer>
      </form>
    </div>
  `;

  const form = wrap.querySelector("form");
  const statusEl = wrap.querySelector("[data-status]");
  const submitBtn = wrap.querySelector("[data-submit]");
  const nameInput = form.querySelector('input[name="name"]');

  let cleanupEsc = null;
  let isSubmitting = false;

  const closeModal = (force = false) => {
    if (isSubmitting && !force) return;
    cleanupEsc?.();
    wrap.remove();
    document.body.classList.remove("is-mc-modal-open");
  };

  cleanupEsc = wireCloseHandlers({ modal: wrap, closeModal, focusEl: nameInput });

  form.addEventListener("input", () => setStatus(statusEl, "", ""));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const payload = normalizeCompanyPayload(form, isCreate ? null : company?.id);
    const validationError = validateCompanyPayload(payload);

    if (validationError) {
      setStatus(statusEl, validationError, "error");
      return;
    }

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = isCreate ? "Creando..." : "Guardando...";

    const result = isCreate
      ? await createCompany(payload)
      : await updateCompany(payload);

    if (!result.ok) {
      setStatus(statusEl, result.message || "No se pudo guardar la empresa.", "error");
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
      return;
    }

    setStatus(
      statusEl,
      isCreate ? "Empresa creada correctamente." : "Empresa actualizada correctamente.",
      "success",
    );

    try {
      await onSuccess?.();
      isSubmitting = false;
      closeModal(true);
    } catch (error) {
      setStatus(statusEl, "La empresa se guardó, pero no se pudo refrescar la tabla.", "error");
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });

  mountModal(app, wrap);
}

export function openCreateCompanyModal({ app, onSuccess } = {}) {
  if (!app) return;
  createCompanyFormModal({
    app,
    mode: "create",
    onSuccess,
  });
}

export function openEditCompanyModal({ app, company, onSuccess } = {}) {
  if (!app || !company?.id) return;
  createCompanyFormModal({
    app,
    mode: "edit",
    company,
    onSuccess,
  });
}

export function openDeleteCompanyModal({ app, company, onSuccess } = {}) {
  if (!app || !company?.id) return;

  const wrap = document.createElement("section");
  wrap.className = "mc-modal";
  wrap.dataset.mcModalRoot = "true";

  wrap.innerHTML = `
    <div class="mc-modal__backdrop" data-modal-close></div>

    <div class="mc-modal__dialog mc-modal__dialog--danger" role="dialog" aria-modal="true" aria-labelledby="mc-delete-title">
      <header class="mc-modal__header mc-modal__header--danger">
        <div>
          <p class="mc-modal__kicker">Operación crítica</p>
          <h3 class="mc-modal__title" id="mc-delete-title">Eliminar empresa</h3>
          <p class="mc-modal__subtitle">Esta acción no se puede deshacer.</p>
        </div>

        <button type="button" class="mc-modal__icon-btn" data-modal-close aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
          </svg>
        </button>
      </header>

      <form class="mc-modal__form" autocomplete="off">
        <p class="mc-modal__warning">
          Vas a eliminar <strong>${safeText(company?.name ?? "esta empresa")}</strong> (ID ${safeText(company?.id)}).
          Si la empresa tiene eventos relacionados, el sistema bloqueará el borrado.
        </p>

        <p class="mc-modal__status" data-status aria-live="polite"></p>

        <footer class="mc-modal__footer">
          <button class="mc-btn" type="button" data-modal-close>Cancelar</button>
          <button class="mc-btn mc-btn--danger" type="submit" data-submit>Eliminar empresa</button>
        </footer>
      </form>
    </div>
  `;

  const form = wrap.querySelector("form");
  const statusEl = wrap.querySelector("[data-status]");
  const submitBtn = wrap.querySelector("[data-submit]");

  let cleanupEsc = null;
  let isSubmitting = false;

  const closeModal = (force = false) => {
    if (isSubmitting && !force) return;
    cleanupEsc?.();
    wrap.remove();
    document.body.classList.remove("is-mc-modal-open");
  };

  cleanupEsc = wireCloseHandlers({
    modal: wrap,
    closeModal,
    focusEl: submitBtn,
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Eliminando...";

    const result = await deleteCompanyById(company.id);

    if (!result.ok) {
      setStatus(statusEl, result.message || "No se pudo eliminar la empresa.", "error");
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Eliminar empresa";
      return;
    }

    try {
      await onSuccess?.();
      isSubmitting = false;
      closeModal(true);
    } catch (error) {
      setStatus(statusEl, "La empresa se eliminó, pero no se pudo refrescar la tabla.", "error");
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Eliminar empresa";
    }
  });

  mountModal(app, wrap);
}

// Compatibilidad con el nombre anterior.
export function renderCreateNewCompanyModal(app, options = {}) {
  openCreateCompanyModal({
    app,
    onSuccess: options?.onSuccess,
  });
}
