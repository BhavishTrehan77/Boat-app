"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "../../lib/api";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminUploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsRes, docsRes] = await Promise.all([
        api.getProducts(),
        api.getWarrantyDocuments(),
      ]);
      setProducts(prodsRes.body || prodsRes.data || []);
      setDocuments(docsRes.body || docsRes.data || []);
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/login");
      } else {
        loadData();
      }
    }
  }, [status, session, router]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedProductId) {
      alert("Please select a target product");
      return;
    }
    if (!file) {
      alert("Please choose a PDF or image file");
      return;
    }

    setUploading(true);
    setMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", selectedProductId);

      await api.uploadWarrantyFile(formData);

      setMsg({ type: "ok", text: "Warranty document uploaded successfully via Multer!" });
      setFile(null);
      if (e.target && e.target.reset) e.target.reset();
      loadData();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="hero">
        <div className="hero__intro" style={{ alignItems: "flex-start", textAlign: "left" }}>
          <span className="hero__eyebrow">📄 DIGITAL CERTIFICATE STORAGE</span>
          <h1>Upload Warranty PDFs</h1>
          <p>
            Upload official PDF warranty certificates and purchase documents. Stored securely on the server via Multer for instant customer lookup and download.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Link href="/admin" className="btn secondary" style={{ fontSize: "13px" }}>
              ← Admin Dashboard
            </Link>
            <Link href="/admin/products" className="btn secondary" style={{ fontSize: "13px" }}>
              Product Management →
            </Link>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`msg ${msg.type}`} style={{ marginBottom: "20px" }}>
          <span>{msg.type === "ok" ? "✓" : "⚠️"}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="card" style={{ marginBottom: "30px", border: "1px solid var(--border-brand)" }}>
        <h2 style={{ fontSize: "18px", color: "#fff", marginBottom: "4px" }}>Upload Certificate File</h2>
        <div className="sub" style={{ marginBottom: "16px" }}>Attach a warranty PDF or invoice document to an existing serial number</div>

        <form onSubmit={handleUpload}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div className="field">
              <label>Select Target Product *</label>
              <select
                className="input"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName} ({p.serialNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Select Document (PDF, JPG, PNG) *</label>
              <input
                className="input"
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                required
              />
              {file && (
                <div style={{ fontSize: "12px", color: "#ff0038", marginTop: "4px" }}>
                  Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <button className="btn" type="submit" disabled={uploading || !file}>
              {uploading ? <span className="spinner" /> : "⬆️ Upload Warranty PDF (Multer)"}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents Registry */}
      <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
        <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 style={{ color: "#fff", fontSize: "18px", margin: 0 }}>
            Stored Warranty Documents ({documents.length})
          </h3>
          <button className="btn secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={loadData}>
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="spinner" style={{ margin: "0 auto 10px" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading documents list...</p>
          </div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No warranty documents uploaded yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>ID</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>File Name</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Linked Product</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Uploaded Date</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => {
                  const linkedProduct = products.find((p) => p.id === d.productId);
                  return (
                    <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                        #{d.id}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>📄</span>
                          <strong style={{ color: "#fff" }}>{d.fileName}</strong>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {linkedProduct ? (
                          <>
                            <span style={{ color: "#fff", display: "block" }}>{linkedProduct.productName}</span>
                            <span style={{ color: "#ff0038", fontFamily: "monospace", fontSize: "12px" }}>
                              {linkedProduct.serialNumber}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>Product #{d.productId}</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {fmtDate(d.uploadedAt)}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <a
                          href={d.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: "12px", marginRight: "6px" }}
                        >
                          View ↗
                        </a>
                        <a
                          href={`/api/warranty/download/${d.id}`}
                          className="btn"
                          style={{ padding: "4px 10px", fontSize: "12px" }}
                        >
                          ⬇️ Download
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
