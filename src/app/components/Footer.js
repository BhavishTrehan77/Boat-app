"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Footer() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
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
          <Link href={isAdmin ? "/admin" : "/"} className="brand" style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span className="brand__mark" style={{ width: "34px", height: "34px", borderRadius: "10px", background: "var(--brand-gradient)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold" }}>⚓</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", color: "#fff" }}>boAt Warranty</span>
          </Link>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, maxWidth: "320px", marginBottom: "18px" }}>
            Official boAt Lifestyle warranty verification & support portal. Claim coverage, view service records, and download warranty PDFs.
          </p>
          <div className="pill" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399", borderColor: "rgba(16, 185, 129, 0.25)" }}>
            <span>🟢</span> All Warranty Lookup Systems Online
          </div>
        </div>

        <div className="app-footer__col">
          <h4>{isAdmin ? "Admin Controls" : "Public Pages"}</h4>
          <ul className="app-footer__links">
            {isAdmin ? (
              <>
                <li><Link href="/admin">Admin Dashboard</Link></li>
                <li><Link href="/admin/products">Product Management</Link></li>
                <li><Link href="/admin/repairs">Repair Management</Link></li>
                <li><Link href="/admin/upload">Upload Warranty PDF</Link></li>
              </>
            ) : (
              <>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/warranty">Warranty Lookup</Link></li>
                <li><Link href="/about">About BOAT Hub</Link></li>
                <li><Link href="/contact">Contact Support</Link></li>
              </>
            )}
          </ul>
        </div>

        <div className="app-footer__col">
          <h4>Customer Support</h4>
          <ul className="app-footer__links">
            <li><Link href="/warranty">Verify Serial Number</Link></li>
            <li><Link href="/contact">Official Support Helpline</Link></li>
            <li><Link href="/contact">Authorized Service Centers</Link></li>
            <li><Link href="/login">Administrator Login</Link></li>
          </ul>
        </div>

        <div className="app-footer__col">
          <h4>Stay Updated</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "14px" }}>
            Subscribe for product care tips, firmware updates, and exclusive BOAT news.
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
        <div>© {new Date().getFullYear()} BOAT Lifestyle. Official Warranty Hub.</div>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link href="/about" style={{ color: "var(--text-dim)" }}>About</Link>
          <Link href="/contact" style={{ color: "var(--text-dim)" }}>Contact</Link>
          <Link href="/login" style={{ color: "var(--text-dim)" }}>Admin Portal</Link>
        </div>
      </div>
    </footer>
  );
}
