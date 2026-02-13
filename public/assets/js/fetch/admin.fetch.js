export async function fetchAllUsers() {
    try {
        const res = await fetch("/api/admin/users", { method: "GET" });
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