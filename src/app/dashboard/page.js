'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, []);

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
            <div className="feature-card__desc">Total serials registered</div>
            <Link href="/products" className="feature-card__link">View Products →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>✓</div>
            <div className="feature-card__title">Active Warranties</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, color: '#34d399' }}>
              {data.activeWarranty ?? 0}
            </div>
            <div className="feature-card__desc">Valid coverage active</div>
            <Link href="/warranty" className="feature-card__link">Warranty Lookup →</Link>
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
    </div>
  );
}
