"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "./lib/api";

const features = [
  {
    href: "/warranty",
    title: "Warranty Check",
    desc: "Verify coverage instantly and view every repair detail tied to your BOAT product.",
  },
  {
    href: "/products",
    title: "Product Hub",
    desc: "Register new products and keep every purchase organized in one place.",
  },
  {
    href: "/repair",
    title: "Service Requests",
    desc: "Submit support requests and track every repair from pending to completed.",
  },
  {
    href: "/auth",
    title: "Owner Access",
    desc: "Create your account and manage warranty support with secure, simple sign-in.",
  },
];

const highlights = [
  { value: "24/7", label: "Support visibility" },
  { value: "Instant", label: "Serial lookup" },
  { value: "Trusted", label: "Repair tracking" },
];

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
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
      setError("Please enter a serial number");
      return;
    }
    setLoading(true);
    try {
      const res = await api.getWarranty(serial.trim());
      setProduct(res.data);
    } catch (err) {
      setError(err.message || "Product not found");
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
      <div className="hero">
        <div className="hero__intro">
          <span className="hero__eyebrow">⚓ BOAT warranty portal</span>
          <h1>Own the experience with a premium BOAT warranty platform.</h1>
          <p>
            Check your coverage, review service history, and manage every product with confidence through a polished, real-world support experience.
          </p>
          <div className="hero__actions">
            <Link className="btn" href="/warranty">
              Check Warranty
            </Link>
            <Link className="btn secondary" href="/products">
              Manage Products
            </Link>
          </div>
        </div>

        <div className="hero__panel">
          <div className="hero__panel-top">
            <div className="hero__panel-title">Instant warranty lookup</div>
            <span className="pill">Live support status</span>
          </div>

          <form className="hero__search" onSubmit={search}>
            <input
              className="input"
              placeholder="Enter warranty serial number (e.g. BOAT-12345)"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Searching…" : "Search"}
            </button>
          </form>

          {error && <div className="msg error">{error}</div>}

          {product && (
            <div className="card" style={{ marginTop: 18, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <h2 style={{ fontSize: 18 }}>{product.productName}</h2>
                <span className={`tag ${active ? "ok" : "expired"}`}>
                  {active ? "ACTIVE" : "EXPIRED"}
                </span>
              </div>
              <dl className="dl">
                <dt>Serial Number</dt>
                <dd>{product.serialNumber}</dd>
                <dt>Purchase Date</dt>
                <dd>{fmtDate(product.purchaseDate)}</dd>
                <dt>Expiry Date</dt>
                <dd>{fmtDate(product.expiryDate)}</dd>
                <dt>Repairs</dt>
                <dd>{product.repairs ? product.repairs.length : 0}</dd>
              </dl>
              <Link className="btn" href={`/warranty?serial=${encodeURIComponent(product.serialNumber)}`} style={{ marginTop: 14 }}>
                View Full Details
              </Link>
            </div>
          )}
        </div>

        <div className="hero__stats">
          {highlights.map((item) => (
            <div className="stat" key={item.label}>
              <div className="num">{item.value}</div>
              <div className="lbl">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-cards">
        {features.map((f) => (
          <Link href={f.href} key={f.href} className="feature-card">
            <div className="feature-card__title">{f.title}</div>
            <div className="feature-card__desc">{f.desc}</div>
            <div className="feature-card__link">Open flow →</div>
          </Link>
        ))}
      </div>

      <div className="card">
        <h2>Built for real BOAT ownership</h2>
        <div className="sub">A seamless support experience designed to feel like a modern brand platform</div>
        <ol style={{ marginLeft: 18, color: "var(--muted)", lineHeight: 1.8 }}>
          <li>Register your account and keep your personal support access secure.</li>
          <li>Create products and link them to your warranty records.</li>
          <li>Check a product instantly using its serial number.</li>
          <li>Raise repair requests and follow every update with clarity.</li>
        </ol>
      </div>
    </div>
  );
}
