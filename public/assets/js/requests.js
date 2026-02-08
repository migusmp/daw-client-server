import { appState } from "./state.js";

export const fetchMe = async () => {
    appState.setState({ meLoading: true, meError: null });

    try {
        const res = await fetch("/api/me", { method: "GET" });

        if (res.status === 401) {
            appState.setState({ user: null, meLoading: false });
            return null;
        }

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.text();
        let user;
        try {
            user = JSON.parse(data);
        } catch (e) {
            console.error("ERROR PARSING JSON: ", e);
        }

        appState.setState({ user : user.data, meLoading: false });
        return user;
    } catch (e) {
        appState.setState({ meError: String(e), meLoading: false, user: null });
        return null;
    }
}