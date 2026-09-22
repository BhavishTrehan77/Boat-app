"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const isAdmin = session?.user?.role === "ADMIN";

  // Customer Navbar Links: Home | Warranty Lookup | About | Contact
  const customerLinks = [
    { href: "/", label: "Home" },
    { href: "/warranty", label: "Warranty Lookup" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  // Admin Navbar Links per PRD: Dashboard | Products | Repairs | Upload Warranty PDF
  const adminLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/repairs", label: "Repairs" },
    { href: "/admin/upload", label: "Upload Warranty PDF" },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  return (
    <nav className="app-nav">
      <Link href={isAdmin ? "/admin" : "/"} className="brand" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
        <span className="brand__mark">⚓</span>
        <span>boAt<span style={{ color: "var(--brand)", fontWeight: 400, fontSize: "14px", marginLeft: "4px" }}>WARRANTY HUB</span></span>
        {isAdmin && (
          <span style={{ fontSize: "10px", background: "rgba(255, 0, 56, 0.15)", color: "#ff0038", border: "1px solid rgba(255, 0, 56, 0.35)", padding: "2px 7px", borderRadius: "10px", fontWeight: 700 }}>
            ADMIN
          </span>
        )}
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
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
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
      </div>

      <div className="nav-end">
        {status === "loading" ? (
          <div className="spinner" />
        ) : isAdmin ? (
          <div className="user-menu">
            <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--brand-gradient)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#fff", fontWeight: "bold" }}>
              A
            </span>
            <span className="user-name">Admin</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href="/warranty" className="btn" style={{ padding: "6px 14px", fontSize: "12.5px" }}>
              Check Warranty
            </Link>
            <Link href="/login" className="login-link">
              Admin Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
