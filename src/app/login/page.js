"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid admin credentials. Please try again.");
      }

      setMsg({
        type: "ok",
        text: "Admin verified! Redirecting to Management Dashboard...",
      });

      setTimeout(() => {
        router.push("/admin");
      }, 500);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ maxWidth: "440px", width: "100%", margin: "0 auto", padding: "36px 30px" }}>
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>🔐</span>
          <h1 style={{ fontSize: "24px", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800 }}>
            Administrator Login
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginTop: "6px" }}>
            Authorized administrator access only. Customer accounts are not required.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Admin Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@boat.com"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ width: "100%", marginTop: "10px", padding: "12px", fontSize: "14px" }}
          >
            {loading ? <span className="spinner" /> : "Sign In to Admin Console"}
          </button>
        </form>

        {msg && (
          <div className={`msg ${msg.type}`} style={{ marginTop: "20px" }}>
            <span>{msg.type === "ok" ? "✓" : "⚠️"}</span>
            <span>{msg.text}</span>
          </div>
        )}

        <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border-subtle)", textAlign: "center", fontSize: "12.5px", color: "var(--text-muted)" }}>
          Looking to verify product warranty?{" "}
          <a href="/warranty" style={{ color: "#ff3b68", fontWeight: 600 }}>
            Search Serial Number →
          </a>
        </div>
      </div>
    </div>
  );
}
