"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch platform dashboard statistics");
      const json = await res.json();
      setData(json.body);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepairs = async () => {
    try {
      const res = await api.getRepairs();
      setRepairs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.getWarrantyDocuments();
      setDocuments(res.body || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    try {
      await api.patchRepair(ticketId, { status: newStatus });
      await Promise.all([fetchDashboard(), fetchRepairs()]);
    } catch (err) {
      alert(err.message || "Failed to update repair status");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/login");
        return;
      }
      fetchDashboard();
      fetchRepairs();
      fetchDocuments();
    }
  }, [status, session, router]);

  return (
    <div className="container">
      {/* Hero Header */}
      <div className="hero">
        <div className="hero__intro" style={{ alignItems: "flex-start", textAlign: "left" }}>
          <span className="hero__eyebrow">⚓ BOAT WARRANTY HUB · ADMIN CONSOLE</span>
          <h1>Administrator Dashboard</h1>
          <p>
            Centralized platform overview across all registered BOAT audio hardware, warranty statuses, repair records, and uploaded documents.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
            <Link href="/admin/products" className="btn">
              📦 Product Management
            </Link>
            <Link href="/admin/repairs" className="btn secondary">
              🛠 Repair Management
            </Link>
            <Link href="/admin/upload" className="btn secondary">
              📁 Upload Warranty PDF
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "30px 0 16px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#fff" }}>
          System Metrics & Analytics
        </h2>
        <button className="btn secondary" onClick={fetchDashboard} style={{ padding: "8px 16px", fontSize: "13px" }}>
          🔄 Refresh
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-muted)" }}>Loading live warranty analytics...</p>
        </div>
      )}

      {error && (
        <div className="msg error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {data && (
        <div className="grid-cards">
          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>📦</div>
            <div className="feature-card__title">Total Registered Products</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 800, color: "#fff" }}>
              {data.totalProducts ?? 0}
            </div>
            <div className="feature-card__desc">Active devices in database</div>
            <Link href="/admin/products" className="feature-card__link">Manage Products →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>✓</div>
            <div className="feature-card__title">Active Warranties</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 800, color: "#34d399" }}>
              {data.activeWarranty ?? 0}
            </div>
            <div className="feature-card__desc">Currently covered units</div>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: "rgba(244, 63, 94, 0.15)", color: "#ff6b81" }}>⌛</div>
            <div className="feature-card__title">Expired Warranties</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 800, color: "#ff6b81" }}>
              {data.expiredWarranty ?? 0}
            </div>
            <div className="feature-card__desc">Terms lapsed</div>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>🔧</div>
            <div className="feature-card__title">Pending Service Tickets</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 800, color: "#fbbf24" }}>
              {data.pendingRepairs ?? 0}
            </div>
            <div className="feature-card__desc">Awaiting repair completion</div>
            <Link href="/admin/repairs" className="feature-card__link">View Queue →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>🏁</div>
            <div className="feature-card__title">Completed Repairs</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 800, color: "#34d399" }}>
              {data.completedRepairs ?? 0}
            </div>
            <div className="feature-card__desc">Resolved hardware service tickets</div>
            <Link href="/admin/repairs" className="feature-card__link">Service History →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: "rgba(255, 0, 56, 0.15)", color: "#ff0038" }}>📄</div>
            <div className="feature-card__title">Uploaded Warranty PDFs</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 800, color: "#fff" }}>
              {documents.length}
            </div>
            <div className="feature-card__desc">Stored warranty documents (Multer)</div>
            <Link href="/admin/upload" className="feature-card__link">Upload PDFs →</Link>
          </div>
        </div>
      )}

      {/* Recent Repair Tickets Table */}
      <div style={{ marginTop: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "#fff" }}>
            Recent Service Center Tickets ({repairs.length})
          </h2>
          <Link href="/admin/repairs" className="link" style={{ fontSize: "13.5px", color: "#ff0038" }}>
            Open Full Repair Management →
          </Link>
        </div>

        {repairs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
            No repair records logged yet.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>ID</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Issue / Description</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Date</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Status</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.slice(0, 5).map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontFamily: "monospace" }}>#{r.id}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <strong style={{ color: "#fff", display: "block" }}>{r.issue}</strong>
                        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>{r.description}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {fmtDate(r.repairDate)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className={`tag ${r.status ? r.status.toLowerCase() : "pending"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <select
                          className="input"
                          style={{ padding: "4px 8px", fontSize: "12px", width: "auto" }}
                          value={r.status}
                          disabled={updatingId === r.id}
                          onChange={(e) => updateTicketStatus(r.id, e.target.value)}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
