"use client";

import Link from "next/link";

export default function AboutPage() {
  const stats = [
    { label: "Authorized Service Centers", value: "150+" },
    { label: "Average Lookup Response", value: "< 2s" },
    { label: "Warranty Verification Accuracy", value: "100%" },
    { label: "Happy boAtheads Served", value: "5M+" },
  ];

  const pillars = [
    {
      icon: "⚡",
      title: "Instant Self-Service",
      desc: "No more waiting on calls or scouring old invoice receipts. Customers verify active warranty status in under 2 seconds using only their serial number.",
    },
    {
      icon: "🛡️",
      title: "100% Authentic Guarantee",
      desc: "Every serial number is verified against the official BOAT hardware registry, assuring you own genuine audio gear with authentic manufacturer protection.",
    },
    {
      icon: "📋",
      title: "Transparent Service History",
      desc: "Complete visibility into past repair tickets, service inspection remarks, parts replacements, and official resolution timestamps.",
    },
    {
      icon: "📄",
      title: "Digital Certificate Access",
      desc: "Instant, anytime download of your official digital warranty certificate in PDF format for insurance, claims, or personal recordkeeping.",
    },
  ];

  return (
    <div className="container">
      {/* Hero Section */}
      <div className="hero" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className="hero__eyebrow">⚓ ABOUT BOAT WARRANTY HUB</span>
        <h1 style={{ maxWidth: "800px" }}>
          Empowering Every boAthead With <br />
          <span className="highlight">Instant & Transparent Protection.</span>
        </h1>
        <p style={{ maxWidth: "680px", margin: "0 auto 24px" }}>
          BOAT Warranty Hub is the official digital support platform for BOAT audio and smartwear owners. We eliminate paperwork delays and give you immediate access to your warranty coverage, repair timeline, and digital certificates.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link href="/warranty" className="btn">
            Check Your Warranty →
          </Link>
          <Link href="/contact" className="btn secondary">
            Contact Support
          </Link>
        </div>
      </div>

      {/* High-Impact Stats */}
      <div className="card" style={{ marginTop: "40px", background: "linear-gradient(135deg, rgba(18, 22, 32, 0.9) 0%, rgba(26, 32, 46, 0.7) 100%)", border: "1px solid var(--border-brand)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", textAlign: "center" }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: "36px", fontWeight: 800, color: "#ff0038", fontFamily: "var(--font-display)" }}>{s.value}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Mission */}
      <div style={{ marginTop: "60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px", alignItems: "center" }}>
        <div className="card">
          <span style={{ fontSize: "28px", display: "block", marginBottom: "12px" }}>🎯</span>
          <h2 style={{ fontSize: "24px", color: "#fff", marginBottom: "12px" }}>Our Mission</h2>
          <p style={{ color: "var(--text-main)", lineHeight: 1.7, fontSize: "14.5px" }}>
            At BOAT, we engineer gear that floats your boat — whether you are crushing workouts with Airdopes, feeling the bass with Rockerz, tracking fitness with Wave, or pumping tunes with Stone speakers.
          </p>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "14px", marginTop: "12px" }}>
            The Warranty Hub was architected to make customer support as effortless as pairing Bluetooth. We believe warranty claims should be friction-free, fully digitized, and accessible 24/7 without needing accounts, passwords, or customer service hold queues.
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: "28px", display: "block", marginBottom: "12px" }}>🏢</span>
          <h2 style={{ fontSize: "24px", color: "#fff", marginBottom: "12px" }}>Support Network</h2>
          <p style={{ color: "var(--text-main)", lineHeight: 1.7, fontSize: "14.5px" }}>
            Backed by over 150+ certified service centers nationwide, certified technicians inspect, service, and calibrate your devices using original manufacturer replacement components.
          </p>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "14px", marginTop: "12px" }}>
            Every repair logged in our system updates in real time, giving you verified tracking from initial drop-off to testing and completion.
          </p>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div style={{ marginTop: "70px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, color: "#fff" }}>Why boAtheads Trust The Warranty Hub</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "4px" }}>Built to deliver speed, reliability, and peace of mind</p>
        </div>

        <div className="grid-cards">
          {pillars.map((p) => (
            <div key={p.title} className="feature-card">
              <div className="feature-card__icon">{p.icon}</div>
              <div className="feature-card__title">{p.title}</div>
              <div className="feature-card__desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="card" style={{ marginTop: "60px", textAlign: "center", padding: "40px 24px", background: "linear-gradient(135deg, rgba(255, 0, 56, 0.12) 0%, rgba(14, 17, 23, 0.8) 100%)", border: "1px solid var(--border-brand)" }}>
        <h2 style={{ fontSize: "26px", color: "#fff", marginBottom: "8px" }}>Ready to check your coverage?</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14.5px", maxWidth: "540px", margin: "0 auto 20px" }}>
          Grab your serial number from your product box, charging case, or invoice and verify your warranty in seconds.
        </p>
        <Link href="/warranty" className="btn" style={{ padding: "12px 28px", fontSize: "15px" }}>
          Verify Your Product Now →
        </Link>
      </div>
    </div>
  );
}
