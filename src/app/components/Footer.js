"use client";

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__col">
          <Link href="/" className="brand" style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span className="brand__mark" style={{ width: "34px", height: "34px", borderRadius: "10px", background: "var(--brand-gradient)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold" }}>⚓</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", color: "#fff" }}>BOAT Warranty</span>
          </Link>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, maxWidth: "320px", marginBottom: "18px" }}>
            Official Boat Lifestyle warranty verification & support portal. Claim coverage, schedule repairs, and protect your gear.
          </p>
          <div className="pill" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399", borderColor: "rgba(16, 185, 129, 0.25)" }}>
            <span>🟢</span> All Warranty Verification Systems Online
          </div>
        </div>

        <div className="app-footer__col">
          <h4>Portal Services</h4>
          <ul className="app-footer__links">
            <li><Link href="/warranty">Check Serial Coverage</Link></li>
            <li><Link href="/products">Register New Product</Link></li>
            <li><Link href="/repair">Submit Repair Request</Link></li>
            <li><Link href="/user-dashboard">Owner Dashboard</Link></li>
          </ul>
        </div>

        <div className="app-footer__col">
          <h4>Support & Help</h4>
          <ul className="app-footer__links">
            <li><Link href="/auth">Owner Login / Register</Link></li>
            <li><Link href="/dashboard">Admin Analytics</Link></li>
            <li><a href="#faq">Warranty Terms</a></li>
            <li><a href="#contact">Service Centers</a></li>
          </ul>
        </div>

        <div className="app-footer__col">
          <h4>Stay Updated</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "14px" }}>
            Subscribe for product updates, warranty extension offers, and tech tips.
          </p>
          {subscribed ? (
            <div className="msg ok" style={{ marginTop: 0, padding: "10px 14px", fontSize: "13px" }}>
              ✓ Subscribed successfully!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "8px" }}>
              <input
                className="input"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "10px 14px", fontSize: "13.5px" }}
                required
              />
              <button className="btn" type="submit" style={{ padding: "10px 16px", fontSize: "13.5px", whiteSpace: "nowrap" }}>
                Join
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="app-footer__bottom">
        <div>© {new Date().getFullYear()} BOAT Warranty Platform. All rights reserved.</div>
        <div style={{ display: "flex", gap: "20px" }}>
          <a href="#" style={{ color: "var(--text-dim)" }}>Privacy Policy</a>
          <a href="#" style={{ color: "var(--text-dim)" }}>Terms of Service</a>
          <a href="#" style={{ color: "var(--text-dim)" }}>Security</a>
        </div>
      </div>
    </footer>
  );
}
