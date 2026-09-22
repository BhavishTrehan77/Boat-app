"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "./lib/api";

const highlights = [
  { value: "< 2s", label: "Lookup Response" },
  { value: "≥ 95%", label: "Search Success" },
  { value: "100%", label: "Official Warranty Data" },
  { value: "Direct", label: "PDF Download" },
];

const features = [
  {
    href: "/warranty",
    icon: "🔍",
    title: "Warranty Lookup",
    desc: "Verify active coverage term, purchase details, and expiration date using your device serial number.",
    linkText: "Check Coverage →",
  },
  {
    href: "/about",
    icon: "⚓",
    title: "About BOAT Hub",
    desc: "Learn about the official digital warranty ecosystem, authentic guarantee, and service infrastructure.",
    linkText: "Learn More →",
  },
  {
    href: "/contact",
    icon: "📞",
    title: "Contact Support",
    desc: "Reach our toll-free helpline, email support, or locate 150+ authorized service centers nationwide.",
    linkText: "Get in Touch →",
  },
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
    if (e && e.preventDefault) e.preventDefault();
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

  const now = new Date();
  const exp = product?.expiryDate ? new Date(product.expiryDate) : null;
  const isExpired = exp && exp < now;
  const daysLeft = exp ? Math.ceil((exp - now) / (1000 * 60 * 60 * 24)) : 0;
  const isExpiringSoon = !isExpired && daysLeft <= 30;

  return (
    <div className="container">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero__intro">
          <span className="hero__eyebrow">⚡ OFFICIAL BOAT WARRANTY PLATFORM</span>
          <h1>
            Claim Your Coverage. <br />
            <span className="highlight">Do What Floats Your BOAT.</span>
          </h1>
          <p>
            Enter your product serial number to verify active warranty status, inspect official repair records, and download digital warranty certificates.
          </p>
          <div className="hero__actions">
            <Link className="btn" href="/warranty">
              <span>Go to Warranty Lookup</span>
              <span>→</span>
            </Link>
            <Link className="btn secondary" href="/about">
              About BOAT Hub
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
              placeholder="Enter serial number (e.g. BOAT-12345)"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Verify Now"}
            </button>
          </form>

          <div style={{ display: "flex", gap: "8px", marginTop: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Quick sample:</span>
            <button
              type="button"
              className="btn secondary"
              style={{ padding: "3px 8px", fontSize: "11.5px" }}
              onClick={() => {
                setSerial("BOAT-12345");
              }}
            >
              BOAT-12345
            </button>
          </div>

          {error && (
            <div className="msg error" style={{ marginTop: "16px" }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Customer Result Card */}
          {product && (
            <div className="card" style={{ marginTop: "20px", background: "rgba(10, 12, 16, 0.95)", border: "1px solid var(--border-brand)" }}>
              {/* Product Details Header & Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Found Product</div>
                  <h3 style={{ fontSize: "20px", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, margin: "2px 0 0" }}>{product.productName}</h3>
                </div>
                {isExpired ? (
                  <span className="tag expired" style={{ fontSize: "12.5px", padding: "5px 12px" }}>✕ Expired</span>
                ) : isExpiringSoon ? (
                  <span className="tag pending" style={{ fontSize: "12.5px", padding: "5px 12px", background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", border: "1px solid #fbbf24" }}>
                    ⚠️ Expiring Soon ({daysLeft}d left)
                  </span>
                ) : (
                  <span className="tag ok" style={{ fontSize: "12.5px", padding: "5px 12px" }}>✓ Active</span>
                )}
              </div>

              {/* Product Info List */}
              <dl className="dl" style={{ marginTop: "14px" }}>
                <dt>Serial Number</dt>
                <dd style={{ fontFamily: "monospace", color: "#ff0038", fontWeight: 700 }}>{product.serialNumber}</dd>
                <dt>Purchase Date</dt>
                <dd>{fmtDate(product.purchaseDate)}</dd>
                <dt>Warranty Expiry</dt>
                <dd>{fmtDate(product.expiryDate)}</dd>
                <dt>Warranty Status</dt>
                <dd style={{ fontWeight: 600, color: isExpired ? "#ef4444" : isExpiringSoon ? "#fbbf24" : "#10b981" }}>
                  {isExpired ? "Expired" : isExpiringSoon ? `Expiring Soon (${daysLeft} days remaining)` : "Active"}
                </dd>
              </dl>

              {/* Repair History Section */}
              <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontSize: "15px", color: "#fff", marginBottom: "10px", fontFamily: "var(--font-display)", fontWeight: 700 }}>
                  Repair History ({product.repairs ? product.repairs.length : 0})
                </h4>
                {product.repairs && product.repairs.length > 0 ? (
                  <div className="list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {product.repairs.map((r) => (
                      <div key={r.id} style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <strong style={{ color: "#fff", fontSize: "14px" }}>{r.issue}</strong>
                          <span className={`tag ${r.status ? r.status.toLowerCase() : "pending"}`} style={{ fontSize: "11px", padding: "2px 8px" }}>
                            {r.status || "PENDING"}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                          Repair Date: {fmtDate(r.repairDate)}
                        </div>
                        {r.description && (
                          <div style={{ fontSize: "12.5px", color: "var(--text-main)", marginTop: "4px" }}>
                            <span style={{ color: "var(--text-muted)" }}>Remarks/Details: </span>
                            {r.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted" style={{ fontSize: "13px", margin: 0 }}>No previous repairs found for this product.</p>
                )}
              </div>

              {/* Warranty PDF Download Section */}
              <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontSize: "15px", color: "#fff", marginBottom: "10px", fontFamily: "var(--font-display)", fontWeight: 700 }}>
                  Warranty PDF Certificate
                </h4>
                {product.documents && product.documents.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {product.documents.map((doc) => (
                      <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255, 255, 255, 0.03)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "18px" }}>📄</span>
                          <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>{doc.fileName || "Warranty Certificate.pdf"}</span>
                        </div>
                        <a
                          href={`/api/warranty/download/${doc.id}`}
                          className="btn"
                          style={{ padding: "6px 14px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          ⬇️ Download PDF
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted" style={{ fontSize: "13px", margin: 0 }}>No warranty certificate PDF has been uploaded for this unit yet.</p>
                )}
              </div>

              {/* Link to Dedicated Product Page */}
              <div style={{ marginTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <Link className="link" href={`/product/${encodeURIComponent(product.serialNumber)}`} style={{ fontSize: "13px", color: "#ff0038", fontWeight: 700 }}>
                  🔗 Open Dedicated Product Page (/product/{product.serialNumber}) →
                </Link>
                <Link className="link" href={`/warranty?serial=${encodeURIComponent(product.serialNumber)}`} style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                  Warranty Lookup Page →
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

      {/* Feature Navigation Cards Grid */}
      <div style={{ marginTop: "60px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, color: "#fff" }}>BOAT Warranty Ecosystem</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "4px" }}>Everything you need for seamless device protection</p>
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

      {/* Guidelines: Where to find Serial Number */}
      <div className="card" style={{ marginTop: "60px", background: "linear-gradient(135deg, rgba(18, 22, 32, 0.9) 0%, rgba(26, 32, 46, 0.7) 100%)", border: "1px solid var(--border-brand)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
          <span style={{ fontSize: "24px" }}>🔎</span>
          <h2 style={{ margin: 0 }}>Where to Find Your Product Serial Number</h2>
        </div>
        <div className="sub" style={{ marginBottom: "20px" }}>Locate the serial number on your BOAT device or packaging</div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "#ff0038", fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>01</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Retail Packaging</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Check the barcode sticker on the back or bottom of your original product box.</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "#ff0038", fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>02</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Charging Case / Device</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>For Airdopes TWS, find the serial printed inside or underneath the charging case lid.</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "#ff0038", fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>03</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Warranty Card</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Locate the physical warranty booklet included with your product accessories.</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "#ff0038", fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>04</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Invoice Receipt</div>
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Your purchase invoice from boat-lifestyle.com, Amazon, or Flipkart lists the serial number.</div>
          </div>
        </div>
      </div>

      {/* Product Lines Showcase */}
      <div style={{ marginTop: "60px", marginBottom: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, color: "#fff" }}>Supported BOAT Product Lines</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Verify warranty and repair history across all official BOAT categories</p>
        </div>

        <div className="grid-cards">
          {productCategories.map((c) => (
            <div key={c.name} className="card" style={{ marginTop: 0, padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "32px" }}>{c.icon}</div>
              <div style={{ fontSize: "12px", color: "#ff0038", fontWeight: 700, textTransform: "uppercase" }}>{c.tag}</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>{c.name}</div>
              <div style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
