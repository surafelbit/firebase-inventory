import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../components/Navbar";
import { api } from "../services/api";

function StatCard({ label, value, sub, accent = "emerald", icon, trend }) {
  const accentClasses = {
    emerald: "cc-card--accent-emerald",
    cyan: "cc-card--accent-cyan",
    amber: "cc-card--accent-amber",
    rose: "cc-card--accent-rose",
  };

  const colors = {
    emerald: "#34d399",
    cyan: "#38bdf8",
    amber: "#fbbf24",
    rose: "#fb7185",
  };

  const bgTints = {
    emerald: "rgba(16,185,129,0.04)",
    cyan: "rgba(6,182,212,0.04)",
    amber: "rgba(245,158,11,0.04)",
    rose: "rgba(244,63,94,0.04)",
  };

  return (
    <div
      className={`cc-card ${accentClasses[accent] || ""}`}
      style={{
        padding: "22px 24px",
        background: bgTints[accent] || "var(--cc-bg-card)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 148,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#94a3b8",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {label}
          </p>
          <p style={{
            fontSize: 32,
            fontWeight: 800,
            fontFamily: "'JetBrains Mono', monospace",
            color: colors[accent] || "#f8fafc",
            marginTop: 6,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}>
            {value}
          </p>
        </div>
        {icon && (
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors[accent],
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p style={{ fontSize: 12, color: "#64748b" }}>{sub}</p>
        {trend && (
          <span style={{
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            color: colors[accent],
          }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertData, setAlertData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const data = await api.get("/products");
        setProducts(data.data || []);
      } catch {
        /* silent fallback */
      } finally {
        setLoading(false);
      }
    };
    fetch_();

    // Fetch recent stock movements from the microservice
    api.getStockMovements({ limit: 6 })
      .then((res) => setRecentMovements(res.data || []))
      .catch(() => {});
  }, []);

  const handleScanAlerts = async () => {
    try {
      setScanning(true);
      const res = await api.checkAlerts();
      setAlertData(res);
    } catch (err) {
      console.error("Alert scan error:", err);
      alert(err.message || "Failed to scan stock alerts.");
    } finally {
      setScanning(false);
    }
  };

  const totalProducts = products.length;
  const totalStock = products.reduce((t, p) => t + Number(p.quantity || 0), 0);
  const lowStockList = products.filter(
    (p) => Number(p.quantity || 0) > 0 && Number(p.quantity || 0) <= Number(p.minStock || 0)
  );
  const outOfStockList = products.filter((p) => Number(p.quantity || 0) === 0);
  const inStockList = products.filter((p) => Number(p.quantity || 0) > Number(p.minStock || 0));
  const inventoryValue = products.reduce(
    (t, p) => t + Number(p.quantity || 0) * Number(p.price || 0),
    0
  );
  const recentProducts = [...products]
    .sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0))
    .slice(0, 5);

  const totalSegments = inStockList.length + lowStockList.length + outOfStockList.length || 1;
  const inPct = Math.round((inStockList.length / totalSegments) * 100);
  const lowPct = Math.round((lowStockList.length / totalSegments) * 100);
  const outPct = Math.max(0, 100 - inPct - lowPct);

  return (
    <AppLayout>
      <div style={{ maxWidth: 1260, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Command Center Telemetry Header */}
        <header style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          marginBottom: 32,
          paddingBottom: 24,
          borderBottom: "1px solid rgba(255,255,255,0.07)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="cc-dot-live" />
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#34d399",
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                Telemetry Console • Active Session
              </span>
            </div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: "-0.03em",
              color: "#f8fafc",
              margin: 0
            }}>
              Mission Control & Inventory Intelligence
            </h1>
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
              Real-time audit trails, stock telemetry, and predictive reorder insights.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Run Alert Scan Trigger */}
            <button
              onClick={handleScanAlerts}
              disabled={scanning}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 12,
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "#fbbf24",
                fontWeight: 600,
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: scanning ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                transition: "all .18s cubic-bezier(0.16, 1, 0.3, 1)",
                opacity: scanning ? 0.7 : 1,
                boxShadow: "0 0 16px rgba(245,158,11,0.15)"
              }}
              onMouseEnter={(e) => {
                if (!scanning) {
                  e.currentTarget.style.background = "rgba(245,158,11,0.2)";
                  e.currentTarget.style.borderColor = "#fbbf24";
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(245,158,11,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!scanning) {
                  e.currentTarget.style.background = "rgba(245,158,11,0.12)";
                  e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
                  e.currentTarget.style.boxShadow = "0 0 16px rgba(245,158,11,0.15)";
                }
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m13 2-2 10h5L11 22l2-10H8Z" />
              </svg>
              {scanning ? "Evaluating Triggers..." : "⚡ Run Stock Alert Scan"}
            </button>

            {/* Ingest SKU Action */}
            <Link
              to="/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 13,
                boxShadow: "0 0 20px rgba(16,185,129,0.35)",
                transition: "all .18s ease",
                whiteSpace: "nowrap",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.2)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 28px rgba(16,185,129,0.55)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 20px rgba(16,185,129,0.35)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Manage Catalog
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="cc-card" style={{ padding: "64px 20px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{
              display: "inline-block",
              width: 38,
              height: 38,
              border: "3px solid rgba(16,185,129,0.2)",
              borderTopColor: "#34d399",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            <p style={{ marginTop: 16, fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>
              Initializing Command Center telemetry stream...
            </p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            {/* 4 Telemetry Metric HUD Cards */}
            <section style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              marginBottom: 24
            }}>
              <StatCard
                label="Catalog SKUs"
                value={totalProducts}
                sub="Tracked inventory items"
                accent="emerald"
                trend="ONLINE"
                icon={(
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="8" height="8" x="3" y="3" rx="1.5" />
                    <path d="M7 11v4a2 2 0 0 0 2 2h4" />
                    <rect width="8" height="8" x="13" y="13" rx="1.5" />
                  </svg>
                )}
              />

              <StatCard
                label="Units in Warehouse"
                value={totalStock.toLocaleString()}
                sub="Available physical stock"
                accent="cyan"
                trend={`${inStockList.length} Healthy`}
                icon={(
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                )}
              />

              <StatCard
                label="Restock Alerts"
                value={lowStockList.length + outOfStockList.length}
                sub={`${outOfStockList.length} depleted • ${lowStockList.length} critical`}
                accent={lowStockList.length + outOfStockList.length > 0 ? "amber" : "emerald"}
                trend={outOfStockList.length > 0 ? "URGENT" : "STABLE"}
                icon={(
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                )}
              />

              <StatCard
                label="Asset Valuation"
                value={`${inventoryValue.toLocaleString()} ETB`}
                sub="Calculated at unit prices"
                accent="cyan"
                trend="GROSS"
                icon={(
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                    <path d="M12 18V6" />
                  </svg>
                )}
              />
            </section>

            {/* Inventory Health Radar Banner */}
            <section className="cc-card" style={{ padding: "20px 24px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, color: "#f8fafc" }}>
                    Warehouse Stock Level Distribution
                  </h3>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>
                    Automated ratio of in-stock versus critical reorder thresholds
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#34d399" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                    Healthy: {inPct}% ({inStockList.length})
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#fbbf24" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                    Low Stock: {lowPct}% ({lowStockList.length})
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#fb7185" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f43f5e" }} />
                    Depleted: {outPct}% ({outOfStockList.length})
                  </span>
                </div>
              </div>

              {/* Segmented multi-tone bar */}
              <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${inPct}%`, background: "linear-gradient(90deg, #10b981, #34d399)", transition: "width .5s ease" }} />
                <div style={{ width: `${lowPct}%`, background: "linear-gradient(90deg, #f59e0b, #fbbf24)", transition: "width .5s ease" }} />
                <div style={{ width: `${outPct}%`, background: "linear-gradient(90deg, #f43f5e, #fb7185)", transition: "width .5s ease" }} />
              </div>
            </section>

            {/* Dual Column Telemetry View */}
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 20 }}>

              {/* Left Column: Recent Catalog Ingestion */}
              <div className="cc-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                      <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, color: "#f8fafc" }}>
                        Recent Catalog Ingestion
                      </h2>
                    </div>
                    <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                      Newly registered products and initial stock balances.
                    </p>
                  </div>
                  <Link
                    to="/products"
                    style={{
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#34d399",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    All Products →
                  </Link>
                </div>

                {recentProducts.length === 0 ? (
                  <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Catalog is currently empty</p>
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Add your first SKU to activate telemetry monitoring.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                          <th style={{ padding: "0 0 10px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Product / SKU</th>
                          <th style={{ padding: "0 0 10px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Category</th>
                          <th style={{ padding: "0 0 10px", textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Units</th>
                          <th style={{ padding: "0 0 10px", textAlign: "right", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Unit Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentProducts.map((p) => {
                          const qty = Number(p.quantity || 0);
                          const min = Number(p.minStock || 0);
                          const qtyColor = qty === 0 ? "#fb7185" : qty <= min ? "#fbbf24" : "#34d399";

                          return (
                            <tr
                              key={p.id}
                              style={{
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                transition: "background .15s ease",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                              <td style={{ padding: "12px 0" }}>
                                <div style={{ fontWeight: 600, color: "#f8fafc" }}>{p.name}</div>
                                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#38bdf8" }}>{p.sku}</div>
                              </td>
                              <td style={{ padding: "12px 0", color: "#94a3b8" }}>
                                <span style={{ padding: "2px 7px", borderRadius: 6, background: "rgba(255,255,255,0.04)", fontSize: 11 }}>
                                  {p.category || "General"}
                                </span>
                              </td>
                              <td style={{ padding: "12px 0", textAlign: "center" }}>
                                <span style={{
                                  fontWeight: 700,
                                  fontFamily: "'JetBrains Mono', monospace",
                                  color: qtyColor,
                                  fontSize: 13
                                }}>
                                  {qty}
                                </span>
                              </td>
                              <td style={{ padding: "12px 0", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "#cbd5e1" }}>
                                {Number(p.price).toLocaleString()} ETB
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Column: Live Stock Movement Ledger */}
              <div className="cc-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 8px #38bdf8" }} />
                      <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, color: "#f8fafc" }}>
                        Stock Movement Audit Stream
                      </h2>
                    </div>
                    <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                      Live transactions captured by the standalone ledger microservice.
                    </p>
                  </div>
                  <Link
                    to="/products"
                    style={{
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#38bdf8",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    Open Full Ledger →
                  </Link>
                </div>

                {recentMovements.length === 0 ? (
                  <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>No movement transactions yet</p>
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                      Record receipts, sales, or audit corrections to generate immutable ledger entries.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {recentMovements.slice(0, 5).map((m) => {
                      const isPositive = (m.delta || 0) > 0;
                      const typeLabel = {
                        received: "RECEIVED",
                        sold: "DISPATCHED",
                        returned: "RETURN",
                        damaged: "DAMAGED",
                        lost: "SHRINKAGE",
                        adjustment: "AUDIT ADJ",
                        audit_adjustment: "RECONCILED",
                      }[m.type] || m.type.toUpperCase();

                      const dateStr = m.createdAt
                        ? typeof m.createdAt === "string"
                          ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : m.createdAt._seconds
                          ? new Date(m.createdAt._seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : "Now"
                        : "Now";

                      return (
                        <div
                          key={m.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 14px",
                            borderRadius: 12,
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            gap: 12,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <span style={{
                              padding: "2px 7px",
                              borderRadius: 5,
                              fontSize: 10,
                              fontWeight: 700,
                              fontFamily: "'JetBrains Mono', monospace",
                              background: isPositive ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)",
                              color: isPositive ? "#34d399" : "#fb7185",
                              border: `1px solid ${isPositive ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`,
                              flexShrink: 0
                            }}>
                              {typeLabel}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {m.productName || "Product"}
                                <span style={{ color: "#64748b", fontSize: 11, marginLeft: 6 }}>({m.sku})</span>
                              </p>
                              <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
                                {m.reason || "Inventory movement"}
                                {m.referenceNumber && (
                                  <span style={{ marginLeft: 6, color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace" }}>
                                    #{m.referenceNumber}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p style={{
                              margin: 0,
                              fontSize: 14,
                              fontWeight: 800,
                              fontFamily: "'JetBrains Mono', monospace",
                              color: isPositive ? "#34d399" : "#fb7185",
                            }}>
                              {isPositive ? `+${m.quantity}` : `-${m.quantity}`}
                            </p>
                            <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                              {dateStr}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Low Stock Alert Microservice Modal */}
        {alertData && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 8, 19, 0.85)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20
          }}>
            <div
              className="cc-card"
              style={{
                maxWidth: 720,
                width: "100%",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid rgba(245,158,11,0.3)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(245,158,11,0.15)",
                animation: "cc-modal-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(245,158,11,0.05)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(245,158,11,0.15)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fbbf24",
                    fontSize: 20,
                    boxShadow: "0 0 16px rgba(245,158,11,0.25)"
                  }}>
                    ⚡
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, color: "#f8fafc" }}>
                      Stock Alert & Predictive Restock Intelligence
                    </h2>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
                      Standalone Cloud Microservice Scan Report
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAlertData(null)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#94a3b8",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Metric Summary Ribbon */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div style={{
                    background: "rgba(244,63,94,0.08)",
                    border: "1px solid rgba(244,63,94,0.25)",
                    borderRadius: 12,
                    padding: "14px 16px"
                  }}>
                    <p style={{ fontSize: 11, textTransform: "uppercase", color: "#fb7185", fontWeight: 700, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                      Depleted (Zero)
                    </p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: "#f43f5e", margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
                      {alertData.summary?.outOfStockCount || 0}
                    </p>
                  </div>

                  <div style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 12,
                    padding: "14px 16px"
                  }}>
                    <p style={{ fontSize: 11, textTransform: "uppercase", color: "#fbbf24", fontWeight: 700, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                      Low Stock Threshold
                    </p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b", margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
                      {alertData.summary?.lowStockCount || 0}
                    </p>
                  </div>

                  <div style={{
                    background: "rgba(6,182,212,0.08)",
                    border: "1px solid rgba(6,182,212,0.25)",
                    borderRadius: 12,
                    padding: "14px 16px"
                  }}>
                    <p style={{ fontSize: 11, textTransform: "uppercase", color: "#38bdf8", fontWeight: 700, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                      Est. Reorder Budget
                    </p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: "#38bdf8", margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
                      {Number(alertData.summary?.estimatedRestockCost || 0).toLocaleString()} ETB
                    </p>
                  </div>
                </div>

                {/* Items Needing Reorder */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#f8fafc" }}>
                    Recommended Purchase Orders ({alertData.alerts?.length || 0})
                  </h3>

                  {alertData.alerts?.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12 }}>
                      <p style={{ color: "#34d399", fontWeight: 600, margin: 0 }}>
                        ✓ All inventory items are above safety minimum stock thresholds.
                      </p>
                    </div>
                  ) : (
                    <div style={{ background: "rgba(5, 16, 31, 0.7)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                            <th style={{ padding: "10px 14px", textAlign: "left" }}>Product / SKU</th>
                            <th style={{ padding: "10px 14px", textAlign: "center" }}>Stock / Min</th>
                            <th style={{ padding: "10px 14px", textAlign: "center" }}>Suggested Order</th>
                            <th style={{ padding: "10px 14px", textAlign: "right" }}>Est. Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alertData.alerts?.map((item) => (
                            <tr key={item.productId} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: 600, color: "#f8fafc" }}>{item.name}</div>
                                <div style={{ fontSize: 11, color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace" }}>{item.sku}</div>
                              </td>
                              <td style={{ padding: "12px 14px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
                                <span style={{ fontWeight: 700, color: item.status === "OUT_OF_STOCK" ? "#fb7185" : "#fbbf24" }}>
                                  {item.currentStock}
                                </span>
                                <span style={{ color: "#475569", margin: "0 4px" }}>/</span>
                                <span style={{ color: "#94a3b8" }}>{item.minStock}</span>
                              </td>
                              <td style={{ padding: "12px 14px", textAlign: "center", color: "#34d399", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                                +{item.suggestedReorder} units
                              </td>
                              <td style={{ padding: "12px 14px", textAlign: "right", color: "#cbd5e1", fontFamily: "'JetBrains Mono', monospace" }}>
                                {Number(item.estimatedCost).toLocaleString()} ETB
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {alertData.auditLogId && (
                  <div style={{ fontSize: 11, color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                    Audit Ledger ID: <code style={{ color: "#38bdf8" }}>inventoryAlerts/{alertData.auditLogId}</code>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setAlertData(null)}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.08)",
                    color: "#f8fafc",
                    border: "1px solid rgba(255,255,255,0.12)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13
                  }}
                >
                  Dismiss Report
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}

export default Dashboard;
