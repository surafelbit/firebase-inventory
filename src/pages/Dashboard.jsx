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

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const data = await api.get("/products");
        setProducts(data.data || []);
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetch_();
  }, []);

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
            <Link
              to="/products"
              style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"11px 20px", borderRadius:12, background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, boxShadow:"0 0 18px rgba(78,222,163,.25)", transition:"all .2s", whiteSpace:"nowrap" }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 0 28px rgba(78,222,163,.4)"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 0 18px rgba(78,222,163,.25)"; e.currentTarget.style.transform="none"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Add Product
            </Link>
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
                </div>
              </section>
            </>
          )}
      </div>
    </AppLayout>
  );
}

export default Dashboard;
