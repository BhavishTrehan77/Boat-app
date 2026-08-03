"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/", label: "Home" },
  { href: "/warranty", label: "Warranty Check" },
  { href: "/products", label: "Products Hub" },
  { href: "/repair", label: "Service Center" },
  { href: "/dashboard", label: "Admin Analytics" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <nav className="app-nav">
      <Link href="/" className="brand">
        <span className="brand__mark">⚓</span>
        <span>BOAT<span style={{ color: "var(--brand)", fontWeight: 400, fontSize: "14px", marginLeft: "4px" }}>SUPPORT</span></span>
      </Link>

      <button
        className="mobile-nav-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle Navigation"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      <div className={`links ${mobileOpen ? "mobile-open" : ""}`}>
        {links.map((l) => {
          const active =
            l.href === "/"
              ? pathname === "/"
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`link${active ? " active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          );
        })}
        {session?.user && (
          <Link
            href="/user-dashboard"
            className={`link${pathname === "/user-dashboard" ? " active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            My Dashboard
          </Link>
        )}
      </div>

      <div className="nav-end">
        {status === "loading" ? (
          <div className="spinner" />
        ) : session?.user ? (
          <div className="user-menu">
            <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--brand-gradient)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff", fontWeight: "bold" }}>
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </span>
            <span className="user-name">{session.user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link href="/auth" className="login-link">
            <span>Login</span>
            <span style={{ fontSize: "14px" }}>→</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
