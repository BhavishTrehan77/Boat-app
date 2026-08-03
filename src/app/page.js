"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "./lib/api";

const features = [
  {
    href: "/warranty",
    icon: "🔍",
    title: "Warranty Verification",
    desc: "Instantly check your device's warranty status, coverage expiry, and complete service history with your serial number.",
    linkText: "Check Coverage →",
  },
  {
    href: "/products",
    icon: "🎧",
    title: "Products Hub",
    desc: "Register new BOAT audio and smartwear devices, view all linked hardware, and manage purchase receipts.",
    linkText: "Manage Products →",
  },
  {
    href: "/repair",
    icon: "🛠️",
    title: "Service Center",
    desc: "Raise official repair requests, schedule device inspections, and track service status from pending to completion.",
    linkText: "Request Service →",
  },
  {
    href: "/auth",
    icon: "🔐",
    title: "Owner Access",
    desc: "Sign in to your owner account for personalized warranty access, saved products, and expedited support.",
    linkText: "Sign In / Register →",
  },
];

const highlights = [
  { value: "24/7", label: "Automated Lookup" },
  { value: "< 2s", label: "Serial Verification" },
  { value: "100%", label: "Verified BOAT Support" },
  { value: "Direct", label: "Repair Tracking" },
];

const productCategories = [
  { name: "Airdopes TWS", tag: "Wireless Earbuds", desc: "Active Noise Cancellation & Immersive Audio", icon: "🎵" },
  { name: "Rockerz Series", tag: "Headphones", desc: "High Bass & Long Battery Life", icon: "🎧" },
  { name: "Wave Smartwatches", tag: "Wearables", desc: "Fitness Tracking & Bluetooth Calling", icon: "⌚" },
  { name: "Stone Speakers", tag: "Portable Audio", desc: "Rugged Water-Resistant Sound", icon: "🔊" },
];

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Home() {
  const [serial, setSerial] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  async function search(e) {
    e.preventDefault();
    setError("");
    setProduct(null);
    if (!serial.trim()) {
      setError("Please enter a valid product serial number");
      return;
    }
    setLoading(true);
    try {
      const res = await api.getWarranty(serial.trim());
      setProduct(res.data);
    } catch (err) {
      setError(err.message || "Product serial not found in our database");
    } finally {
      setLoading(false);
    }
  }

  const active =
    product &&
    product.expiryDate &&
    new Date(product.expiryDate) > new Date();

  return (
    <div className="container">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero__intro">
          <span className="hero__eyebrow">⚡ OFFICIAL BOAT SUPPORT PORTAL</span>
          <h1>
            Claim Your Coverage. <br />
            <span className="highlight">Do What Floats Your BOAT.</span>
          </h1>
          <p>
            Check your warranty coverage, register newly purchased audio gear, and request official repair services seamlessly.
          </p>
          <div className="hero__actions">
            <Link className="btn" href="/warranty">
              <span>Verify Serial Coverage</span>
              <span>→</span>
            </Link>
            <Link className="btn secondary" href="/products">
              Register New Device
            </Link>
          </div>
        </div>

        {/* Live Warranty Lookup Panel */}
        <div className="hero__panel">
          <div className="hero__panel-top">
            <div className="hero__panel-title">
              <span style={{ fontSize: "20px" }}>🔎</span>
              <span>Instant Serial Lookup</span>
            </div>
            <span className="pill">
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              Live DB Lookup
            </span>
          </div>

          <form className="hero__search" onSubmit={search}>
            <input
              className="input"
              placeholder="Enter product serial number (e.g. BOAT-12345)"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Verify Now"}
            </button>
          </form>

          {error && (
            <div className="msg error" style={{ marginTop: "16px" }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {product && (
            <div className="card" style={{ marginTop: "20px", background: "rgba(10, 12, 16, 0.8)", border: "1px solid var(--border-brand)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Found Product</div>
                  <h3 style={{ fontSize: "20px", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700 }}>{product.productName}</h3>
                </div>
                <span className={`tag ${active ? "ok" : "expired"}`}>
                  {active ? "✓ WARRANTY ACTIVE" : "✕ WARRANTY EXPIRED"}
                </span>
              </div>

              <dl className="dl" style={{ marginTop: "16px" }}>
                <dt>Serial Number</dt>
                <dd style={{ fontFamily: "monospace", color: "#ff3b68" }}>{product.serialNumber}</dd>
                <dt>Purchase Date</dt>
                <dd>{fmtDate(product.purchaseDate)}</dd>
                <dt>Warranty Expiry</dt>
                <dd>{fmtDate(product.expiryDate)}</dd>
                <dt>Repairs Filed</dt>
                <dd>{product.repairs ? product.repairs.length : 0} record(s)</dd>
              </dl>

              <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
                <Link className="btn" href={`/warranty?serial=${encodeURIComponent(product.serialNumber)}`} style={{ padding: "10px 18px", fontSize: "13.5px" }}>
                  Full Details & History
                </Link>
                <Link className="btn secondary" href={`/repair?productId=${product.id || ""}`} style={{ padding: "10px 18px", fontSize: "13.5px" }}>
                  Raise Repair Ticket
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Highlighting Stats */}
        <div className="hero__stats">
          {highlights.map((item) => (
            <div className="stat" key={item.label}>
              <div className="num">{item.value}</div>
              <div className="lbl">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div style={{ marginTop: "60px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 800, color: "#fff" }}>BOAT Support Ecosystem</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", marginTop: "6px" }}>Everything you need to keep your gear protected and performing</p>
        </div>

        <div className="grid-cards">
          {features.map((f) => (
            <Link href={f.href} key={f.href} className="feature-card">
              <div className="feature-card__icon">{f.icon}</div>
              <div className="feature-card__title">{f.title}</div>
              <div className="feature-card__desc">{f.desc}</div>
              <div className="feature-card__link">{f.linkText}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Product Lines Showcase */}
      <div style={{ marginTop: "70px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, color: "#fff" }}>Covered BOAT Product Lines</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "4px" }}>Register and verify warranty across all official BOAT categories</p>
        </div>

        <div className="grid-cards">
          {productCategories.map((c) => (
            <div key={c.name} className="card" style={{ marginTop: 0, padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "32px" }}>{c.icon}</div>
              <div style={{ fontSize: "12px", color: "#ff3b68", fontWeight: 700, textTransform: "uppercase" }}>{c.tag}</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>{c.name}</div>
              <div style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Process Card */}
      <div className="card" style={{ marginTop: "60px", background: "linear-gradient(135deg, rgba(18, 22, 32, 0.9) 0%, rgba(26, 32, 46, 0.7) 100%)", border: "1px solid var(--border-brand)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
          <span style={{ fontSize: "24px" }}>🛡️</span>
          <h2 style={{ margin: 0 }}>Standard BOAT Warranty Guidelines</h2>
        </div>
        <div className="sub" style={{ marginBottom: "20px" }}>Follow these simple steps for quick service processing</div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "#ff3b68", fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>01</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Register Device</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Input serial number & purchase details into your Owner Dashboard.</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "#ff3b68", fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>02</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Check Active Term</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Verify your remaining months of coverage anytime with one click.</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "#ff3b68", fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>03</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Request Repair</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Log issue details and initiate hassle-free service center inspection.</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "#ff3b68", fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>04</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Track Resolution</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Follow real-time repair status updates until your gear is back with you.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
