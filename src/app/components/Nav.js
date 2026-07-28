"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/warranty", label: "Warranty Check" },
  { href: "/products", label: "Products" },
  { href: "/repair", label: "Repair" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  if (!mounted) {
    return (
      <nav className="app-nav">
        <Link href="/" className="brand">
          <span className="brand__mark">⚓</span>
          <span>BOAT Warranty</span>
        </Link>
        <div className="links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="link">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="app-nav">
      <Link href="/" className="brand">
        <span className="brand__mark">⚓</span>
        <span>BOAT Warranty</span>
      </Link>
      <div className="links">
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
            >
              {l.label}
            </Link>
          );
        })}
        {session?.user && (
          <Link
            href="/user-dashboard"
            className={`link${pathname === "/user-dashboard" ? " active" : ""}`}
          >
            My Dashboard
          </Link>
        )}
      </div>
      <div className="nav-end">
        {status === "loading" ? (
          <span style={{ fontSize: "14px", color: "#666" }}>Loading...</span>
        ) : session?.user ? (
          <div className="user-menu">
            <span className="user-name">{session.user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link href="/auth" className="login-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
