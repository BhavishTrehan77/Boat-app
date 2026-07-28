"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

const empty = {
  issue: "",
  description: "",
  repairDate: "",
  cost: "",
  productId: "",
};

export default function RepairPage() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.getRepairs();
      setRepairs(res.data || []);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      await api.createRepair({
        issue: form.issue,
        description: form.description,
        repairDate: new Date(form.repairDate).toISOString(),
        cost: Number(form.cost),
        productId: Number(form.productId),
      });
      setMsg({ type: "ok", text: "Repair request submitted." });
      setForm(empty);
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="hero__intro">
          <span className="hero__eyebrow">🛠 Repair center</span>
          <h1>Track and manage every BOAT service request.</h1>
          <p>Submit a repair, monitor the status, and keep owner support organized from one place.</p>
        </div>
      </div>

      <div className="card">
        <h2>New Repair Request</h2>
        <div className="sub">Requires a valid Product ID</div>
        <form onSubmit={submit}>
          <div className="row">
            <div className="field">
              <label>Issue</label>
              <input
                className="input"
                value={form.issue}
                onChange={(e) => update("issue", e.target.value)}
                placeholder="Not charging"
              />
            </div>
            <div className="field">
              <label>Product ID</label>
              <input
                className="input"
                type="number"
                value={form.productId}
                onChange={(e) => update("productId", e.target.value)}
                placeholder="1"
              />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the issue in detail…"
            />
          </div>
          <div className="row">
            <div className="field">
              <label>Repair Date</label>
              <input
                className="input"
                type="date"
                value={form.repairDate}
                onChange={(e) => update("repairDate", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Cost</label>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.cost}
                onChange={(e) => update("cost", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting && <span className="spinner" />}
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </form>
        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
      </div>

      <div className="card">
        <h2>Repair History</h2>
        <div className="sub">
          {loading ? "Loading…" : `${repairs.length} record(s)`}
        </div>
        {!loading && repairs.length === 0 && (
          <p className="muted">No repairs found.</p>
        )}
        <div className="list">
          {repairs.map((r) => (
            <div className="item" key={r.id}>
              <div className="top">
                <h3>{r.issue}</h3>
                <span className={`tag ${r.status.toLowerCase()}`}>
                  {r.status}
                </span>
              </div>
              <div className="meta">
                #{r.id} · Product #{r.productId} · {fmtDate(r.repairDate)} · $
                {r.cost}
              </div>
              <div className="meta">{r.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
