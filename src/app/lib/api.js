const BASE = "";

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message =
      (json && (json.message || (json.errors && "Validation failed"))) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json;
}

export const api = {
  register: (body) => request("POST", "/api/register", body),
  login: (body) => request("POST", "/api/login", body),

  getProducts: () => request("GET", "/api/products"),
  createProduct: (body) => request("POST", "/api/products", body),
  getProduct: (id) => request("GET", `/api/products/${id}`),
  patchProduct: (id, body) => request("PATCH", `/api/products/${id}`, body),
  deleteProduct: (id) => request("DELETE", `/api/products/${id}`),

  getWarranty: (serialNumber) =>
    request("GET", `/api/products/serial/${encodeURIComponent(serialNumber)}`),

  getRepairs: () => request("GET", "/api/repair"),
  createRepair: (body) => request("POST", "/api/repair", body),
  getRepair: (id) => request("GET", `/api/repair/${id}`),
  patchRepair: (id, body) => request("PATCH", `/api/repair/${id}`, body),
  deleteRepair: (id) => request("DELETE", `/api/repair/${id}`),

  getAdminDashboard: () => request("GET", "/api/dashboard"),
  getUserDashboard: (id) => request("GET", `/api/dashboard/user/${id}`),
};
