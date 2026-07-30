"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

const empty = {
  productName: "",
  serialNumber: "",
  purchaseDate: "",
  warrantyMonths: "",
  userId: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.getProducts();
      setProducts(res.body || []);
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

  async function create(e) {
    e.preventDefault();
    setMsg(null);
    setCreating(true);
    try {
      const purchase = new Date(form.purchaseDate);
      const expiry = new Date(purchase);
      expiry.setMonth(expiry.getMonth() + Number(form.warrantyMonths));
      await api.createProduct({
        productName: form.productName,
        serialNumber: form.serialNumber,
        purchaseDate: purchase.toISOString(),
        warrantyMonths: Number(form.warrantyMonths),
        expiryDate: expiry.toISOString(),
        userId: Number(form.userId),
      });
      setMsg({ type: "ok", text: "Product created." });
      setForm(empty);
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setCreating(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(id);
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <h1>Products</h1>
        <p>Create and browse registered BOAT products.</p>
      </div>

      <div className="card">
        <h2>Add Product</h2>
        <div className="sub">New product registration</div>
        <form onSubmit={create}>
          <div className="row">
            <div className="field">
              <label>Product Name</label>
              <input
                className="input"
                value={form.productName}
                onChange={(e) => update("productName", e.target.value)}
                placeholder="BOAT Airdopes 131"
              />
            </div>
            <div className="field">
              <label>Serial Number</label>
              <input
                className="input"
                value={form.serialNumber}
                onChange={(e) => update("serialNumber", e.target.value)}
                placeholder="BOAT-12345"
              />
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
              />
            </div>
            <div className="field">
              <label>Warranty (months)</label>
              <input
                className="input"
                type="number"
                value={form.warrantyMonths}
                onChange={(e) => update("warrantyMonths", e.target.value)}
                placeholder="12"
              />
            </div>
            <div className="field">
              <label>User ID</label>
              <input
                className="input"
                type="number"
                value={form.userId}
                onChange={(e) => update("userId", e.target.value)}
                placeholder="1"
              />
            </div>
          </div>
          <button className="btn" type="submit" disabled={creating}>
            {creating && <span className="spinner" />}
            {creating ? "Saving…" : "Create Product"}
          </button>
        </form>
        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
      </div>

      <div className="card">
        <h2>All Products</h2>
        <div className="sub">
          {loading ? "Loading…" : `${products.length} product(s)`}
        </div>
        {!loading && products.length === 0 && (
          <p className="muted">No products yet.</p>
        )}
        <div className="list">
          {products.map((p) => {
            const active =
              p.expiryDate && new Date(p.expiryDate) > new Date();
            return (
              <div className="item" key={p.id}>
                <div className="top">
                  <h3>{p.productName}</h3>
                  <span className={`tag ${active ? "ok" : "expired"}`}>
                    {active ? "ACTIVE" : "EXPIRED"}
                  </span>
                </div>
                <div className="meta">
                  #{p.id} · {p.serialNumber} · Expires {fmtDate(p.expiryDate)}
                </div>
                <div style={{ marginTop: 10 }}>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => remove(p.id)}
                  >
                    Delete
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
