import config from "../config";

export async function fetchAnalyticsSummary() {
    const base = config.API_BASE || "";
    const url = `${base}/analytics/summary`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Analytics fetch failed: ${res.status} ${await res.text()}`);
    }
    return res.json(); // { overall, per_prn: [...] }
}
