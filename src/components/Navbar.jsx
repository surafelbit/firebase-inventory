import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    tag: "TELEMETRY",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1.5" />
        <rect width="7" height="5" x="14" y="3" rx="1.5" />
        <rect width="7" height="9" x="14" y="12" rx="1.5" />
        <rect width="7" height="5" x="3" y="16" rx="1.5" />
      </svg>
    ),
  },
  {
    path: "/products",
    label: "Inventory Catalog",
    tag: "STOCK & LEDGER",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
];

const ADMIN_ITEM = {
  path: "/users",
  label: "Access & Operators",
  tag: "IAM AUDIT",
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

const ROLE_BADGE = {
  admin:  { bg: "rgba(168,85,247,.14)", color: "#c084fc", border: "rgba(168,85,247,.3)" },
  staff:  { bg: "rgba(16,185,129,.14)", color: "#34d399", border: "rgba(16,185,129,.3)" },
  viewer: { bg: "rgba(6,182,212,.14)",  color: "#38bdf8", border: "rgba(6,182,212,.3)" },
};

function NavLinkItem({ path, label, tag, icon, isActive, onClick }) {
  return (
    <Link
      to={path}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "11px 14px",
        borderRadius: "12px",
        fontSize: "13.5px",
        fontWeight: isActive ? 600 : 500,
        textDecoration: "none",
        transition: "all .18s cubic-bezier(0.16, 1, 0.3, 1)",
        background: isActive ? "rgba(16,185,129,0.08)" : "transparent",
        color: isActive ? "#34d399" : "#94a3b8",
        border: isActive ? "1px solid rgba(16,185,129,0.22)" : "1px solid transparent",
        boxShadow: isActive ? "inset 3px 0 0 #10b981, 0 2px 10px rgba(0,0,0,0.25)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "#f1f5f9";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#94a3b8";
          e.currentTarget.style.borderColor = "transparent";
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
        <span style={{ color: isActive ? "#34d399" : "#64748b", flexShrink: 0, display: "flex", alignItems: "center" }}>
          {icon}
        </span>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </span>
      </div>
      {tag && (
        <span style={{
          fontSize: "9px",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.06em",
          padding: "2px 5px",
          borderRadius: "4px",
          background: isActive ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
          color: isActive ? "#34d399" : "#64748b",
          flexShrink: 0,
        }}>
          {tag}
        </span>
      )}
    </Link>
  );
}

/**
 * Sidebar component — Command Center Navigation Deck
 */
function Sidebar({ onCloseMobile }) {
  const { user, userData, logout } = useAuth();
  const location = useLocation();

  const emailLower = (user?.email || "").toLowerCase();
  const role = (
    userData?.role ||
    (emailLower.includes("admin") ? "admin" :
     emailLower.includes("staff") ? "staff" : "viewer")
  ).toLowerCase().trim();

  const isAdmin = role === "admin";
  const items = [...NAV_ITEMS, ...(isAdmin ? [ADMIN_ITEM] : [])];
  const badgeStyle = ROLE_BADGE[role] || ROLE_BADGE.viewer;
  const initials = (userData?.fullName || user?.email || "U")[0].toUpperCase();

  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #040e1b 0%, #020813 100%)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        overflowY: "auto",
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div style={{
        padding: "22px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
        background: "rgba(255,255,255,0.01)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(16,185,129,0.35)",
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#f8fafc",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: "-0.02em",
                lineHeight: 1.2
              }}>
                InventoryPro
              </span>
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                padding: "1px 5px",
                borderRadius: 4,
                background: "rgba(6,182,212,0.15)",
                color: "#38bdf8",
                border: "1px solid rgba(6,182,212,0.3)"
              }}>
                OS v2.5
              </span>
            </div>
            <p style={{
              fontSize: 11,
              color: "#64748b",
              marginTop: 2,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              Command Console
            </p>
          </div>
        </div>

        {/* Live System Status Widget */}
        <div style={{
          marginTop: 14,
          padding: "8px 10px",
          borderRadius: 8,
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span className="cc-dot-live" />
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#34d399",
              letterSpacing: "0.02em"
            }}>
              Microservices Live
            </span>
          </div>
          <span style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#64748b"
          }}>
            Ledger Ready
          </span>
        </div>
      </div>

      {/* Operator ID Panel */}
      <div style={{
        padding: "16px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(0,0,0,0.15)",
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0e2a47, #071729)",
            border: "1px solid rgba(16,185,129,0.4)",
            boxShadow: "0 0 10px rgba(16,185,129,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 14,
            fontWeight: 800,
            color: "#34d399",
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#f1f5f9",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.2
            }}>
              {userData?.fullName || user?.email?.split("@")[0] || "Operator"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{
                display: "inline-block",
                padding: "2px 7px",
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                background: badgeStyle.bg,
                color: badgeStyle.color,
                border: `1px solid ${badgeStyle.border}`
              }}>
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav style={{ flex: 1, padding: "18px 12px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#475569",
          padding: "0 10px",
          marginBottom: 4,
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          Operations Deck
        </p>

        {items.map((item) => (
          <NavLinkItem
            key={item.path}
            {...item}
            isActive={location.pathname === item.path}
            onClick={onCloseMobile}
          />
        ))}

        {/* Quick Microservice Telemetry Section */}
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <div style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(8, 24, 44, 0.5)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }} />
              Active Integrations
            </p>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Stock Audit:</span>
                <span style={{ color: "#34d399" }}>ONLINE</span>
              </span>
              <span style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Alert Engine:</span>
                <span style={{ color: "#fbbf24" }}>READY</span>
              </span>
              <span style={{ display: "flex", justifyContent: "space-between" }}>
                <span>CSV Export:</span>
                <span style={{ color: "#38bdf8" }}>STANDBY</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Sign out */}
      <div style={{ padding: "14px 12px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <button
          onClick={logout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            background: "transparent",
            color: "#94a3b8",
            border: "1px solid transparent",
            cursor: "pointer",
            textAlign: "left",
            transition: "all .18s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(244,63,94,0.1)";
            e.currentTarget.style.color = "#fb7185";
            e.currentTarget.style.borderColor = "rgba(244,63,94,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          Sign out session
        </button>
      </div>
    </aside>
  );
}

/**
 * AppLayout — Command Center Framework
 * Wraps authenticated pages in a high-craft telemetry environment.
 * Includes topbar for mobile and persistent sidebar for desktop.
 */
export function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === "/dashboard") return "Mission Control";
    if (location.pathname === "/products") return "Inventory & Ledger";
    if (location.pathname === "/users") return "Operator Management";
    return "Command Center";
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#020813",
      color: "#f1f5f9",
      position: "relative",
    }}>
      {/* Background ambient lighting glows */}
      <div style={{
        position: "fixed",
        top: 0,
        left: "260px",
        right: 0,
        height: "280px",
        background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.06), transparent 70%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Desktop Sidebar */}
      <div className="hidden md:block" style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 8, 19, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 260,
              height: "100%",
              animation: "cc-modal-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
        {/* Mobile Header Bar */}
        <header
          className="md:hidden"
          style={{
            height: 56,
            background: "rgba(4, 14, 27, 0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {getPageTitle()}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="cc-dot-live" />
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#34d399" }}>
              LIVE
            </span>
          </div>
        </header>

        {/* Page children content */}
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Sidebar;
