import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../components/Navbar";
import { api } from "../services/api";

const S = {
  bg:"#031427", surface:"rgba(11,28,48,.7)", border:"rgba(255,255,255,.07)",
  text:"#d3e4fe", muted:"#8aa0b8", dim:"#5a7a9a",
  green:"#4edea3", greenDim:"rgba(78,222,163,.1)", greenBorder:"rgba(78,222,163,.2)",
  cyan:"#4cd7f6",
};

function StatCard({ label, value, sub, accent }) {
  const colors = { green:"#4edea3", cyan:"#4cd7f6", amber:"#f59e0b", red:"#fca5a5" };
  const glows  = { green:"rgba(78,222,163,.08)", cyan:"rgba(76,215,246,.08)", amber:"rgba(245,158,11,.08)", red:"rgba(255,100,100,.08)" };
  const borders= { green:"rgba(78,222,163,.15)", cyan:"rgba(76,215,246,.15)", amber:"rgba(245,158,11,.15)", red:"rgba(255,100,100,.15)" };
  return (
    <div style={{ background: glows[accent]||S.surface, border:`1px solid ${borders[accent]||S.border}`, borderRadius:16, padding:20 }}>
      <p style={{ fontSize:12, fontWeight:600, letterSpacing:".04em", textTransform:"uppercase", color:S.muted }}>{label}</p>
      <p style={{ fontSize:32, fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif", color: colors[accent]||S.text, marginTop:6, marginBottom:4, lineHeight:1 }}>
        {value}
      </p>
      <p style={{ fontSize:12, color:S.dim }}>{sub}</p>
    </div>
  );
}

function StockBar({ label, count, pct, color }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:13, color:S.muted }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:600, color }}>{count}</span>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,.05)", borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:99, transition:"width .5s ease" }}/>
      </div>
    </div>
  );
}

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [alertData, setAlertData] = useState(null);
  const [scanning, setScanning]   = useState(false);
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const data = await api.get("/products");
        setProducts(data.data || []);
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetch_();

    // Fetch recent stock movements from standalone microservice
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

  const totalProducts   = products.length;
  const totalStock      = products.reduce((t,p) => t + Number(p.quantity||0), 0);
  const lowStockList    = products.filter(p => Number(p.quantity||0)>0 && Number(p.quantity||0)<=Number(p.minStock||0));
  const outOfStockList  = products.filter(p => Number(p.quantity||0)===0);
  const inStockList     = products.filter(p => Number(p.quantity||0)>Number(p.minStock||0));
  const inventoryValue  = products.reduce((t,p) => t + Number(p.quantity||0)*Number(p.price||0), 0);
  const recentProducts  = [...products].sort((a,b)=>(b.createdAt?._seconds||0)-(a.createdAt?._seconds||0)).slice(0,5);

  const total4Pct = inStockList.length + lowStockList.length + outOfStockList.length || 1;
  const inPct     = (inStockList.length / total4Pct)*100;
  const lowPct    = (lowStockList.length / total4Pct)*100;
  const outPct    = (outOfStockList.length / total4Pct)*100;

  const qtyColor = (product) => {
    const q = Number(product.quantity||0);
    if (q===0) return "#fca5a5";
    if (q<=Number(product.minStock||0)) return "#f59e0b";
    return "#4edea3";
  };

  return (
    <AppLayout>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px 64px", color:S.text }}>

          {/* Page header */}
          <header style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"flex-start", gap:16, marginBottom:32 }}>
            <div>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:S.green, marginBottom:6 }}>Overview</p>
              <h1 style={{ fontSize:30, fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:6 }}>Dashboard</h1>
              <p style={{ fontSize:14, color:S.muted }}>Here's what's happening with your inventory.</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button
                onClick={handleScanAlerts}
                disabled={scanning}
                title="Trigger the standalone Low-Stock Alert Microservice"
                style={{
                  display:"inline-flex",
                  alignItems:"center",
                  gap:8,
                  padding:"11px 18px",
                  borderRadius:12,
                  background:"rgba(245,158,11,.12)",
                  border:"1px solid rgba(245,158,11,.3)",
                  color:"#f59e0b",
                  fontWeight:600,
                  fontSize:14,
                  cursor: scanning ? "not-allowed" : "pointer",
                  whiteSpace:"nowrap",
                  transition:"all .2s ease",
                  opacity: scanning ? 0.7 : 1,
                  boxShadow:"0 2px 8px rgba(0,0,0,.2)",
                }}
                onMouseEnter={e => {
                  if (!scanning) {
                    e.currentTarget.style.background = "rgba(245,158,11,.2)";
                    e.currentTarget.style.borderColor = "#f59e0b";
                  }
                }}
                onMouseLeave={e => {
                  if (!scanning) {
                    e.currentTarget.style.background = "rgba(245,158,11,.12)";
                    e.currentTarget.style.borderColor = "rgba(245,158,11,.3)";
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {scanning ? "Scanning Alerts..." : "⚡ Run Stock Alert Scan"}
              </button>

              <Link
                to="/products"
                style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"11px 20px", borderRadius:12, background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, boxShadow:"0 0 18px rgba(78,222,163,.25)", transition:"all .2s", whiteSpace:"nowrap" }}
                onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 0 28px rgba(78,222,163,.4)"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 0 18px rgba(78,222,163,.25)"; e.currentTarget.style.transform="none"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Add Product
              </Link>
            </div>
          </header>

          {loading ? (
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:16, padding:48, textAlign:"center", color:S.muted }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite", marginBottom:12 }}>
                <circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
              <p>Loading inventory…</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : (
            <>
              {/* Stats */}
              <section style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:24 }}>
                <StatCard label="Total Products"   value={totalProducts} sub="Products in inventory"  accent="green" />
                <StatCard label="Total Stock"      value={totalStock}    sub="Units available"          />
                <StatCard label="Low Stock"        value={lowStockList.length} sub="Need attention"    accent="amber" />
                <StatCard label="Inventory Value"  value={`${inventoryValue.toLocaleString()} ETB`} sub="Current total value" accent="cyan" />
              </section>

              {/* Content */}
              <section style={{ display:"grid", gridTemplateColumns:"1fr", gap:20 }} className="xl:grid-cols-3-custom">
                <div style={{ display:"grid", gap:20, gridTemplateColumns:"2fr 1fr" }} className="db-grid">

                  {/* Recent Products */}
                  <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:16, padding:24 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                      <div>
                        <h2 style={{ fontSize:16, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Recent Products</h2>
                        <p style={{ fontSize:13, color:S.muted, marginTop:3 }}>Your latest inventory additions.</p>
                      </div>
                      <Link to="/products" style={{ fontSize:13, color:S.green, fontWeight:500 }}
                        onMouseEnter={e=>e.currentTarget.style.opacity=".7"}
                        onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                      >View all →</Link>
                    </div>

                    {recentProducts.length === 0 ? (
                      <div style={{ minHeight:240, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
                        <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
                        <h3 style={{ fontWeight:600, marginBottom:6 }}>No products yet</h3>
                        <p style={{ fontSize:13, color:S.muted, marginBottom:20 }}>Start by adding your first product.</p>
                        <Link to="/products" style={{ padding:"9px 18px", borderRadius:10, border:`1px solid ${S.border}`, fontSize:13, fontWeight:500, color:S.text, transition:"all .2s" }}>Add Product</Link>
                      </div>
                    ) : (
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                          <thead>
                            <tr style={{ borderBottom:`1px solid ${S.border}` }}>
                              {["Product","Category","Stock","Price"].map((h,i) => (
                                <th key={h} style={{ padding:"0 0 10px", textAlign: i===3?"right":"left", fontSize:11, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", color:S.dim }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {recentProducts.map(p => (
                              <tr key={p.id} style={{ borderBottom:`1px solid rgba(255,255,255,.04)` }}>
                                <td style={{ padding:"13px 0", fontWeight:600, fontSize:14 }}>{p.name}</td>
                                <td style={{ padding:"13px 0", fontSize:13, color:S.muted }}>{p.category}</td>
                                <td style={{ padding:"13px 0", fontWeight:700, color:qtyColor(p), fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>{p.quantity}</td>
                                <td style={{ padding:"13px 0", textAlign:"right", fontSize:13, color:S.muted }}>{Number(p.price).toLocaleString()} ETB</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:16, padding:24 }}>
                    <h2 style={{ fontSize:16, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:4 }}>Stock Status</h2>
                    <p style={{ fontSize:13, color:S.muted, marginBottom:28 }}>Inventory health overview.</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                      <StockBar label="In Stock"     count={inStockList.length}   pct={inPct}  color="#4edea3" />
                      <StockBar label="Low Stock"    count={lowStockList.length}  pct={lowPct} color="#f59e0b" />
                      <StockBar label="Out of Stock" count={outOfStockList.length} pct={outPct} color="#f87171" />
                    </div>
                  </div>

                  {/* Stock Movement Ledger Activity */}
                  <div style={{ gridColumn:"1 / -1", background:S.surface, border:`1px solid ${S.border}`, borderRadius:16, padding:24, marginTop:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <span style={{ width:8, height:8, borderRadius:"50%", background:"#4cd7f6", boxShadow:"0 0 8px #4cd7f6" }} />
                          <h2 style={{ fontSize:16, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", margin:0 }}>Stock Movement Audit Ledger</h2>
                        </div>
                        <p style={{ fontSize:13, color:S.muted, margin:0 }}>Live transactions captured by the standalone stock movement microservice.</p>
                      </div>
                      <Link to="/products" style={{ fontSize:13, color:S.cyan, fontWeight:500 }}
                        onMouseEnter={e => e.currentTarget.style.opacity=".7"}
                        onMouseLeave={e => e.currentTarget.style.opacity="1"}
                      >Open full ledger →</Link>
                    </div>

                    {recentMovements.length === 0 ? (
                      <div style={{ padding:"28px 0", textAlign:"center", color:S.muted }}>
                        <p style={{ fontSize:14 }}>No stock movements recorded yet.</p>
                        <p style={{ fontSize:12, color:S.dim, marginTop:4 }}>Inbound shipments, sales, and audit counts will automatically stream into this audit ledger.</p>
                      </div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        {recentMovements.slice(0, 5).map((m) => {
                          const isPositive = (m.delta || 0) > 0;
                          const dateStr = m.createdAt
                            ? typeof m.createdAt === "string"
                              ? new Date(m.createdAt).toLocaleDateString()
                              : m.createdAt._seconds
                              ? new Date(m.createdAt._seconds * 1000).toLocaleDateString()
                              : "Recent"
                            : "Recent";

                          return (
                            <div key={m.id} style={{
                              display:"flex",
                              justifyContent:"space-between",
                              alignItems:"center",
                              padding:"12px 16px",
                              borderRadius:10,
                              background:"rgba(255,255,255,.02)",
                              border:"1px solid rgba(255,255,255,.04)",
                              flexWrap:"wrap",
                              gap:8,
                            }}>
                              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                                <span style={{
                                  padding:"3px 8px",
                                  borderRadius:6,
                                  fontSize:11,
                                  fontWeight:700,
                                  textTransform:"uppercase",
                                  background: isPositive ? "rgba(78,222,163,.1)" : "rgba(255,100,100,.1)",
                                  color: isPositive ? "#4edea3" : "#fca5a5",
                                  border: `1px solid ${isPositive ? "rgba(78,222,163,.2)" : "rgba(255,100,100,.2)"}`,
                                }}>
                                  {m.type}
                                </span>
                                <div>
                                  <span style={{ fontWeight:600, fontSize:13, color:S.text }}>{m.productName}</span>
                                  <span style={{ fontSize:12, color:S.dim, marginLeft:6 }}>({m.sku})</span>
                                  {m.reason && <span style={{ fontSize:12, color:S.muted, marginLeft:8 }}>• {m.reason}</span>}
                                  {m.referenceNumber && <span style={{ fontSize:11, color:S.cyan, marginLeft:6, fontFamily:"'JetBrains Mono',monospace" }}>[{m.referenceNumber}]</span>}
                                </div>
                              </div>
                              <div style={{ textAlign:"right" }}>
                                <span style={{
                                  fontWeight:700,
                                  fontFamily:"'JetBrains Mono',monospace",
                                  color: isPositive ? "#4edea3" : "#fca5a5",
                                  fontSize:14,
                                }}>
                                  {isPositive ? `+${m.quantity}` : `-${m.quantity}`}
                                </span>
                                <span style={{ fontSize:11, color:S.dim, marginLeft:10 }}>{dateStr}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Low Stock Alert Microservice Modal */}
          {alertData && (
            <div style={{ position:"fixed", inset:0, background:"rgba(3,20,39,.8)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20 }}>
              <div style={{ background:"#0b1c30", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, maxWidth:680, width:"100%", maxHeight:"90vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 20px 50px rgba(0,0,0,.6)" }}>
                {/* Modal Header */}
                <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:"rgba(245,158,11,.15)", border:"1px solid rgba(245,158,11,.3)", display:"flex", alignItems:"center", justifyContent:"center", color:"#f59e0b" }}>
                      ⚡
                    </div>
                    <div>
                      <h2 style={{ fontSize:18, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", margin:0 }}>Low-Stock Alert Report</h2>
                      <p style={{ fontSize:12, color:S.muted, margin:"2px 0 0" }}>Generated by standalone alert microservice</p>
                    </div>
                  </div>
                  <button onClick={() => setAlertData(null)} style={{ background:"none", border:"none", color:S.muted, fontSize:20, cursor:"pointer" }}>✕</button>
                </div>

                {/* Modal Body */}
                <div style={{ padding:24, overflowY:"auto", display:"flex", flexDirection:"column", gap:20 }}>
                  {/* Summary Metric Pills */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                    <div style={{ background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.25)", borderRadius:12, padding:"12px 16px" }}>
                      <p style={{ fontSize:11, textTransform:"uppercase", color:"#fca5a5", fontWeight:600, margin:0 }}>Out of Stock</p>
                      <p style={{ fontSize:22, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>{alertData.summary?.outOfStockCount || 0}</p>
                    </div>
                    <div style={{ background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.25)", borderRadius:12, padding:"12px 16px" }}>
                      <p style={{ fontSize:11, textTransform:"uppercase", color:"#fcd34d", fontWeight:600, margin:0 }}>Low Stock</p>
                      <p style={{ fontSize:22, fontWeight:800, color:"#f59e0b", margin:"4px 0 0" }}>{alertData.summary?.lowStockCount || 0}</p>
                    </div>
                    <div style={{ background:"rgba(76,215,246,.1)", border:"1px solid rgba(76,215,246,.25)", borderRadius:12, padding:"12px 16px" }}>
                      <p style={{ fontSize:11, textTransform:"uppercase", color:"#bae6fd", fontWeight:600, margin:0 }}>Est. Restock Cost</p>
                      <p style={{ fontSize:18, fontWeight:800, color:"#4cd7f6", margin:"4px 0 0" }}>{Number(alertData.summary?.estimatedRestockCost || 0).toLocaleString()} ETB</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div>
                    <h3 style={{ fontSize:14, fontWeight:600, marginBottom:12, color:S.text }}>Items Needing Restock ({alertData.alerts?.length || 0})</h3>
                    {alertData.alerts?.length === 0 ? (
                      <p style={{ color:S.green, fontSize:13 }}>No low stock alerts! All inventory levels are healthy.</p>
                    ) : (
                      <div style={{ background:"rgba(16,32,52,.6)", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, overflow:"hidden" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                          <thead>
                            <tr style={{ borderBottom:"1px solid rgba(255,255,255,.06)", color:S.dim }}>
                              <th style={{ padding:"10px 14px", textAlign:"left" }}>Product</th>
                              <th style={{ padding:"10px 14px", textAlign:"center" }}>Current / Min</th>
                              <th style={{ padding:"10px 14px", textAlign:"center" }}>Reorder Suggestion</th>
                              <th style={{ padding:"10px 14px", textAlign:"right" }}>Est. Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alertData.alerts?.map((item) => (
                              <tr key={item.productId} style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                                <td style={{ padding:"12px 14px" }}>
                                  <div style={{ fontWeight:600, color:S.text }}>{item.name}</div>
                                  <div style={{ fontSize:11, color:S.muted }}>{item.sku}</div>
                                </td>
                                <td style={{ padding:"12px 14px", textAlign:"center" }}>
                                  <span style={{ fontWeight:700, color: item.status === "OUT_OF_STOCK" ? "#f87171" : "#f59e0b" }}>
                                    {item.currentStock}
                                  </span>
                                  <span style={{ color:S.dim, margin:"0 4px" }}>/</span>
                                  <span style={{ color:S.muted }}>{item.minStock}</span>
                                </td>
                                <td style={{ padding:"12px 14px", textAlign:"center", color:"#4edea3", fontWeight:600 }}>
                                  +{item.suggestedReorder} units
                                </td>
                                <td style={{ padding:"12px 14px", textAlign:"right", color:S.muted }}>
                                  {Number(item.estimatedCost).toLocaleString()} ETB
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Audit Footer Notice */}
                  {alertData.auditLogId && (
                    <div style={{ fontSize:11, color:S.dim, borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:12 }}>
                      Audit log recorded in Firestore: <code style={{ color:S.muted }}>inventoryAlerts/{alertData.auditLogId}</code>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,.08)", display:"flex", justifyContent:"flex-end" }}>
                  <button
                    onClick={() => setAlertData(null)}
                    style={{ padding:"9px 20px", borderRadius:10, background:"rgba(255,255,255,.08)", color:S.text, border:"1px solid rgba(255,255,255,.1)", cursor:"pointer", fontWeight:600, fontSize:13 }}
                  >
                    Close
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
