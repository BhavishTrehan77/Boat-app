'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }
    if (status === 'authenticated' && session?.user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/dashboard/user/${session.user.id}`);
          if (!res.ok) throw new Error('Failed to fetch user dashboard statistics');
          const json = await res.json();
          setData(json.body);
        } catch (err) {
          setError(err.message);
          console.error(err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [status, session, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner" style={{ width: '32px', height: '32px', borderThickness: '3px' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading your owner dashboard...</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="hero__intro" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
          <span className="hero__eyebrow">👤 PERSONAL DASHBOARD</span>
          <h1>Welcome, <span className="highlight">{session.user.name}</span>!</h1>
          <p>Overview of your registered BOAT hardware, warranty status, and service tickets.</p>
        </div>
      </div>

      {error && (
        <div className="msg error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {data && (
        <div className="grid-cards" style={{ marginTop: '20px' }}>
          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>📦</div>
            <div className="feature-card__title">Total Registered Devices</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#fff' }}>
              {data.totalProducts ?? 0}
            </div>
            <div className="feature-card__desc">Devices linked to your owner ID</div>
            <Link href="/products" className="feature-card__link">Manage Hardware Catalog →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>✓</div>
            <div className="feature-card__title">Active Warranties</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#34d399' }}>
              {data.Warrenties ?? 0}
            </div>
            <div className="feature-card__desc">Devices currently covered</div>
            <Link href="/warranty" className="feature-card__link">Verify Coverage →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#ff6b81' }}>⌛</div>
            <div className="feature-card__title">Expired Warranties</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#ff6b81' }}>
              {data.expired ?? 0}
            </div>
            <div className="feature-card__desc">Term lapsed devices</div>
            <Link href="/warranty" className="feature-card__link">View Details →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>🔧</div>
            <div className="feature-card__title">Pending Service</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#fbbf24' }}>
              {data.pendingRepairs ?? 0}
            </div>
            <div className="feature-card__desc">Active inspection requests</div>
            <Link href="/repair" className="feature-card__link">Track Service →</Link>
          </div>

          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>🏁</div>
            <div className="feature-card__title">Completed Repairs</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#34d399' }}>
              {data.completedRepairs ?? 0}
            </div>
            <div className="feature-card__desc">Resolved repair tickets</div>
            <Link href="/repair" className="feature-card__link">Repair History →</Link>
          </div>
        </div>
      )}

      {/* Quick Action Shortcuts */}
      <div className="card" style={{ marginTop: '40px' }}>
        <h2>Quick Shortcuts</h2>
        <div className="sub">Common tasks for BOAT owners</div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '14px' }}>
          <Link href="/warranty" className="btn">
            🔍 Check Any Serial
          </Link>
          <Link href="/products" className="btn secondary">
            ➕ Register New Product
          </Link>
          <Link href="/repair" className="btn secondary">
            🛠️ Submit Repair Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}
