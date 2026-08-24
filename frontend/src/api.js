const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function runReconciliation({ regenerateData = true, useMock = null } = {}) {
  return request("/reconcile", {
    method: "POST",
    body: JSON.stringify({ regenerate_data: regenerateData, use_mock: useMock }),
  });
}

export function getLastReport() {
  return request("/report");
}

export function getRawData() {
  return request("/raw-data");
}
