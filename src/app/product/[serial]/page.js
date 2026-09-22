"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProductDetailPage({ params }) {
  const unwrappedParams = use(params);
  const serial = unwrappedParams?.serial ? decodeURIComponent(unwrappedParams.serial) : "";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!serial) return;
    setLoading(true);
    setError(null);
    api.getWarranty(serial)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => {
        setError(err.message || "Product with this serial number was not found in our database.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [serial]);

  const now = new Date();
  const exp = product?.expiryDate ? new Date(product.expiryDate) : null;
  const isExpired = exp && exp < now;
  const daysLeft = exp ? Math.ceil((exp - now) / (1000 * 60 * 60 * 24)) : 0;
  const isExpiringSoon = !isExpired && daysLeft <= 30;

  const handleCopy = () => {
    if (product?.serialNumber) {
      navigator.clipboard.writeText(product.serialNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "860px" }}>
      {/* Back link */}
      <div style={{ marginBottom: "20px" }}>
        <Link href="/warranty" className="link" style={{ fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          ← Back to Warranty Lookup
        </Link>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ color: "#fff" }}>Loading Official Product Record...</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Verifying serial number {serial} with BOAT registry...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: "center", padding: "50px 24px", border: "1px solid var(--danger)" }}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>⚠️</span>
          <h2 style={{ color: "#fff", fontSize: "22px", marginBottom: "8px" }}>Product Not Found</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14.5px", maxWidth: "520px", margin: "0 auto 24px" }}>
            No verified warranty record was found for serial number <code style={{ color: "#ff0038", background: "rgba(255,0,56,0.1)", padding: "2px 6px", borderRadius: "4px" }}>{serial}</code>.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/warranty" className="btn">
              Try Another Serial Number
            </Link>
            <Link href="/contact" className="btn secondary">
              Contact Support
            </Link>
          </div>
        </div>
      ) : product ? (
        <div className="card" style={{ background: "rgba(10, 12, 16, 0.95)", border: "1px solid var(--border-brand)", padding: "32px" }}>
          {/* Header & Status Badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                Official BOAT Hardware
              </div>
              <h1 style={{ fontSize: "28px", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, margin: "4px 0 0" }}>
                {product.productName}
              </h1>
            </div>

            <div>
              {isExpired ? (
                <span className="tag expired" style={{ fontSize: "13px", padding: "6px 14px" }}>✕ Expired</span>
              ) : isExpiringSoon ? (
                <span className="tag pending" style={{ fontSize: "13px", padding: "6px 14px", background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", border: "1px solid #fbbf24" }}>
                  ⚠️ Expiring Soon ({daysLeft}d left)
                </span>
              ) : (
                <span className="tag ok" style={{ fontSize: "13px", padding: "6px 14px" }}>✓ Active</span>
              )}
            </div>
          </div>

          {/* Product Specifications Grid */}
          <dl className="dl" style={{ marginTop: "24px" }}>
            <dt>Serial Number</dt>
            <dd style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontFamily: "monospace", color: "#ff0038", fontSize: "16px", fontWeight: 700 }}>
                {product.serialNumber}
              </span>
              <button
                type="button"
                className="btn secondary"
                style={{ padding: "3px 8px", fontSize: "11px" }}
                onClick={handleCopy}
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>
            </dd>

            <dt>Purchase Date</dt>
            <dd>{fmtDate(product.purchaseDate)}</dd>

            <dt>Warranty Period</dt>
            <dd>{product.warrantyMonths} Months Coverage</dd>

            <dt>Warranty Expiry</dt>
            <dd style={{ fontWeight: 600, color: isExpired ? "#ef4444" : isExpiringSoon ? "#fbbf24" : "#10b981" }}>
              {fmtDate(product.expiryDate)}
            </dd>

            <dt>Coverage Status</dt>
            <dd style={{ fontWeight: 700, color: isExpired ? "#ef4444" : isExpiringSoon ? "#fbbf24" : "#10b981" }}>
              {isExpired
                ? "Expired (Standard warranty term has elapsed)"
                : isExpiringSoon
                ? `Expiring Soon (${daysLeft} days remaining before term lapses)`
                : "Active (Fully covered under manufacturer warranty)"}
            </dd>
          </dl>

          {/* Warranty Certificate PDF Download */}
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "12px", fontFamily: "var(--font-display)", fontWeight: 700 }}>
              Official Warranty PDF Certificate
            </h3>

            {product.documents && product.documents.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {product.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(255, 255, 255, 0.03)",
                      padding: "14px 18px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-subtle)",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "24px" }}>📄</span>
                      <div>
                        <strong style={{ color: "#fff", fontSize: "14px", display: "block" }}>
                          {doc.fileName || `Warranty_Certificate_${product.serialNumber}.pdf`}
                        </strong>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          Uploaded: {fmtDate(doc.uploadedAt)} · Official BOAT Document
                        </div>
                      </div>
                    </div>

                    <a
                      href={`/api/warranty/download/${doc.id}`}
                      className="btn"
                      style={{ padding: "8px 18px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      ⬇️ Download PDF
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px", border: "1px dashed var(--border-subtle)" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "13.5px", margin: 0 }}>
                  No digital warranty PDF is currently attached to this unit. If you require a copy, please contact support.
                </p>
              </div>
            )}
          </div>

          {/* Repair History Section */}
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "12px", fontFamily: "var(--font-display)", fontWeight: 700 }}>
              Service & Repair History ({product.repairs ? product.repairs.length : 0})
            </h3>

            {product.repairs && product.repairs.length > 0 ? (
              <div className="list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {product.repairs.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <strong style={{ color: "#fff", fontSize: "15px" }}>{r.issue}</strong>
                      <span className={`tag ${r.status ? r.status.toLowerCase() : "pending"}`} style={{ fontSize: "11.5px", padding: "3px 10px" }}>
                        {r.status || "PENDING"}
                      </span>
                    </div>
                    <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "6px" }}>
                      Repair Date: {fmtDate(r.repairDate)} · Authorized Center Record
                    </div>
                    {r.description && (
                      <div style={{ fontSize: "13px", color: "var(--text-main)", background: "rgba(0,0,0,0.25)", padding: "8px 12px", borderRadius: "6px" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Remarks: </span>
                        {r.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px", border: "1px dashed var(--border-subtle)" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "13.5px", margin: 0 }}>
                  ✓ Pristine Unit: No past service tickets or repair records found for this serial number.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
