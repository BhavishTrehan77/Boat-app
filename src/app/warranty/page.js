"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "../lib/api";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function WarrantyContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [serial, setSerial] = useState(params.get("serial") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);

  async function check(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setProduct(null);
    setUploadMsg(null);
    setSelectedFile(null);
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

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) {
      setUploadMsg({ type: "error", text: "Please select an image or PDF file first." });
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadMsg({ type: "error", text: "Only images (JPG, PNG, WEBP) and PDF files are allowed." });
      return;
    }
    setUploading(true);
    setUploadMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("productId", product.id);

      await api.uploadWarrantyFile(formData);
      setUploadMsg({ type: "ok", text: "File uploaded successfully via Multer!" });
      setSelectedFile(null);
      if (e.target && e.target.reset) e.target.reset();

      // Refresh product details to show newly uploaded document
      const res = await api.getWarranty(product.serialNumber);
      if (res && res.data) setProduct(res.data);
    } catch (err) {
      setUploadMsg({ type: "error", text: err.message || "Failed to upload file." });
    } finally {
      setUploading(false);
    }
  }

  const now = new Date();
  const expiry = product?.expiryDate ? new Date(product.expiryDate) : null;
  const isExpired = expiry && expiry < now;
  const daysRemaining = expiry ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)) : 0;
  const isExpiringSoon = !isExpired && daysRemaining <= 30;
  const active = !isExpired;

   useEffect(() => {
     if (params.get("serial")) {
       // eslint-disable-next-line react-hooks/set-state-in-effect
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
              {isExpired ? (
                <span className="tag expired" style={{ fontSize: "13px", padding: "6px 14px" }}>
                  ✕ WARRANTY EXPIRED
                </span>
              ) : isExpiringSoon ? (
                <span className="tag pending" style={{ fontSize: "13px", padding: "6px 14px", background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", border: "1px solid #fbbf24" }}>
                  ⚠️ EXPIRING SOON ({daysRemaining}d left)
                </span>
              ) : (
                <span className="tag ok" style={{ fontSize: "13px", padding: "6px 14px" }}>
                  ✓ WARRANTY ACTIVE
                </span>
              )}
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
            <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <Link className="btn" href={`/product/${encodeURIComponent(product.serialNumber)}`}>
                🔗 Dedicated Product Details Page →
              </Link>
              {session?.user?.role === "ADMIN" && (
                <Link className="btn secondary" href="/admin/repairs">
                  🛠 Manage Service Tickets
                </Link>
              )}
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
                          {r.description}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "18px", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700 }}>
                  Warranty Documents ({product.documents ? product.documents.length : 0})
                </h3>
              </div>

              {product.documents && product.documents.length > 0 ? (
                <div className="list" style={{ marginBottom: "20px" }}>
                  {product.documents.map((d) => {
                    const isImg = /\.(png|jpe?g|webp|gif)$/i.test(d.fileName || d.fileUrl);
                    return (
                      <div className="item" key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "24px" }}>{isImg ? "🖼️" : "📄"}</span>
                          <div>
                            <a href={d.fileUrl} target="_blank" rel="noreferrer" style={{ color: "#ff3b68", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                              {d.fileName || `Document #${d.id}`}
                            </a>
                            <div className="meta">
                              Type: {isImg ? "Image File" : "PDF Document"} · Uploaded: {fmtDate(d.uploadedAt)}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <a href={d.fileUrl} target="_blank" rel="noreferrer" className="btn secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                            View ↗
                          </a>
                          <a
                            href={`/api/warranty/download/${d.id}`}
                            className="btn"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            title="Download file to computer"
                          >
                            ⬇️ Download
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: "14px", marginBottom: "16px" }}>No digital documents or images attached to this unit yet.</p>
              )}

              {/* Upload Form (Available for logged-in Administrator) */}
              {session?.user?.role === "ADMIN" && (
                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px dashed var(--border-brand)", borderRadius: "var(--radius-md)", padding: "20px" }}>
                  <h4 style={{ fontSize: "15px", color: "#fff", marginBottom: "6px" }}>📸 Upload Product Image or Warranty Document (Admin)</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px" }}>
                    Attach proof of purchase, warranty receipt, or hardware photo (PNG, JPG, WEBP, or PDF) via Multer.
                  </p>

                  <form onSubmit={handleUpload}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        id="pdf-upload"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                            setUploadMsg(null);
                          }
                        }}
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="btn secondary"
                        style={{ cursor: "pointer", padding: "8px 16px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        📁 {selectedFile ? selectedFile.name : "Choose Image or PDF"}
                      </label>

                      <button
                        type="submit"
                        className="btn"
                        disabled={uploading || !selectedFile}
                        style={{ padding: "8px 18px", fontSize: "13px" }}
                      >
                        {uploading ? <span className="spinner" /> : "Upload File (Multer)"}
                      </button>
                    </div>

                    {selectedFile && (
                      <div style={{ marginTop: "8px", fontSize: "12px", color: "#ff3b68" }}>
                        Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}

                    {uploadMsg && (
                      <div className={`msg ${uploadMsg.type}`} style={{ marginTop: "12px", padding: "10px 14px", fontSize: "13px" }}>
                        <span>{uploadMsg.type === "ok" ? "✓" : "⚠️"}</span>
                        <span>{uploadMsg.text}</span>
                      </div>
                    )}
                  </form>
                </div>
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
