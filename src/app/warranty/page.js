"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../lib/api";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function WarrantyContent() {
  const params = useSearchParams();
  const [serial, setSerial] = useState(params.get("serial") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  async function check(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setProduct(null);
    if (!serial.trim()) {
      setError("Please enter a serial number to check warranty");
      return;
    }
    setLoading(true);
    try {
      const res = await api.getWarranty(serial.trim());
      setProduct(res.data);
    } catch (err) {
      setError(err.message || "No product record found for this serial number");
    } finally {
      setLoading(false);
    }
  }

  const active =
    product &&
    product.expiryDate &&
    new Date(product.expiryDate) > new Date();

  useEffect(() => {
    if (params.get("serial")) {
      check();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <div className="hero">
        <div className="hero__intro">
          <span className="hero__eyebrow">🔍 WARRANTY VERIFICATION</span>
          <h1>Verify Your BOAT Coverage</h1>
          <p>
            Enter your product serial number below to inspect warranty validity, repair records, and support documents.
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <form onSubmit={check}>
          <div className="field">
            <label htmlFor="serial">Product Serial Number</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                id="serial"
                className="input"
                placeholder="e.g. BOAT-12345"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn" type="submit" disabled={loading} style={{ minWidth: "140px" }}>
                {loading ? <span className="spinner" /> : "Check Warranty"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Quick sample:</span>
            <button
              type="button"
              className="btn secondary"
              style={{ padding: "4px 10px", fontSize: "12px" }}
              onClick={() => setSerial("BOAT-12345")}
            >
              BOAT-12345
            </button>
          </div>
        </form>

        {error && (
          <div className="msg error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {product && (
          <div className="card" style={{ marginTop: "24px", background: "rgba(10, 12, 16, 0.9)", border: "1px solid var(--border-brand)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Verified Product</span>
                <h2 style={{ fontSize: "24px", color: "#fff" }}>{product.productName}</h2>
              </div>
              <span className={`tag ${active ? "ok" : "expired"}`} style={{ fontSize: "13px", padding: "6px 14px" }}>
                {active ? "✓ WARRANTY ACTIVE" : "✕ WARRANTY EXPIRED"}
              </span>
            </div>

            <dl className="dl" style={{ marginTop: "20px" }}>
              <dt>Serial Number</dt>
              <dd style={{ fontFamily: "monospace", color: "#ff3b68", fontSize: "15px" }}>{product.serialNumber}</dd>
              <dt>Purchase Date</dt>
              <dd>{fmtDate(product.purchaseDate)}</dd>
              <dt>Warranty Period</dt>
              <dd>{product.warrantyMonths} Months</dd>
              <dt>Expiry Date</dt>
              <dd>{fmtDate(product.expiryDate)}</dd>
            </dl>

            {/* Actions Bar */}
            <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link className="btn" href={`/repair?productId=${product.id || ""}`}>
                🛠 Request Service / Repair
              </Link>
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(product.serialNumber);
                  alert("Serial number copied to clipboard!");
                }}
              >
                📋 Copy Serial
              </button>
            </div>

            {/* Repair History Section */}
            <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "12px", fontFamily: "var(--font-display)", fontWeight: 700 }}>
                Service & Repair Records ({product.repairs ? product.repairs.length : 0})
              </h3>
              {product.repairs && product.repairs.length > 0 ? (
                <div className="list">
                  {product.repairs.map((r) => (
                    <div className="item" key={r.id}>
                      <div className="top">
                        <h3>{r.issue}</h3>
                        <span className={`tag ${r.status ? r.status.toLowerCase() : "pending"}`}>
                          {r.status || "PENDING"}
                        </span>
                      </div>
                      <div className="meta">
                        Filed: {fmtDate(r.repairDate)} · Cost: ${r.cost || 0}
                      </div>
                      {r.description && (
                        <div className="meta" style={{ color: "var(--text-main)", marginTop: "8px" }}>
                          "{r.description}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: "14px" }}>No past service or repair tickets filed for this unit.</p>
              )}
            </div>

            {/* Uploaded Documents */}
            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "12px", fontFamily: "var(--font-display)", fontWeight: 700 }}>
                Warranty Documents
              </h3>
              {product.documents && product.documents.length > 0 ? (
                <div className="list">
                  {product.documents.map((d) => (
                    <div className="item" key={d.id}>
                      <a href={d.pdfUrl} target="_blank" rel="noreferrer" style={{ color: "#ff3b68", fontWeight: 700 }}>
                        📄 View Invoice / Warranty PDF ({d.id})
                      </a>
                      <div className="meta">Uploaded: {fmtDate(d.uploadedAt)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: "14px" }}>No digital documents attached to this serial.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WarrantyPage() {
  return (
    <Suspense
      fallback={
        <div className="container">
          <div className="hero">
            <div className="hero__intro">
              <span className="hero__eyebrow">🔍 WARRANTY VERIFICATION</span>
              <h1>Loading Warranty System…</h1>
            </div>
          </div>
        </div>
      }
    >
      <WarrantyContent />
    </Suspense>
  );
}
