"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../lib/api";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

function WarrantyContent() {
  const params = useSearchParams();
  const [serial, setSerial] = useState(params.get("serial") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  async function check(e) {
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

  useEffect(() => {
    if (params.get("serial")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      check({ preventDefault() {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <div className="hero">
        <div className="hero__intro">
          <span className="hero__eyebrow">🔎 Warranty verification</span>
          <h1>Check your BOAT coverage in seconds.</h1>
          <p>
            Verify your warranty, inspect repairs, and access support documents through a clean, premium experience.
          </p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={check}>
          <div className="field">
            <label htmlFor="serial">Serial Number</label>
            <input
              id="serial"
              className="input"
              placeholder="e.g. BOAT-12345-XYZ"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Checking…" : "Check Warranty"}
          </button>
        </form>

        {error && <div className="msg error">{error}</div>}

        {product && (
          <div className="card" style={{ marginTop: 22 }}>
            <div className="top" style={{ display: "flex", justifyContent: "space-between" }}>
              <h2>{product.productName}</h2>
              <span className={`tag ${active ? "ok" : "expired"}`}>
                {active ? "WARRANTY ACTIVE" : "WARRANTY EXPIRED"}
              </span>
            </div>

            <dl className="dl">
              <dt>Serial Number</dt>
              <dd>{product.serialNumber}</dd>
              <dt>Purchase Date</dt>
              <dd>{fmtDate(product.purchaseDate)}</dd>
              <dt>Warranty (months)</dt>
              <dd>{product.warrantyMonths}</dd>
              <dt>Expiry Date</dt>
              <dd>{fmtDate(product.expiryDate)}</dd>
            </dl>

            <h3 style={{ marginTop: 20, marginBottom: 8 }}>Repair History</h3>
            {product.repairs && product.repairs.length > 0 ? (
              <div className="list">
                {product.repairs.map((r) => (
                  <div className="item" key={r.id}>
                    <div className="top">
                      <h3>{r.issue}</h3>
                      <span className={`tag ${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </div>
                    <div className="meta">
                      {fmtDate(r.repairDate)} · Cost ${r.cost}
                    </div>
                    <div className="meta">{r.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No repair records found.</p>
            )}

            <h3 style={{ marginTop: 20, marginBottom: 8 }}>Documents</h3>
            {product.documents && product.documents.length > 0 ? (
              <div className="list">
                {product.documents.map((d) => (
                  <div className="item" key={d.id}>
                    <a href={d.pdfUrl} target="_blank" rel="noreferrer">
                      View PDF ({d.id})
                    </a>
                    <div className="meta">{fmtDate(d.uploadedAt)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No documents uploaded.</p>
            )}
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
              <span className="hero__eyebrow">🔎 Warranty verification</span>
              <h1>Loading warranty details…</h1>
            </div>
          </div>
        </div>
      }
    >
      <WarrantyContent />
    </Suspense>
  );
}
