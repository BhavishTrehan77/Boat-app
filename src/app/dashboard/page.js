'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard');
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
    <>
      <main className="dashboard-container">
        <section className="hero">
          <div className="hero__content">
            <p className="hero__eyebrow">📊 Admin Dashboard</p>
            <h1 className="hero__title">Platform Analytics</h1>
            <p className="hero__description">Real-time overview of your BOAT warranty platform</p>
          </div>
        </section>

        {loading && (
          <div className="loading">
            <p>Loading dashboard...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>Error: {error}</p>
          </div>
        )}

        {data && (
          <section className="dashboard__stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-value">{data.totalUsers}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>Total Products</h3>
                <p className="stat-value">{data.totalProducts}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Active Warranties</h3>
                <p className="stat-value">{data.activeWarranty}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <h3>Expired Warranties</h3>
                <p className="stat-value">{data.expiredWarranty}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔧</div>
              <div className="stat-content">
                <h3>Pending Repairs</h3>
                <p className="stat-value">{data.pendingRepairs}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✓</div>
              <div className="stat-content">
                <h3>Completed Repairs</h3>
                <p className="stat-value">{data.completedRepairs}</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <style jsx>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .dashboard__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          box-shadow: 0 2px 12px rgba(226, 31, 47, 0.1);
          border-left: 4px solid var(--brand);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(226, 31, 47, 0.15);
        }

        .stat-icon {
          font-size: 2.5rem;
          min-width: 60px;
        }

        .stat-content h3 {
          font-size: 0.9rem;
          color: #666;
          margin: 0 0 0.5rem 0;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--brand);
          margin: 0;
        }

        .loading, .error {
          text-align: center;
          padding: 3rem 1rem;
          font-size: 1.1rem;
          color: #666;
        }

        .error {
          background: #ffe0e0;
          padding: 2rem;
          border-radius: 8px;
          color: var(--brand);
          font-weight: 500;
        }
      `}</style>
    </>
  );
}
