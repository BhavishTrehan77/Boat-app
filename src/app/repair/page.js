"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../lib/api";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const empty = {
  issue: "",
  description: "",
  repairDate: new Date().toISOString().split("T")[0],
  cost: "0",
  productId: "",
};

const commonIssues = [
  "One side audio silent",
  "Battery draining fast",
  "Bluetooth pairing failure",
  "Microphone output low",
  "Charging case not charging",
  "Physical button unresponsive",
];

function RepairContent() {
  const params = useSearchParams();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    ...empty,
    productId: params.get("productId") || "",
  });
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      if (!form.issue || !form.productId || !form.repairDate) {
        throw new Error("Please complete the issue, product ID, and date fields.");
      }

      await api.createRepair({
        issue: form.issue,
        description: form.description,
        repairDate: new Date(form.repairDate).toISOString(),
        cost: Number(form.cost || 0),
        productId: Number(form.productId),
      });

      setMsg({ type: "ok", text: "Repair service request submitted successfully!" });
      setForm({
        ...empty,
        productId: form.productId,
        repairDate: new Date().toISOString().split("T")[0],
      });
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
          <span className="hero__eyebrow">🛠 SERVICE & REPAIR CENTER</span>
          <h1>Submit & Track BOAT Service Tickets</h1>
          <p>File official service requests, log hardware issues, and monitor repair status in real time.</p>
        </div>
      </div>

      {/* New Service Form */}
      <div className="card">
        <h2>Raise New Service Ticket</h2>
        <div className="sub">Requires a registered Product ID</div>

        <form onSubmit={submit}>
          <div className="row">
            <div className="field">
              <label>Target Product ID</label>
              <input
                className="input"
                type="number"
                value={form.productId}
                onChange={(e) => update("productId", e.target.value)}
                placeholder="e.g. 1"
                required
              />
            </div>

            <div className="field">
              <label>Issue Title</label>
              <input
                className="input"
                value={form.issue}
                onChange={(e) => update("issue", e.target.value)}
                placeholder="e.g. Right earbud not charging"
                required
              />
            </div>
          </div>

          {/* Quick Issue Selection */}
          <div style={{ marginBottom: "18px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Common Issue Presets:</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {commonIssues.map((issueText) => (
                <button
                  key={issueText}
                  type="button"
                  className="btn secondary"
                  style={{ padding: "5px 12px", fontSize: "12px" }}
                  onClick={() => update("issue", issueText)}
                >
                  + {issueText}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Detailed Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe what happened, when the issue started, or any physical damage noticed..."
            />
          </div>

          <div className="row">
            <div className="field">
              <label>Incident / Service Date</label>
              <input
                className="input"
                type="date"
                value={form.repairDate}
                onChange={(e) => update("repairDate", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Estimated Repair Cost ($)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.cost}
                onChange={(e) => update("cost", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <button className="btn" type="submit" disabled={submitting} style={{ marginTop: "10px" }}>
            {submitting ? <span className="spinner" /> : "Submit Service Ticket"}
          </button>
        </form>

        {msg && (
          <div className={`msg ${msg.type}`} style={{ marginTop: "18px" }}>
            <span>{msg.type === "ok" ? "✓" : "⚠️"}</span>
            <span>{msg.text}</span>
          </div>
        )}
      </div>

      {/* Repair Tickets List */}
      <div className="card" style={{ marginTop: "36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2>Service & Repair Tickets</h2>
            <div className="sub" style={{ marginBottom: 0 }}>
              {loading ? "Loading repair records…" : `${repairs.length} active/past ticket(s)`}
            </div>
          </div>
          <button className="btn secondary" onClick={load} style={{ padding: "8px 14px", fontSize: "13px" }}>
            🔄 Refresh Tickets
          </button>
        </div>

        {!loading && repairs.length === 0 && (
          <p className="muted" style={{ padding: "20px 0" }}>No repair tickets found in the system.</p>
        )}

        <div className="list">
          {repairs.map((r) => {
            const statusKey = (r.status || "PENDING").toLowerCase();
            return (
              <div className="item" key={r.id}>
                <div className="top">
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "2px" }}>
                      Ticket <span style={{ color: "#ff3b68", fontFamily: "monospace", fontWeight: "700" }}>#{r.id}</span> · Linked Product ID: <span style={{ color: "#fff" }}>#{r.productId}</span>
                    </div>
                    <h3 style={{ fontSize: "18px" }}>{r.issue}</h3>
                  </div>
                  <span className={`tag ${statusKey}`}>
                    {r.status || "PENDING"}
                  </span>
                </div>

                <div className="meta" style={{ marginTop: "10px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <div>Filed Date: <span style={{ color: "#fff" }}>{fmtDate(r.repairDate)}</span></div>
                  <div>Cost: <span style={{ color: "#fff" }}>${r.cost || 0}</span></div>
                </div>

                {r.description && (
                  <div style={{ marginTop: "10px", background: "rgba(0,0,0,0.3)", padding: "12px 14px", borderRadius: "8px", fontSize: "13.5px", color: "var(--text-main)", borderLeft: "3px solid var(--brand)" }}>
                    {r.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function RepairPage() {
  return (
    <Suspense
      fallback={
        <div className="container">
          <div className="hero">
            <div className="hero__intro">
              <span className="hero__eyebrow">🛠 SERVICE & REPAIR CENTER</span>
              <h1>Loading Repair Portal…</h1>
            </div>
          </div>
        </div>
      }
    >
      <RepairContent />
    </Suspense>
  );
}
