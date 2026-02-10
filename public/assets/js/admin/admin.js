import { escapeText } from "../utils/utils.js";
import { loadCompanies } from "./companies/companies.js";

const selectors = {
  greeting: "[data-admin-greeting]",
  exportBtn: "[data-admin-export]",
  total: "[data-admin-total]",
  admins: "[data-admin-admins]",
  recent: "[data-admin-recent]",
  hint: "[data-admin-hint]",
  list: "[data-admin-list]",
};

const $ = (sel) => document.querySelector(sel);

const createRow = (user) => {
  const row = document.createElement("div");
  row.className = "admin-list__row";

  const info = document.createElement("div");
  info.className = "admin-list__info";

  const name = document.createElement("span");
  name.className = "admin-list__name";
  name.textContent = escapeText(user.name || "Sin nombre");

  const email = document.createElement("span");
  email.className = "admin-list__email";
  email.textContent = escapeText(user.email || "Sin email");

  info.append(name, email);

  const role = document.createElement("span");
  const roleValue = escapeText(user.role || "USER");
  role.className = `admin-list__role${roleValue === "ADMIN" ? " is-admin" : ""}`;
  role.textContent = roleValue;

  row.append(info, role);
  return row;
};

const renderUsers = (users = []) => {
  const list = $(selectors.list);
  if (!list) return;

  list.innerHTML = "";

  if (!users.length) {
    const empty = document.createElement("p");
    empty.className = "admin-empty";
    empty.textContent = "Todavía no hay usuarios registrados.";
    list.append(empty);
    return;
  }

  users.slice(0, 6).forEach((user) => {
    list.append(createRow(user));
  });
};

const updateStats = (users = []) => {
  const total = $(selectors.total);
  const admins = $(selectors.admins);
  const recent = $(selectors.recent);
  const hint = $(selectors.hint);

  const totalCount = users.length;
  const adminsCount = users.filter((u) => u.role === "ADMIN").length;
  const recentCount = Math.min(users.length, 6);

  if (total) total.textContent = `${totalCount}`;
  if (admins) admins.textContent = `${adminsCount}`;
  if (recent) recent.textContent = `${recentCount}`;
  if (hint) hint.textContent = `Mostrando los últimos ${recentCount} registros`;
};

const updateGreeting = async () => {
  const greeting = $(selectors.greeting);
  if (!greeting) return;

  try {
    const res = await fetch("/api/me", { method: "GET" });
    if (!res.ok) return;

    const payload = await res.json();
    const name = payload?.data?.name;
    if (name) {
      greeting.textContent = `Hola, ${name}`;
    }
  } catch {
    // Keep fallback greeting
  }
};

const loadUsers = async () => {
  const list = $(selectors.list);
  try {
    const res = await fetch("/api/admin/users", { method: "GET" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const payload = await res.json();
    const users = Array.isArray(payload?.data) ? payload.data : [];

    updateStats(users);
    renderUsers(users);
    return;
  } catch (err) {
    if (list) {
      list.innerHTML = "";
      const empty = document.createElement("p");
      empty.className = "admin-empty";
      empty.textContent = "No se pudieron cargar los usuarios.";
      list.append(empty);
    }
  }
};

const handleExport = () => {
  const btn = $(selectors.exportBtn);
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/admin/users", { method: "GET" });
      if (!res.ok) throw new Error("Export failed");
      const payload = await res.json();
      const data = JSON.stringify(payload?.data ?? [], null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "usuarios.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // noop
    }
  });
};

updateGreeting();
loadUsers();
loadCompanies(".companies_list");
handleExport();
