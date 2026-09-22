'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repairsLoading, setRepairsLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch platform dashboard statistics');
      const json = await res.json();
      setData(json.body);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepairs = async () => {
    setRepairsLoading(true);
    try {
      const res = await api.getRepairs();
      setRepairs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRepairsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setDocsLoading(true);
    try {
      const res = await api.getWarrantyDocuments();
      setDocuments(res.body || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDocsLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    try {
      await api.patchRepair(ticketId, { status: newStatus });
      await Promise.all([fetchDashboard(), fetchRepairs()]);
    } catch (err) {
      alert(err.message || 'Failed to update repair status');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
      fetchDashboard();
      fetchRepairs();
      fetchDocuments();
    }
  }, [status, session, router]);

  return (
    <div className="container">
      <div className="hero">
        <div className="hero__intro" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
          <span className="hero__eyebrow">📊 PLATFORM ANALYTICS</span>
          <h1>Admin Management Console</h1>
          <p>Real-time analytics and platform metrics across all registered BOAT products, users, and repair tickets.</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#fff' }}>Platform Key Indicators</h2>
        <button className="btn secondary" onClick={fetchDashboard} style={{ padding: '8px 16px', fontSize: '13.5px' }}>
          🔄 Refresh Metrics
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', borderThickness: '3px' }} />
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Fetching live analytics...</p>
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
            <div className="feature-card__icon" style={{ background: 'rgba(255, 0, 56, 0.15)', color: '#ff3b68' }}>👥</div>
            <div className="feature-card__title">Total Registered Accounts</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, color: '#fff' }}>
              {data.totalUsers ?? 0}
            </div>
            <div className="feature-card__desc">Owner accounts on platform</div>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>📦</div>
            <div className="feature-card__title">Registered Products</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, color: '#fff' }}>
              {data.totalProducts ?? 0}
            </div>
            <div className="feature-card__desc">Total serials registered across platform</div>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>✓</div>
            <div className="feature-card__title">Active Warranties</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, color: '#34d399' }}>
              {data.activeWarranty ?? 0}
            </div>
            <div className="feature-card__desc">Devices currently under valid coverage</div>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#ff6b81' }}>⌛</div>
            <div className="feature-card__title">Expired Warranties</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, color: '#ff6b81' }}>
              {data.expiredWarranty ?? 0}
            </div>
            <div className="feature-card__desc">Term expired hardware</div>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>🔧</div>
            <div className="feature-card__title">Pending Service Requests</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, color: '#fbbf24' }}>
              {data.pendingRepairs ?? 0}
            </div>
            <div className="feature-card__desc">Unresolved repair tickets</div>
            <Link href="/repair" className="feature-card__link">Inspect Repair Queue →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>🏁</div>
            <div className="feature-card__title">Completed Repairs</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, color: '#34d399' }}>
              {data.completedRepairs ?? 0}
            </div>
            <div className="feature-card__desc">Resolved repair service tickets</div>
            <Link href="/repair" className="feature-card__link">Repair History →</Link>
          </div>
        </div>
      )}

      {/* Health Overview Bar */}
      <div className="card" style={{ marginTop: '40px' }}>
        <h2>System Health & Warranty Operations</h2>
        <div className="sub">Automated verification status and queue balance</div>

        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Warranty Health Ratio</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>
                {data.totalProducts > 0 ? Math.round((data.activeWarranty / data.totalProducts) * 100) : 0}% Active
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", marginTop: "8px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${data.totalProducts > 0 ? Math.round((data.activeWarranty / data.totalProducts) * 100) : 0}%`, background: "#34d399" }} />
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Repair Resolution Rate</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#60a5fa", marginTop: "4px" }}>
                {(data.pendingRepairs + data.completedRepairs) > 0 ? Math.round((data.completedRepairs / (data.pendingRepairs + data.completedRepairs)) * 100) : 100}% Resolved
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", marginTop: "8px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(data.pendingRepairs + data.completedRepairs) > 0 ? Math.round((data.completedRepairs / (data.pendingRepairs + data.completedRepairs)) * 100) : 100}%`, background: "#60a5fa" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service & Repair Ticket Management Queue */}
      <div className="card" style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2>🛠️ Service & Repair Ticket Management</h2>
            <div className="sub" style={{ marginBottom: 0 }}>
              Track all customer repair tickets and update progress (Pending, In Progress, Completed)
            </div>
          </div>
          <button className="btn secondary" onClick={fetchRepairs} style={{ padding: '8px 14px', fontSize: '13px' }}>
            🔄 Refresh Queue
          </button>
        </div>

        {repairsLoading && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 8px' }} />
            Loading repair queue...
          </div>
        )}

        {!repairsLoading && repairs.length === 0 && (
          <p className="muted" style={{ padding: '20px 0' }}>No active repair tickets found in the system.</p>
        )}

        <div className="list">
          {repairs.map((r) => {
            const statusKey = (r.status || "PENDING").toLowerCase();
            return (
              <div className="item" key={r.id}>
                <div className="top">
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      Ticket <span style={{ color: "#ff3b68", fontFamily: "monospace", fontWeight: "700" }}>#{r.id}</span> · Linked Product: <span style={{ color: "#fff", fontWeight: 600 }}>{r.product?.productName || `Product #${r.productId}`}</span> ({r.product?.serialNumber || 'No SN'})
                    </div>
                    <h3 style={{ fontSize: "18px" }}>{r.issue}</h3>
                  </div>
                  <span className={`tag ${statusKey}`}>
                    {r.status || "PENDING"}
                  </span>
                </div>

                <div className="meta" style={{ marginTop: "10px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <div>Filed Date: <span style={{ color: "#fff" }}>{r.repairDate ? new Date(r.repairDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span></div>
                  <div>Estimated Cost: <span style={{ color: "#fff" }}>${r.cost || 0}</span></div>
                  {r.product?.userId && <div>Owner Account: <span style={{ color: "#fff" }}>User #{r.product.userId}</span></div>}
                </div>

                {r.description && (
                  <div style={{ marginTop: "10px", background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: "8px", fontSize: "13.5px", color: "var(--text-main)", borderLeft: "3px solid var(--brand)" }}>
                    {r.description}
                  </div>
                )}

                {/* Admin Status Controls */}
                <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>
                    ⚡ Update Status:
                  </span>
                  {[
                    { key: "PENDING", label: "Pending" },
                    { key: "IN_PROGRESS", label: "In Progress" },
                    { key: "COMPLETED", label: "Completed" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      className={`btn ${r.status === key ? "" : "secondary"}`}
                      disabled={updatingId === r.id || r.status === key}
                      style={{ padding: "5px 12px", fontSize: "12px" }}
                      onClick={() => updateTicketStatus(r.id, key)}
                    >
                      {updatingId === r.id ? "…" : label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Warranty Documents & Downloads (Admin Feature) */}
      <div className="card" style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2>📄 Customer Warranty Documents & Uploads</h2>
            <div className="sub" style={{ marginBottom: 0 }}>
              Download customer-uploaded warranty cards, invoices, receipts, and hardware photos
            </div>
          </div>
          <button className="btn secondary" onClick={fetchDocuments} style={{ padding: '8px 14px', fontSize: '13px' }}>
            🔄 Refresh Documents
          </button>
        </div>

        {docsLoading && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 8px' }} />
            Loading warranty documents...
          </div>
        )}

        {!docsLoading && documents.length === 0 && (
          <p className="muted" style={{ padding: '20px 0' }}>No customer warranty documents or images uploaded yet.</p>
        )}

        <div className="list">
          {documents.map((doc) => {
            const isImg = /\.(png|jpe?g|webp|gif)$/i.test(doc.fileName || doc.fileUrl);
            return (
              <div className="item" key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '26px' }}>{isImg ? '🖼️' : '📄'}</span>
                  <div>
                    <h3 style={{ fontSize: '16px' }}>{doc.fileName || `Document #${doc.id}`}</h3>
                    <div className="meta" style={{ marginTop: '2px' }}>
                      Product: <strong style={{ color: '#fff' }}>{doc.product?.productName || `Product #${doc.productId}`}</strong>
                      {doc.product?.serialNumber && ` (${doc.product.serialNumber})`}
                      {doc.product?.user && ` · Owner: ${doc.product.user.name || doc.product.user.email}`}
                      {` · Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn secondary" style={{ padding: '6px 12px', fontSize: '12.5px' }}>
                    View ↗
                  </a>
                  <a href={`/api/warranty/download/${doc.id}`} className="btn" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
                    ⬇️ Download {isImg ? 'Image' : 'PDF'}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
