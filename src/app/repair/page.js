"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repairs, setRepairs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [form, setForm] = useState({
    ...empty,
    productId: params.get("productId") || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/login");
    }
  }, [status, session, router]);

  async function removeRepair(id) {
    if (!confirm("Are you sure you want to delete this repair record?")) return;
    try {
      await api.deleteRepair(id);
      load();
    } catch (err) {
      alert(err.message || "Failed to delete repair");
    }
  }

  async function updateTicketStatus(ticketId, newStatus) {
    setUpdatingId(ticketId);
    try {
      await api.patchRepair(ticketId, { status: newStatus });
      load();
    } catch (err) {
      alert(err.message || "Failed to update repair status");
    } finally {
      setUpdatingId(null);
    }
  }


  async function load() {
    setLoading(true);
    try {
      const [repairsRes, productsRes] = await Promise.all([
        api.getRepairs(),
        api.getProducts(),
      ]);
      setRepairs(repairsRes.data || repairsRes.body || []);
      setProducts(productsRes.body || productsRes.data || []);
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
          <span className="hero__eyebrow">🛠 REPAIR MANAGEMENT · ADMIN</span>
          <h1>BOAT Repair Records</h1>
          <p>Log service requests, inspect repair history, and update resolution statuses in real time.</p>
        </div>
      </div>

      {/* Add New Repair Record Form */}
      <div className="card">
        <h2>Add Repair Record</h2>
        <div className="sub">Link a repair ticket to a product by ID</div>

        <form onSubmit={submit}>
          <div className="row">
            <div className="field">
              <label>Select Target Product</label>
              <select
                className="input"
                value={form.productId}
                onChange={(e) => update("productId", e.target.value)}
                required
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName} ({p.serialNumber})
                  </option>
                ))}
              </select>
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

                {/* Status Controls for Admin vs Visual Tracker for Regular User */}
                {session?.user?.role === "ADMIN" ? (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                      ⚙️ Admin Status Control:
                    </span>
                    {["PENDING", "IN_PROGRESS", "COMPLETED"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`btn ${r.status === st ? "" : "secondary"}`}
                        disabled={updatingId === r.id || r.status === st}
                        style={{ padding: "4px 10px", fontSize: "11.5px" }}
                        onClick={() => updateTicketStatus(r.id, st)}
                      >
                        {updatingId === r.id ? "…" : st}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ padding: "4px 10px", fontSize: "11.5px", marginLeft: "auto", color: "#ff6b81" }}
                      onClick={() => removeRepair(r.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>
                      📍 Repair Progress Tracker:
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      {[
                        { key: "PENDING", label: "1. Request Received", icon: "🟡" },
                        { key: "IN_PROGRESS", label: "2. Under Inspection / Repair", icon: "🔵" },
                        { key: "COMPLETED", label: "3. Service Completed", icon: "🟢" },
                      ].map((step) => {
                        const isCurrent = (r.status || "PENDING") === step.key;
                        const isDone =
                          r.status === "COMPLETED" ||
                          (r.status === "IN_PROGRESS" && step.key === "PENDING");
                        return (
                          <span
                            key={step.key}
                            style={{
                              fontSize: "12px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              background: isCurrent ? "rgba(255, 59, 104, 0.15)" : isDone ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.05)",
                              color: isCurrent ? "#ff3b68" : isDone ? "#34d399" : "var(--text-muted)",
                              border: isCurrent ? "1px solid #ff3b68" : isDone ? "1px solid #34d399" : "1px solid transparent",
                              fontWeight: isCurrent ? 700 : 500,
                            }}
                          >
                            {step.icon} {step.label}
                          </span>
                        );
                      })}
                    </div>
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
