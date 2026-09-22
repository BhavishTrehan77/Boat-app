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

const emptyRepair = {
  productId: "",
  issue: "",
  description: "",
  cost: "0",
  repairDate: new Date().toISOString().split("T")[0],
  status: "PENDING",
};

export default function AdminRepairsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [repairs, setRepairs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyRepair);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [msg, setMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [repairsRes, productsRes] = await Promise.all([
        api.getRepairs(),
        api.getProducts(),
      ]);
      setRepairs(repairsRes.data || repairsRes.body || []);
      setProducts(productsRes.body || productsRes.data || []);
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to load repair records" });
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
        loadData();
      }
    }
  }, [status, session, router]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.productId) {
      alert("Please select a product");
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      await api.createRepair({
        productId: Number(form.productId),
        issue: form.issue,
        description: form.description,
        cost: Number(form.cost || 0),
        repairDate: form.repairDate,
      });
      setForm(emptyRepair);
      setMsg({ type: "ok", text: "New service ticket registered successfully!" });
      loadData();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to log repair" });
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id, newStatus) {
    setUpdatingId(id);
    try {
      await api.patchRepair(id, { status: newStatus });
      loadData();
    } catch (err) {
      alert(err.message || "Failed to update ticket status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to permanently delete this repair ticket?")) return;
    try {
      await api.deleteRepair(id);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to delete repair");
    }
  }

  const filteredRepairs = repairs.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="container">
      {/* Header */}
      <div className="hero">
        <div className="hero__intro" style={{ alignItems: "flex-start", textAlign: "left" }}>
          <span className="hero__eyebrow">🛠️ SERVICE CENTER & REPAIRS</span>
          <h1>Repair Management Console</h1>
          <p>
            Log new authorized service tickets, update technician inspection remarks, and advance repair statuses.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Link href="/admin" className="btn secondary" style={{ fontSize: "13px" }}>
              ← Admin Dashboard
            </Link>
            <Link href="/admin/products" className="btn secondary" style={{ fontSize: "13px" }}>
              Product Management →
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

      {/* Log Repair Form */}
      <div className="card" style={{ marginBottom: "30px", border: "1px solid var(--border-brand)" }}>
        <h2 style={{ fontSize: "18px", color: "#fff", marginBottom: "4px" }}>Log New Repair Ticket</h2>
        <div className="sub" style={{ marginBottom: "16px" }}>Record service center diagnostics, repairs, and technician notes</div>

        <form onSubmit={handleCreate}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <div className="field">
              <label>Select Hardware / Serial *</label>
              <select
                className="input"
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
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
              <label>Issue Title *</label>
              <input
                className="input"
                placeholder="e.g. Left Earbud Audio Loss / Driver Failure"
                value={form.issue}
                onChange={(e) => setForm({ ...form, issue: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Repair / Intake Date *</label>
              <input
                className="input"
                type="date"
                value={form.repairDate}
                onChange={(e) => setForm({ ...form, repairDate: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Repair Cost (₹) (0 for warranty)</label>
              <input
                className="input"
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: "12px" }}>
            <label>Technician Remarks & Diagnosis *</label>
            <textarea
              className="input"
              rows={3}
              placeholder="e.g. Cleaned charging pins, replaced battery cell, tested acoustic balance."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <button className="btn" type="submit" disabled={submitting} style={{ marginTop: "10px" }}>
            {submitting ? <span className="spinner" /> : "+ Log Official Repair Record"}
          </button>
        </form>
      </div>

      {/* Repair Tickets List */}
      <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
        <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 style={{ color: "#fff", fontSize: "18px", margin: 0 }}>
            Repair Queue & History ({filteredRepairs.length})
          </h3>

          <div style={{ display: "flex", gap: "8px" }}>
            {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn secondary`}
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  background: statusFilter === st ? "rgba(255,0,56,0.2)" : undefined,
                  borderColor: statusFilter === st ? "#ff0038" : undefined,
                  color: statusFilter === st ? "#fff" : "var(--text-muted)",
                }}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="spinner" style={{ margin: "0 auto 10px" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading repair records...</p>
          </div>
        ) : filteredRepairs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No repair records matching the filter.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Ticket ID</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Product / Serial</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Issue & Remarks</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Date</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Status</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepairs.map((r) => {
                  const linkedProduct = products.find((p) => p.id === r.productId);
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                        #{r.id}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <strong style={{ color: "#fff", display: "block" }}>
                          {linkedProduct ? linkedProduct.productName : `Product #${r.productId}`}
                        </strong>
                        {linkedProduct && (
                          <span style={{ color: "#ff0038", fontFamily: "monospace", fontSize: "12px" }}>
                            {linkedProduct.serialNumber}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", maxWidth: "340px" }}>
                        <div style={{ color: "#fff", fontWeight: 600 }}>{r.issue}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "12.5px", marginTop: "2px" }}>
                          {r.description}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {fmtDate(r.repairDate)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <select
                          className="input"
                          style={{ padding: "4px 8px", fontSize: "12px", width: "auto" }}
                          value={r.status}
                          disabled={updatingId === r.id}
                          onChange={(e) => updateStatus(r.id, e.target.value)}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: "12px", color: "var(--danger)", borderColor: "rgba(244,63,94,0.3)" }}
                          onClick={() => handleDelete(r.id)}
                        >
                          🗑️ Delete
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
