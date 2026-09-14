import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    path: "/products",
    label: "Products",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.51 15.49 0 12 0S6 2.51 6 4.64c0 .48.11.92.18 1.36H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8-4c1.84 0 3.36 1.32 3.36 2.64 0 .32-.12.64-.24.96H8.88c-.12-.32-.24-.64-.24-.96C8.64 3.32 10.16 2 12 2z" />
      </svg>
    ),
  },
];

const ADMIN_ITEM = {
  path: "/users",
  label: "User Management",
  icon: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ),
};

const ROLE_BADGE = {
  admin:  { background: "rgba(168,85,247,.15)",  color: "#c084fc", border: "1px solid rgba(168,85,247,.3)" },
  staff:  { background: "rgba(78,222,163,.12)",  color: "#4edea3", border: "1px solid rgba(78,222,163,.3)" },
  viewer: { background: "rgba(76,215,246,.12)",  color: "#4cd7f6", border: "1px solid rgba(76,215,246,.3)" },
};

function NavLink({ path, label, icon, isActive }) {
  return (
    <Link
      to={path}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        textDecoration: "none",
        transition: "all .18s",
        background: isActive ? "rgba(78,222,163,.1)" : "transparent",
        color: isActive ? "#4edea3" : "#8aa0b8",
        border: isActive ? "1px solid rgba(78,222,163,.2)" : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,.05)";
          e.currentTarget.style.color = "#d3e4fe";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#8aa0b8";
        }
      }}
    >
      <span style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  );
}

/**
 * Sidebar component — used inside AppLayout.
 * Uses sticky positioning so it scrolls with the page only up to the viewport top,
 * then stays fixed while the main content scrolls independently.
 */
function Sidebar() {
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
  const initials = (userData?.fullName || user?.email || "?")[0].toUpperCase();

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "rgba(7,20,38,.97)",
        borderRight: "1px solid rgba(255,255,255,.07)",
        backdropFilter: "blur(16px)",
        overflowY: "auto",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"20px", borderBottom:"1px solid rgba(255,255,255,.07)", flexShrink:0 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 0 12px rgba(78,222,163,.25)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M3 9L12 3L21 9V21H15V15H9V21H3V9Z" opacity=".9" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize:15, fontWeight:700, color:"#d3e4fe", fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1.2 }}>
            InventoryPro
          </p>
          <p style={{ fontSize:11, color:"#5a7a9a", marginTop:1 }}>Management System</p>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.07)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,rgba(78,222,163,.3),rgba(76,215,246,.2))", border:"1px solid rgba(78,222,163,.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:14, fontWeight:700, color:"#4edea3" }}>
            {initials}
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:600, color:"#d3e4fe", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", lineHeight:1.3 }}>
              {userData?.fullName || user?.email}
            </p>
            <span style={{ display:"inline-block", marginTop:4, padding:"2px 8px", borderRadius:99, fontSize:11, fontWeight:600, ...badgeStyle }}>
              {role || "user"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex:1, padding:"16px 12px", display:"flex", flexDirection:"column", gap:4, overflowY:"auto" }}>
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#3a5a7a", padding:"0 10px", marginBottom:6 }}>
          Navigation
        </p>
        {items.map((item) => (
          <NavLink key={item.path} {...item} isActive={location.pathname === item.path} />
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding:"12px", borderTop:"1px solid rgba(255,255,255,.07)", flexShrink:0 }}>
        <button
          onClick={logout}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, fontSize:14, fontWeight:500, background:"transparent", color:"#8aa0b8", border:"1px solid transparent", cursor:"pointer", textAlign:"left", transition:"all .18s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background="rgba(239,68,68,.08)"; e.currentTarget.style.color="#fca5a5"; e.currentTarget.style.borderColor="rgba(239,68,68,.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#8aa0b8"; e.currentTarget.style.borderColor="transparent"; }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ opacity:0.6, flexShrink:0 }}>
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

/**
 * AppLayout — wraps all authenticated pages.
 * Uses a true flex row: Sidebar (sticky 240px) + main (flex-1, scrollable).
 * The sidebar never overlays; both columns live in the same flex container.
 */
export function AppLayout({ children }) {
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#031427" }}>
      {/* Sidebar */}
      <div style={{ flexShrink:0 }}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main style={{ flex:1, minWidth:0, overflowX:"hidden" }}>
        {children}
      </main>
    </div>
  );
}

/* Keep a default export for backward compatibility in case anything imports Navbar directly */
export default Sidebar;
