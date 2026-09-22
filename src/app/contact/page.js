"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    serialNumber: "",
    category: "warranty",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSubmitted(true);
    }
  }

  return (
    <div className="container">
      {/* Hero Header */}
      <div className="hero" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className="hero__eyebrow">📞 OFFICIAL BOAT ASSISTANCE</span>
        <h1 style={{ maxWidth: "800px" }}>
          Get in Touch With <span className="highlight">BOAT Support</span>
        </h1>
        <p style={{ maxWidth: "640px", margin: "0 auto 20px" }}>
          Have questions regarding warranty coverage, service drop-offs, or replacement parts? Our dedicated support team is here to help.
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginTop: "30px" }}>
        <div className="card" style={{ marginTop: 0, padding: "24px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>📞</div>
          <h3 style={{ color: "#fff", fontSize: "17px", marginBottom: "6px" }}>Toll-Free Helpline</h3>
          <div style={{ color: "#ff0038", fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-display)" }}>
            1800-266-BOAT (2628)
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px" }}>
            Mon - Sat: 9:00 AM – 7:00 PM IST
          </div>
        </div>

        <div className="card" style={{ marginTop: 0, padding: "24px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>✉️</div>
          <h3 style={{ color: "#fff", fontSize: "17px", marginBottom: "6px" }}>Email Support</h3>
          <div style={{ color: "#ff0038", fontSize: "15px", fontWeight: 700 }}>
            support@boat-lifestyle.com
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px" }}>
            Average response time: &lt; 24 hours
          </div>
        </div>

        <div className="card" style={{ marginTop: 0, padding: "24px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>🏢</div>
          <h3 style={{ color: "#fff", fontSize: "17px", marginBottom: "6px" }}>Service Centers</h3>
          <div style={{ color: "var(--text-main)", fontSize: "15px", fontWeight: 600 }}>
            150+ Nationwide Locations
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px" }}>
            Delhi, Mumbai, Bengaluru, Chennai & more
          </div>
        </div>

        <div className="card" style={{ marginTop: 0, padding: "24px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>💬</div>
          <h3 style={{ color: "#fff", fontSize: "17px", marginBottom: "6px" }}>Online Warranty Lookup</h3>
          <div style={{ color: "#10b981", fontSize: "15px", fontWeight: 700 }}>
            Self-Service 24/7
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px" }}>
            Verify serial numbers instantly
          </div>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="card" style={{ maxWidth: "760px", margin: "40px auto 0", padding: "34px", border: "1px solid var(--border-brand)" }}>
        <h2 style={{ fontSize: "22px", color: "#fff", marginBottom: "6px" }}>Submit an Assistance Request</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
          Fill in your details below and a certified BOAT service executive will follow up with you.
        </p>

        {submitted ? (
          <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid #10b981", padding: "24px", borderRadius: "12px", textAlign: "center" }}>
            <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>✓</span>
            <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "6px" }}>Inquiry Submitted Successfully!</h3>
            <p style={{ color: "var(--text-main)", fontSize: "14px", margin: "0 auto", maxWidth: "480px" }}>
              Thank you, <strong>{form.name}</strong>. Your ticket has been logged with BOAT Support. Our team will contact you at <strong>{form.email}</strong> within 24 hours.
            </p>
            <button
              className="btn secondary"
              style={{ marginTop: "18px" }}
              onClick={() => {
                setSubmitted(false);
                setForm({ name: "", email: "", serialNumber: "", category: "warranty", message: "" });
              }}
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div className="field">
                <label>Your Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Aman Gupta"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Email Address *</label>
                <input
                  className="input"
                  type="email"
                  placeholder="e.g. aman@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div className="field">
                <label>Product Serial Number (Optional)</label>
                <input
                  className="input"
                  placeholder="e.g. BOAT-12345"
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Inquiry Category</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="warranty">Warranty Status & Claims</option>
                  <option value="repair">Service Center & Repair Progress</option>
                  <option value="certificate">Warranty PDF Download Issue</option>
                  <option value="hardware">Hardware / Audio Performance</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Message / Issue Details *</label>
              <textarea
                className="input"
                rows={4}
                placeholder="Describe your query or hardware issue..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn" style={{ width: "100%", padding: "12px", fontSize: "15px", marginTop: "10px" }}>
              Send Message to Support →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
