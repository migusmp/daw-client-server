export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  return String(value).trim().length === 0;
};

export const clearMessages = (container) => {
  if (!container) return;
  container.innerHTML = "";
};

export const renderMessage = (container, message, type = "error") => {
  if (!container) return;
  clearMessages(container);
  const p = document.createElement("p");
  p.className = `alert alert--${type}`;
  p.textContent = String(message ?? "");
  container.appendChild(p);
};

export const createMessageErrorToDiv = (container, message, type = "error") => {
  renderMessage(container, message, type);
};

export const redirectTo = (path, delayMs = 0) => {
  if (!path) return;
  const doRedirect = () => window.location.assign(path);
  if (delayMs > 0) {
    setTimeout(doRedirect, delayMs);
  } else {
    doRedirect();
  }
};

export const escapeText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

export const $ = (sel) => document.querySelector(sel);
export const getById = (sel) => document.getElementById(sel);

export const getCompanyIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return id ? Number(id) : null;
};
