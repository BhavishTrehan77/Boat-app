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
          throw new Error("Invalid email or password");
        }

        setMsg({
          type: "ok",
          text: "Login successful! Redirecting to your dashboard.",
        });
        router.push("/user-dashboard");
      } else {
        const res = await api.register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setMsg({
          type: "ok",
          text: "Registration successful! You can now login.",
        });
        setTab("login");
      }
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="hero__intro">
          <span className="hero__eyebrow">🔐 Owner access</span>
          <h1>{tab === "login" ? "Welcome back" : "Create your BOAT account"}</h1>
          <p>Register or sign in to manage your products, repairs, and warranty support.</p>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          <button
            className={`btn ${tab === "login" ? "" : "secondary"}`}
            type="button"
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`btn ${tab === "register" ? "" : "secondary"}`}
            type="button"
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit}>
          {tab === "register" && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                className="input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
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
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading
              ? "Please wait…"
              : tab === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>

        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
      </div>
    </div>
  );
}
