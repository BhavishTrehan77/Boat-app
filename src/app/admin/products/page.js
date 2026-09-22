"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "../../lib/api";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const emptyForm = {
  productName: "",
  serialNumber: "",
  purchaseDate: new Date().toISOString().split("T")[0],
  warrantyMonths: "12",
  userId: "1",
};

const presetModels = [
  "BOAT Airdopes 141 TWS",
  "BOAT Rockerz 550 Over-Ear Headphone",
  "BOAT Wave Call Smartwatch",
  "BOAT Stone 1200 Bluetooth Speaker",
  "BOAT BassHeads 100 Wired Earphones",
  "BOAT Immortal 121 Gaming Earbuds",
];

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [msg, setMsg] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts();
      setProducts(res.body || res.data || []);
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to load products" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/login");
      } else {
        loadProducts();
      }
    }
  }, [status, session, router]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setMsg(null);
    try {
      await api.createProduct({
        productName: form.productName,
        serialNumber: form.serialNumber.trim(),
        purchaseDate: form.purchaseDate,
        warrantyMonths: Number(form.warrantyMonths),
        userId: Number(form.userId || 1),
      });
      setForm(emptyForm);
      setMsg({ type: "ok", text: `Product ${form.serialNumber} registered successfully!` });
      loadProducts();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to register product" });
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await api.patchProduct(editingProduct.id, {
        productName: editingProduct.productName,
        warrantyMonths: Number(editingProduct.warrantyMonths),
      });
      setEditingProduct(null);
      setMsg({ type: "ok", text: "Product updated successfully!" });
      loadProducts();
    } catch (err) {
      alert(err.message || "Failed to update product");
    }
  }

  async function handleDelete(id, serialNumber) {
    if (!confirm(`Are you sure you want to delete product ${serialNumber}? This will remove its warranty and repair history.`)) return;
    try {
      await api.deleteProduct(id);
      setMsg({ type: "ok", text: `Product ${serialNumber} deleted.` });
      loadProducts();
    } catch (err) {
      alert(err.message || "Failed to delete product");
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      {/* Header */}
      <div className="hero">
        <div className="hero__intro" style={{ alignItems: "flex-start", textAlign: "left" }}>
          <span className="hero__eyebrow">📦 PRODUCT MANAGEMENT</span>
          <h1>BOAT Hardware Registry</h1>
          <p>
            Create, view, update, and manage official BOAT product records, serial numbers, and warranty durations.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Link href="/admin" className="btn secondary" style={{ fontSize: "13px" }}>
              ← Admin Dashboard
            </Link>
            <Link href="/admin/upload" className="btn secondary" style={{ fontSize: "13px" }}>
              Upload Warranty PDF →
            </Link>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`msg ${msg.type}`} style={{ marginBottom: "20px" }}>
          <span>{msg.type === "ok" ? "✓" : "⚠️"}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Add Product Form */}
      <div className="card" style={{ marginBottom: "30px", border: "1px solid var(--border-brand)" }}>
        <h2 style={{ fontSize: "18px", color: "#fff", marginBottom: "4px" }}>Add New BOAT Product</h2>
        <div className="sub" style={{ marginBottom: "16px" }}>Register hardware to enable instant warranty lookup for customers</div>

        <form onSubmit={handleCreate}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <div className="field">
              <label>Product Name / Model *</label>
              <input
                className="input"
                placeholder="e.g. BOAT Airdopes 141 TWS"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                required
              />
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                {presetModels.slice(0, 3).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className="btn secondary"
                    style={{ fontSize: "11px", padding: "2px 6px" }}
                    onClick={() => setForm({ ...form, productName: m })}
                  >
                    {m.replace("BOAT ", "")}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ margin: 0 }}>Serial Number (Unique) *</label>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ padding: "2px 8px", fontSize: "11px" }}
                  onClick={() => {
                    const rnd = Math.floor(10000 + Math.random() * 90000);
                    setForm({ ...form, serialNumber: `BOAT-${rnd}` });
                  }}
                >
                  🎲 Auto Generate
                </button>
              </div>
              <input
                className="input"
                placeholder="e.g. BOAT-889900"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Purchase Date *</label>
              <input
                className="input"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Warranty Period (Months) *</label>
              <select
                className="input"
                value={form.warrantyMonths}
                onChange={(e) => setForm({ ...form, warrantyMonths: e.target.value })}
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year Standard)</option>
                <option value="24">24 Months (2 Years)</option>
                <option value="36">36 Months (3 Years)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <button className="btn" type="submit" disabled={creating}>
              {creating ? <span className="spinner" /> : "+ Add Product to Database"}
            </button>
          </div>
        </form>
      </div>

      {/* Edit Product Modal / Box */}
      {editingProduct && (
        <div className="card" style={{ marginBottom: "30px", background: "rgba(255, 0, 56, 0.05)", border: "1px solid var(--brand)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ color: "#fff", fontSize: "17px", margin: 0 }}>
              Edit Product: <span style={{ color: "#ff0038" }}>{editingProduct.serialNumber}</span>
            </h3>
            <button
              className="btn secondary"
              style={{ padding: "4px 8px", fontSize: "12px" }}
              onClick={() => setEditingProduct(null)}
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleUpdate} style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="field" style={{ flex: 2, minWidth: "220px", marginBottom: 0 }}>
              <label>Product Name</label>
              <input
                className="input"
                value={editingProduct.productName}
                onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
                required
              />
            </div>

            <div className="field" style={{ flex: 1, minWidth: "140px", marginBottom: 0 }}>
              <label>Warranty (Months)</label>
              <input
                className="input"
                type="number"
                value={editingProduct.warrantyMonths}
                onChange={(e) => setEditingProduct({ ...editingProduct, warrantyMonths: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn" style={{ padding: "10px 18px" }}>
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Products List Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
        <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: "18px", margin: 0 }}>
              Registered Products ({filteredProducts.length})
            </h3>
          </div>

          <input
            className="input"
            style={{ maxWidth: "280px", padding: "8px 12px", fontSize: "13px" }}
            placeholder="🔍 Search name or serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="spinner" style={{ margin: "0 auto 10px" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No products found matching your search.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Product Name</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Serial Number</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Purchased</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Expires</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Status</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const now = new Date();
                  const exp = p.expiryDate ? new Date(p.expiryDate) : null;
                  const isExp = exp && exp < now;
                  const daysLeft = exp ? Math.ceil((exp - now) / (1000 * 60 * 60 * 24)) : 0;
                  const isSoon = !isExp && daysLeft <= 30;

                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#fff" }}>
                        {p.productName}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#ff0038" }}>
                        <Link href={`/product/${encodeURIComponent(p.serialNumber)}`} style={{ textDecoration: "underline" }} title="Open public product view">
                          {p.serialNumber}
                        </Link>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {fmtDate(p.purchaseDate)}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {fmtDate(p.expiryDate)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {isExp ? (
                          <span className="tag expired">✕ Expired</span>
                        ) : isSoon ? (
                          <span className="tag pending" style={{ background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", border: "1px solid #fbbf24" }}>
                            ⚠️ Soon ({daysLeft}d)
                          </span>
                        ) : (
                          <span className="tag ok">✓ Active</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: "12px", marginRight: "6px" }}
                          onClick={() => setEditingProduct(p)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: "12px", color: "var(--danger)", borderColor: "rgba(244,63,94,0.3)" }}
                          onClick={() => handleDelete(p.id, p.serialNumber)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
