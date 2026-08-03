"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      if (tab === "login") {
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Invalid email or password. Please try again.");
        }

        setMsg({
          type: "ok",
          text: "Authentication successful! Redirecting to your dashboard…",
        });
        setTimeout(() => {
          router.push("/user-dashboard");
        }, 800);
      } else {
        if (!form.name || !form.email || !form.password) {
          throw new Error("Please complete all registration fields.");
        }
        await api.register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setMsg({
          type: "ok",
          text: "Registration successful! You can now sign in with your credentials.",
        });
        setTab("login");
      }
    } catch (err) {
      setMsg({ type: "error", text: err.message || "An unexpected authentication error occurred." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="hero__intro">
          <span className="hero__eyebrow">🔐 OWNER AUTHENTICATION</span>
          <h1>{tab === "login" ? "Welcome Back to BOAT" : "Join the BOAT Community"}</h1>
          <p>Access your personalized owner dashboard, registered devices, and warranty support.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "480px", margin: "0 auto" }}>
        {/* Toggle Switch */}
        <div className="tabs" style={{ justifyContent: "center", borderBottom: "none", marginBottom: "28px" }}>
          <button
            className={`btn ${tab === "login" ? "" : "secondary"}`}
            type="button"
            onClick={() => { setTab("login"); setMsg(null); }}
            style={{ flex: 1, padding: "10px 16px" }}
          >
            Sign In
          </button>
          <button
            className={`btn ${tab === "register" ? "" : "secondary"}`}
            type="button"
            onClick={() => { setTab("register"); setMsg(null); }}
            style={{ flex: 1, padding: "10px 16px" }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={submit}>
          {tab === "register" && (
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                className="input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Alex Morgan"
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="btn" type="submit" disabled={loading} style={{ width: "100%", marginTop: "12px" }}>
            {loading ? (
              <span className="spinner" />
            ) : tab === "login" ? (
              "Sign In to Account →"
            ) : (
              "Complete Registration →"
            )}
          </button>
        </form>

        {msg && (
          <div className={`msg ${msg.type}`} style={{ marginTop: "20px" }}>
            <span>{msg.type === "ok" ? "✓" : "⚠️"}</span>
            <span>{msg.text}</span>
          </div>
        )}

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", textAlign: "center", color: "var(--text-dim)", fontSize: "12.5px" }}>
          <span>🔒 256-bit Encrypted Security · Official BOAT Support Protocol</span>
        </div>
      </div>
    </div>
  );
}
