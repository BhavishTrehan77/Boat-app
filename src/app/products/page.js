"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "../lib/api";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const empty = {
  productName: "",
  serialNumber: "",
  purchaseDate: new Date().toISOString().split("T")[0],
  warrantyMonths: "12",
  userId: "1",
};

const presetModels = [
  "BOAT Airdopes 141 TWS",
  "BOAT Rockerz 550 Headphone",
  "BOAT Wave Call Smartwatch",
  "BOAT Stone 1200 Bluetooth Speaker",
  "BOAT BassHeads 100 Wired",
];

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [creating, setCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [msg, setMsg] = useState(null);

  async function updateProductSubmit(e) {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await api.patchProduct(editingProduct.id, {
        productName: editingProduct.productName,
        warrantyMonths: Number(editingProduct.warrantyMonths),
      });
      setEditingProduct(null);
      setMsg({ type: "ok", text: "Product details updated successfully!" });
      load();
    } catch (err) {
      alert(err.message || "Failed to update product");
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/login");
    }
  }, [status, session, router]);

  const [uploadingProductId, setUploadingProductId] = useState(null);
  const [uploadMsgMap, setUploadMsgMap] = useState({});

  async function uploadFileForProduct(productId, file) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setUploadMsgMap((prev) => ({
        ...prev,
        [productId]: { type: "error", text: "Only images (JPG, PNG, WEBP) and PDF files are allowed." },
      }));
      return;
    }

    setUploadingProductId(productId);
    setUploadMsgMap((prev) => ({ ...prev, [productId]: null }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);

      await api.uploadWarrantyFile(formData);
      setUploadMsgMap((prev) => ({
        ...prev,
        [productId]: { type: "ok", text: "File uploaded successfully via Multer!" },
      }));
      load();
    } catch (err) {
      setUploadMsgMap((prev) => ({
        ...prev,
        [productId]: { type: "error", text: err.message || "Failed to upload document." },
      }));
    } finally {
      setUploadingProductId(null);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const res = await api.getProducts();
      setProducts(res.body || res.data || []);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function generateRandomSerial() {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    setForm((f) => ({ ...f, serialNumber: `BOAT-${randomNum}` }));
  }

  async function create(e) {
    e.preventDefault();
    setMsg(null);
    setCreating(true);
    try {
      if (!form.productName || !form.serialNumber || !form.purchaseDate) {
        throw new Error("Please fill in all required fields.");
      }

      await api.createProduct({
        productName: form.productName,
        serialNumber: form.serialNumber,
        purchaseDate: form.purchaseDate,
        warrantyMonths: Number(form.warrantyMonths),
        ...(session?.user?.role === "ADMIN" && form.userId
          ? { userId: Number(form.userId) }
          : {}),
      });

      setMsg({ type: "ok", text: "Product registered successfully!" });
      setForm({
        ...empty,
        purchaseDate: new Date().toISOString().split("T")[0],
      });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setCreating(false);
    }
  }


  async function remove(id) {
    if (!confirm("Are you sure you want to delete this product record?")) return;
    try {
      await api.deleteProduct(id);
      setMsg({ type: "ok", text: "Product record removed." });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="hero__intro">
          <span className="hero__eyebrow">📦 HARDWARE REGISTRY</span>
          <h1>BOAT Products Hub</h1>
          <p>Register new devices to activate warranty coverage and manage existing hardware.</p>
        </div>
      </div>

      {/* Product Registration Card */}
      <div className="card">
        <h2>Register New BOAT Product</h2>
        <div className="sub">Link a purchased product to warranty coverage</div>

        <form onSubmit={create}>
          <div className="row">
            <div className="field">
              <label>Product Name</label>
              <input
                className="input"
                value={form.productName}
                onChange={(e) => update("productName", e.target.value)}
                placeholder="e.g. BOAT Airdopes 141 TWS"
                required
              />
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Presets:</span>
                {presetModels.slice(0, 3).map((model) => (
                  <button
                    key={model}
                    type="button"
                    style={{ background: "transparent", border: "none", color: "#ff3b68", fontSize: "11.5px", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => update("productName", model)}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Serial Number</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  className="input"
                  value={form.serialNumber}
                  onChange={(e) => update("serialNumber", e.target.value)}
                  placeholder="e.g. BOAT-98765"
                  required
                />
                <button
                  type="button"
                  className="btn secondary"
                  onClick={generateRandomSerial}
                  style={{ whiteSpace: "nowrap", padding: "10px 14px", fontSize: "13px" }}
                >
                  🎲 Auto
                </button>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>Purchase Date</label>
              <input
                className="input"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => update("purchaseDate", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Warranty (Months)</label>
              <input
                className="input"
                type="number"
                value={form.warrantyMonths}
                onChange={(e) => update("warrantyMonths", e.target.value)}
                placeholder="12"
                required
              />
            </div>
            {session?.user?.role === "ADMIN" && (
              <div className="field">
                <label>User ID (Admin Only)</label>
                <input
                  className="input"
                  type="number"
                  value={form.userId}
                  onChange={(e) => update("userId", e.target.value)}
                  placeholder="e.g. 1"
                />
              </div>
            )}
          </div>


          <button className="btn" type="submit" disabled={creating} style={{ marginTop: "10px" }}>
            {creating ? <span className="spinner" /> : "Register Product"}
          </button>
        </form>

        {msg && (
          <div className={`msg ${msg.type}`} style={{ marginTop: "18px" }}>
            <span>{msg.type === "ok" ? "✓" : "⚠️"}</span>
            <span>{msg.text}</span>
          </div>
        )}
      </div>

      {/* Product List */}
      <div className="card" style={{ marginTop: "36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2>Registered Products</h2>
            <div className="sub" style={{ marginBottom: 0 }}>
              {loading ? "Loading hardware catalog…" : `${products.length} registered item(s)`}
            </div>
          </div>
          <button className="btn secondary" onClick={load} style={{ padding: "8px 14px", fontSize: "13px" }}>
            🔄 Refresh
          </button>
        </div>

        {!loading && products.length === 0 && (
          <p className="muted" style={{ padding: "20px 0" }}>No products registered yet. Fill out the form above to add your first BOAT product!</p>
        )}

        <div className="list">
          {products.map((p) => {
            const active =
              p.expiryDate && new Date(p.expiryDate) > new Date();
            const pMsg = uploadMsgMap[p.id];

            return (
              <div className="item" key={p.id}>
                <div className="top">
                  <div>
                    <h3 style={{ fontSize: "18px" }}>{p.productName}</h3>
                    <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                      Owner User ID: <span style={{ color: "#fff" }}>#{p.userId}</span>
                    </div>
                  </div>
                  <span className={`tag ${active ? "ok" : "expired"}`}>
                    {active ? "✓ ACTIVE" : "✕ EXPIRED"}
                  </span>
                </div>

                <div className="meta" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", margin: "14px 0" }}>
                  <div>Serial: <span style={{ fontFamily: "monospace", color: "#ff3b68" }}>{p.serialNumber}</span></div>
                  <div>Purchased: <span style={{ color: "#fff" }}>{fmtDate(p.purchaseDate)}</span></div>
                  <div>Expires: <span style={{ color: "#fff" }}>{fmtDate(p.expiryDate)}</span></div>
                  <div>Term: <span style={{ color: "#fff" }}>{p.warrantyMonths} months</span></div>
                </div>

                {/* Attached Warranty Documents & Images */}
                {p.documents && p.documents.length > 0 && (
                  <div style={{ marginTop: "12px", background: "rgba(0,0,0,0.3)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      📁 Attached Warranty Documents & Photos ({p.documents.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {p.documents.map((doc) => {
                        const isImg = /\.(png|jpe?g|webp|gif)$/i.test(doc.fileName || doc.fileUrl);
                        return (
                          <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", flexWrap: "wrap", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span>{isImg ? "🖼️" : "📄"}</span>
                              <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ color: "#ff3b68", fontWeight: 600 }}>
                                {doc.fileName || `Document #${doc.id}`}
                              </a>
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn secondary" style={{ padding: "4px 8px", fontSize: "11px" }}>
                                View ↗
                              </a>
                              <a
                                href={`/api/warranty/download/${doc.id}`}
                                className="btn"
                                style={{ padding: "4px 8px", fontSize: "11px" }}
                                title="Download file"
                              >
                                ⬇️ Download
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Direct Document/Image Upload Option (Available to User & Admin) */}
                {session?.user && (
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      id={`file-${p.id}`}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          uploadFileForProduct(p.id, e.target.files[0]);
                          e.target.value = "";
                        }
                      }}
                    />
                    <label
                      htmlFor={`file-${p.id}`}
                      className="btn secondary"
                      style={{ padding: "6px 12px", fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      {uploadingProductId === p.id ? <span className="spinner" /> : "📸 Attach Image / PDF (Multer)"}
                    </label>
                  </div>
                )}


                {pMsg && (
                  <div className={`msg ${pMsg.type}`} style={{ marginTop: "10px", padding: "8px 12px", fontSize: "12.5px" }}>
                    <span>{pMsg.type === "ok" ? "✓" : "⚠️"}</span>
                    <span>{pMsg.text}</span>
                  </div>
                )}

                {/* Inline Product Edit Form */}
                {editingProduct?.id === p.id && (
                  <form onSubmit={updateProductSubmit} style={{ marginTop: "14px", padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px dashed var(--border-brand)" }}>
                    <h4 style={{ fontSize: "13px", color: "#fff", marginBottom: "8px" }}>✏️ Edit Product Details</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                      <div>
                        <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Product Name</label>
                        <input
                          className="input"
                          value={editingProduct.productName}
                          onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
                          required
                          style={{ padding: "6px 10px", fontSize: "12.5px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Warranty (Months)</label>
                        <input
                          className="input"
                          type="number"
                          value={editingProduct.warrantyMonths}
                          onChange={(e) => setEditingProduct({ ...editingProduct, warrantyMonths: e.target.value })}
                          required
                          style={{ padding: "6px 10px", fontSize: "12.5px" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <button type="submit" className="btn" style={{ padding: "6px 14px", fontSize: "12px" }}>Save</button>
                      <button type="button" className="btn secondary" onClick={() => setEditingProduct(null)} style={{ padding: "6px 14px", fontSize: "12px" }}>Cancel</button>
                    </div>
                  </form>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "14px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => setEditingProduct({ id: p.id, productName: p.productName, warrantyMonths: p.warrantyMonths })}
                    style={{ padding: "8px 14px", fontSize: "13px" }}
                  >
                    ✏️ Edit
                  </button>
                  <Link className="btn secondary" href={`/repair?productId=${p.id}`} style={{ padding: "8px 14px", fontSize: "13px" }}>
                    File Repair
                  </Link>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => remove(p.id)}
                    style={{ padding: "8px 14px", fontSize: "13px", marginLeft: "auto", color: "#ff6b81" }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
