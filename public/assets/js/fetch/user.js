import { appState } from "../state.js";

export const fetchMe = async () => {
  try {
    const res = await fetch("/api/me", { method: "GET" });
    const payload = await res.json();

    if (!res.ok || payload?.status !== "success" || !payload?.data) {
      console.error("Error: " + res);
      return;
    }
    appState.setState({ user: payload.data });
    return;
  } catch (e) {
    appState.setState({ user: null });
  }
}