import config from "../config";

export async function fetchAttendance({ status, q, limit = 50, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    if (limit != null) params.set("limit", String(limit));
    if (offset != null) params.set("offset", String(offset));

    const url = `${config.API_BASE}/attendance?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Attendance fetch failed: ${res.status} ${await res.text()}`);
    }
    return res.json(); // { total, items: [...] }
}
