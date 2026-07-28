'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (status === 'unauthenticated') {
      router.push('/auth')
      return
    }
    if (status === 'authenticated' && session?.user?.id) {
      fetchUserDashboard()
    }
  }, [status, session, router])

  const fetchUserDashboard = async () => {
    try {
      const res = await fetch(`/api/dashboard/user/${session.user.id}`)
      if (!res.ok) throw new Error('Failed to fetch user dashboard')
      const json = await res.json()
      setData(json.body)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || status === 'loading' || loading) {
    return (
      <main className="user-dashboard-container">
        <p style={{ textAlign: 'center', padding: '3rem' }}>Loading...</p>
      </main>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <main className="user-dashboard-container">
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">👤 My Dashboard</p>
          <h1 className="hero__title">Welcome, {session.user.name}!</h1>
          <p className="hero__description">Your warranties and repair requests at a glance</p>
        </div>
      </section>

      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}

      {data && (
        <section className="user-dashboard__stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>My Products</h3>
              <p className="stat-value">{data.totalProducts}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Active Warranties</h3>
              <p className="stat-value">{data.Warrenties}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <h3>Expired Warranties</h3>
              <p className="stat-value">{data.expired}</p>
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

      <style jsx>{`
        .user-dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .user-dashboard__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-top: 3rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
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

        .error {
          background: #ffe0e0;
          padding: 2rem;
          border-radius: 8px;
          color: var(--brand);
          font-weight: 500;
          margin-top: 2rem;
        }
      `}</style>
    </main>
  )
}
