export const safe = (value) =>
  value === null || value === undefined || value === "" ? "—" : String(value);

export const safeAttr = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;");

export async function fetchEventTypes() {
  try {
    const res = await fetch("/api/event-types", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const payload = await res.json().catch(() => null);

    if (!res.ok || payload?.status !== "success" || !Array.isArray(payload?.data)) {
      return [];
    }

    return payload.data;
  } catch (error) {
    console.error("Error loading event types:", error);
    return [];
  }
}
