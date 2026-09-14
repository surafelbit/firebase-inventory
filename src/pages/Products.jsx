
import { useEffect, useState } from "react";
import { AppLayout } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

function Products() {
  const { user, userData } = useAuth();

  const emailLower = (user?.email || "").toLowerCase();
  const role = (
    userData?.role ||
    (emailLower.includes("admin") ? "admin" :
     emailLower.includes("staff") ? "staff" : "viewer")
  ).toLowerCase().trim();

  const isAdmin = role === "admin";
  const isStaff = role === "staff";

  const canManageProducts = isAdmin || isStaff;
  const canDelete = isAdmin;

  // Products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search / filter
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Add product
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    price: "",
    minStock: "",
  });

  // Edit product information
  const [editingProduct, setEditingProduct] = useState(null);

  // Stock movement
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockType, setStockType] = useState("received");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockLoading, setStockLoading] = useState(false);

  // Export CSV
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      await api.downloadCSV();
    } catch (error) {
      console.error("Export error:", error);
      alert(error.message || "Failed to export inventory CSV.");
    } finally {
      setExporting(false);
    }
  };

  // --------------------------------------------------
  // FETCH PRODUCTS
  // --------------------------------------------------

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const result = await api.get("/products");

      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --------------------------------------------------
  // ADD PRODUCT
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await api.post("/products", {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        minStock: Number(formData.minStock),
      });

      setFormData({
        name: "",
        sku: "",
        category: "",
        quantity: "",
        price: "",
        minStock: "",
      });

      setShowForm(false);

      await fetchProducts();
    } catch (error) {
      console.error("Create product error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE PRODUCT
  // --------------------------------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${id}`);

      setProducts((previousProducts) =>
        previousProducts.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error("Delete product error:", error);
      alert(error.message);
    }
  };

  // --------------------------------------------------
  // EDIT PRODUCT INFORMATION
  // --------------------------------------------------

  const handleEdit = (product) => {
    setEditingProduct({
      ...product,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await api.put(`/products/${editingProduct.id}`, {
        name: editingProduct.name,
        sku: editingProduct.sku,
        category: editingProduct.category,
        price: Number(editingProduct.price),
        minStock: Number(editingProduct.minStock),
      });

      setEditingProduct(null);

      await fetchProducts();
    } catch (error) {
      console.error("Update product error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // STOCK MOVEMENT
  // --------------------------------------------------

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockType("received");
    setStockQuantity("");
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    if (stockLoading) return;

    setShowStockModal(false);
    setSelectedProduct(null);
    setStockQuantity("");
    setStockType("received");
  };

  const isStockIncrease =
    stockType === "received" ||
    stockType === "returned";

  const movementQuantity = Number(stockQuantity) || 0;

  const newStock = selectedProduct
    ? isStockIncrease
      ? Number(selectedProduct.quantity) + movementQuantity
      : Number(selectedProduct.quantity) - movementQuantity
    : 0;

  const handleStockMovement = async (e) => {
    e.preventDefault();

    if (!selectedProduct) return;

    if (!stockQuantity || movementQuantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    // Prevent a negative preview before sending the request
    if (!isStockIncrease && movementQuantity > selectedProduct.quantity) {
      alert(
        `Insufficient stock. Only ${selectedProduct.quantity} units are available.`
      );
      return;
    }

    try {
      setStockLoading(true);

      const result = await api.post(
        `/products/${selectedProduct.id}/stock`,
        {
          type: stockType,
          quantity: movementQuantity,
        }
      );

      // Update the product immediately in the UI
      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          product.id === selectedProduct.id
            ? {
              ...product,
              quantity: result.data.newStock,
            }
            : product
        )
      );

      closeStockModal();
    } catch (error) {
      console.error("Stock movement error:", error);
      alert(error.message);
    } finally {
      setStockLoading(false);
    }
  };

  // --------------------------------------------------
  // SEARCH / FILTER
  // --------------------------------------------------

  const categories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  const filteredProducts = products.filter((product) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(searchValue) ||
      product.sku.toLowerCase().includes(searchValue);

    const matchesCategory =
      category === "all" ||
      product.category === category;

    return matchesSearch && matchesCategory;
  });

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <AppLayout>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"32px 24px 64px", color:"#d3e4fe" }}>

          {/* HEADER */}
          <header style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"flex-start", gap:16, marginBottom:32 }}>
            <div>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#4edea3", marginBottom:6 }}>Inventory</p>
              <h1 style={{ fontSize:30, fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:6 }}>Products</h1>
              <p style={{ fontSize:14, color:"#8aa0b8" }}>Manage products and track inventory movements.</p>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button
                onClick={handleExportCSV}
                disabled={exporting}
                title="Download all inventory data as CSV report"
                style={{
                  display:"inline-flex",
                  alignItems:"center",
                  gap:8,
                  padding:"11px 18px",
                  borderRadius:12,
                  background:"rgba(11,28,48,.8)",
                  border:"1px solid rgba(78,222,163,.35)",
                  color:"#4edea3",
                  fontWeight:600,
                  fontSize:14,
                  cursor: exporting ? "not-allowed" : "pointer",
                  whiteSpace:"nowrap",
                  transition:"all .2s ease",
                  opacity: exporting ? 0.7 : 1,
                  boxShadow:"0 2px 8px rgba(0,0,0,.2)",
                }}
                onMouseEnter={(e) => {
                  if (!exporting) {
                    e.currentTarget.style.background = "rgba(78,222,163,.12)";
                    e.currentTarget.style.borderColor = "#4edea3";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!exporting) {
                    e.currentTarget.style.background = "rgba(11,28,48,.8)";
                    e.currentTarget.style.borderColor = "rgba(78,222,163,.35)";
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {exporting ? "Exporting..." : "Export CSV"}
              </button>

              {canManageProducts && (
                <button
                  onClick={() => { setEditingProduct(null); setShowForm(true); }}
                  style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"11px 20px", borderRadius:12, background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, border:"none", cursor:"pointer", boxShadow:"0 0 18px rgba(78,222,163,.25)", whiteSpace:"nowrap" }}
                >
                  + Add Product
                </button>
              )}
            </div>
          </header>

          {/* ADD PRODUCT FORM */}
          {showForm && (
            <section style={{ marginBottom:24, background:"rgba(11,28,48,.75)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
                <div>
                  <h2 style={{ fontSize:18, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:4 }}>Add New Product</h2>
                  <p style={{ fontSize:13, color:"#8aa0b8" }}>Enter the product information below.</p>
                </div>
                <button onClick={() => setShowForm(false)} style={{ background:"none", border:"none", color:"#8aa0b8", fontSize:20, cursor:"pointer", lineHeight:1 }}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16 }}>
                  {[
                    { label:"Product Name", name:"name",     type:"text",   placeholder:"e.g. Wireless Mouse" },
                    { label:"SKU",          name:"sku",      type:"text",   placeholder:"e.g. WM-001" },
                    { label:"Category",    name:"category", type:"text",   placeholder:"e.g. Electronics" },
                    { label:"Initial Stock",name:"quantity", type:"number", placeholder:"e.g. 25",  min:"0" },
                    { label:"Price (ETB)", name:"price",    type:"number", placeholder:"e.g. 750", min:"0", step:"0.01" },
                    { label:"Min Stock",   name:"minStock", type:"number", placeholder:"e.g. 5",   min:"0" },
                  ].map(({ label, ...props }) => (
                    <div key={props.name}>
                      <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:"#8aa0b8" }}>{label}</label>
                      <input
                        {...props}
                        value={formData[props.name]}
                        onChange={handleChange}
                        required
                        style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", background:"rgba(16,32,52,.8)", color:"#d3e4fe", fontSize:14, outline:"none", boxSizing:"border-box" }}
                        onFocus={e => e.target.style.borderColor="#4edea3"}
                        onBlur={e  => e.target.style.borderColor="rgba(255,255,255,.08)"}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginTop:20 }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ padding:"10px 20px", borderRadius:10, border:"1px solid rgba(255,255,255,.1)", background:"transparent", color:"#8aa0b8", fontSize:14, cursor:"pointer" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ padding:"10px 22px", borderRadius:10, background: saving?"rgba(16,185,129,.4)":"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, border:"none", cursor: saving?"not-allowed":"pointer", boxShadow: saving?"none":"0 0 16px rgba(78,222,163,.2)" }}>
                    {saving ? "Creating…" : "Create Product"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* PRODUCTS TABLE */}
          <section style={{ background:"rgba(11,28,48,.75)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, overflow:"hidden" }}>

            {/* FILTERS */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:12, padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or SKU…"
                style={{ flex:1, minWidth:200, padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", background:"rgba(16,32,52,.8)", color:"#d3e4fe", fontSize:14, outline:"none" }}
                onFocus={e => e.target.style.borderColor="#4edea3"}
                onBlur={e  => e.target.style.borderColor="rgba(255,255,255,.08)"}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", background:"rgba(16,32,52,.8)", color:"#d3e4fe", fontSize:14, outline:"none" }}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {loading ? (
              <div style={{ minHeight:320, display:"flex", alignItems:"center", justifyContent:"center", color:"#8aa0b8" }}>Loading products…</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ minHeight:320, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:32 }}>
                <div style={{ fontSize:40, marginBottom:16 }}>📦</div>
                <h2 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{products.length === 0 ? "No products yet" : "No products found"}</h2>
                <p style={{ fontSize:13, color:"#8aa0b8", maxWidth:380, lineHeight:1.65, marginBottom: products.length===0 && canManageProducts ? 20 : 0 }}>
                  {products.length === 0 ? "Your inventory doesn't have any products yet." : "Try changing your search or category filter."}
                </p>
                {products.length === 0 && canManageProducts && (
                  <button onClick={() => setShowForm(true)}
                    style={{ padding:"10px 22px", borderRadius:10, background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, border:"none", cursor:"pointer" }}>
                    + Add Your First Product
                  </button>
                )}
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                      {["Product","SKU","Category","Qty","Price (ETB)","Status","Actions"].map(h => (
                        <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", color:"#3a5a7a", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const quantity  = Number(product.quantity);
                      const minStock  = Number(product.minStock);
                      const isOut     = quantity === 0;
                      const isLow     = quantity > 0 && quantity <= minStock;
                      const badge     = isOut
                        ? { label:"Out of Stock", bg:"rgba(255,100,100,.1)",  color:"#fca5a5", border:"rgba(255,100,100,.2)" }
                        : isLow
                        ? { label:"Low Stock",    bg:"rgba(245,158,11,.1)",   color:"#fbbf24", border:"rgba(245,158,11,.2)" }
                        : { label:"In Stock",     bg:"rgba(78,222,163,.1)",   color:"#4edea3", border:"rgba(78,222,163,.2)" };
                      return (
                        <tr key={product.id} style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.02)"}
                          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"14px 16px", fontWeight:600, color:"#d3e4fe" }}>{product.name}</td>
                          <td style={{ padding:"14px 16px", color:"#8aa0b8", fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>{product.sku}</td>
                          <td style={{ padding:"14px 16px", color:"#8aa0b8" }}>{product.category}</td>
                          <td style={{ padding:"14px 16px", fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color: isOut?"#fca5a5" : isLow?"#fbbf24" : "#4edea3" }}>{quantity}</td>
                          <td style={{ padding:"14px 16px", color:"#d3e4fe" }}>{Number(product.price).toLocaleString()}</td>
                          <td style={{ padding:"14px 16px" }}>
                            <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:badge.bg, color:badge.color, border:`1px solid ${badge.border}` }}>{badge.label}</span>
                          </td>
                          <td style={{ padding:"14px 16px" }}>
                            {canManageProducts ? (
                              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                                <button
                                  onClick={() => openStockModal(product)}
                                  title="Adjust stock (received/sold/returned)"
                                  style={{
                                    display:"inline-flex", alignItems:"center", gap:5,
                                    padding:"6px 12px", borderRadius:8,
                                    background:"rgba(78,222,163,.1)", color:"#4edea3",
                                    border:"1px solid rgba(78,222,163,.25)",
                                    fontSize:12, fontWeight:600, cursor:"pointer",
                                    transition:"all .15s",
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background="rgba(78,222,163,.2)"}
                                  onMouseLeave={e => e.currentTarget.style.background="rgba(78,222,163,.1)"}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4 10h12v2H4zm0-4h16v2H4zm0 8h8v2H4zm10 0v6l5-3z"/>
                                  </svg>
                                  Stock
                                </button>
                                <button
                                  onClick={() => handleEdit(product)}
                                  title="Edit product details"
                                  style={{
                                    display:"inline-flex", alignItems:"center", gap:5,
                                    padding:"6px 12px", borderRadius:8,
                                    background:"rgba(76,215,246,.1)", color:"#4cd7f6",
                                    border:"1px solid rgba(76,215,246,.25)",
                                    fontSize:12, fontWeight:600, cursor:"pointer",
                                    transition:"all .15s",
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background="rgba(76,215,246,.2)"}
                                  onMouseLeave={e => e.currentTarget.style.background="rgba(76,215,246,.1)"}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                  </svg>
                                  Edit
                                </button>
                                {canDelete ? (
                                  <button
                                    onClick={() => handleDelete(product.id)}
                                    title="Delete product (Admin only)"
                                    style={{
                                      display:"inline-flex", alignItems:"center", gap:5,
                                      padding:"6px 12px", borderRadius:8,
                                      background:"rgba(255,100,100,.1)", color:"#fca5a5",
                                      border:"1px solid rgba(255,100,100,.25)",
                                      fontSize:12, fontWeight:600, cursor:"pointer",
                                      transition:"all .15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background="rgba(255,100,100,.2)"}
                                    onMouseLeave={e => e.currentTarget.style.background="rgba(255,100,100,.1)"}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                    </svg>
                                    Delete
                                  </button>
                                ) : (
                                  <span title="Staff members cannot delete products" style={{ fontSize:11, color:"#5a7a9a", fontStyle:"italic", padding:"4px 6px" }}>
                                    (No delete)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize:12, color:"#5a7a9a" }}>View only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

      {/* STOCK MOVEMENT MODAL
      -------------------------------------------------- */}

      {showStockModal && selectedProduct && (
        <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,.7)", padding:16, backdropFilter:"blur(8px)" }}>
          <div style={{ width:"100%", maxWidth:480, background:"rgba(11,28,48,.97)", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, padding:28, boxShadow:"0 40px 100px rgba(0,0,0,.5)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <p style={{ fontSize:12, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"#4edea3", marginBottom:4 }}>Stock Movement</p>
                <h2 style={{ fontSize:20, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:3 }}>{selectedProduct.name}</h2>
                <p style={{ fontSize:13, color:"#8aa0b8" }}>SKU: {selectedProduct.sku}</p>
              </div>
              <button onClick={closeStockModal} disabled={stockLoading}
                style={{ background:"none", border:"none", color:"#8aa0b8", fontSize:22, cursor:"pointer", lineHeight:1, opacity: stockLoading?.5:1 }}>×</button>
            </div>

            <form onSubmit={handleStockMovement} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:"#8aa0b8" }}>Stock Action</label>
                <select value={stockType} onChange={e => setStockType(e.target.value)}
                  style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", background:"rgba(16,32,52,.9)", color:"#d3e4fe", fontSize:14, outline:"none" }}>
                  <option value="received">Received / Imported</option>
                  <option value="sold">Sold</option>
                  <option value="returned">Customer Return</option>
                  <option value="damaged">Damaged / Lost</option>
                </select>
              </div>

              <div>
                <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:"#8aa0b8" }}>Quantity</label>
                <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)}
                  placeholder="Enter quantity" required
                  style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", background:"rgba(16,32,52,.8)", color:"#d3e4fe", fontSize:14, outline:"none" }}
                  onFocus={e => e.target.style.borderColor="#4edea3"}
                  onBlur={e  => e.target.style.borderColor="rgba(255,255,255,.08)"} />
              </div>

              {/* Preview */}
              <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:16, display:"flex", flexDirection:"column", gap:10 }}>
                {[{label:"Current stock", val:selectedProduct.quantity, color:"#d3e4fe"},
                  {label:"Movement", val:`${isStockIncrease?"+":"-"}${movementQuantity}`, color: isStockIncrease?"#4edea3":"#fca5a5"},
                  {label:"New stock",     val:newStock, color: newStock<0?"#fca5a5":"#d3e4fe", bold:true}]
                  .map(({label,val,color,bold}) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:13, color:"#8aa0b8" }}>{label}</span>
                    <span style={{ fontWeight: bold?700:600, color, fontSize: bold?16:14, fontFamily:"'JetBrains Mono',monospace" }}>{val}</span>
                  </div>
                ))}
              </div>

              {!isStockIncrease && movementQuantity > selectedProduct.quantity && movementQuantity > 0 && (
                <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(255,75,75,.08)", border:"1px solid rgba(255,75,75,.2)", fontSize:13, color:"#fca5a5" }}>
                  Cannot remove more stock than available.
                </div>
              )}

              <div style={{ display:"flex", gap:12 }}>
                <button type="button" onClick={closeStockModal} disabled={stockLoading}
                  style={{ flex:1, padding:"11px", borderRadius:10, border:"1px solid rgba(255,255,255,.1)", background:"transparent", color:"#8aa0b8", fontSize:14, cursor:"pointer" }}>Cancel</button>
                <button type="submit" disabled={stockLoading||!stockQuantity||movementQuantity<=0||newStock<0}
                  style={{ flex:1, padding:"11px", borderRadius:10, background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, border:"none", cursor: (stockLoading||newStock<0)?"not-allowed":"pointer", opacity:(stockLoading||!stockQuantity||movementQuantity<=0||newStock<0)?.5:1 }}>
                  {stockLoading ? "Updating…" : "Confirm Movement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------
          EDIT PRODUCT MODAL
      -------------------------------------------------- */}

      {editingProduct && (
        <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,.7)", padding:16, backdropFilter:"blur(8px)" }}>

          <div style={{ width:"100%", maxWidth:480, background:"rgba(11,28,48,.97)", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, padding:28, boxShadow:"0 40px 100px rgba(0,0,0,.5)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:4 }}>Edit Product</h2>
                <p style={{ fontSize:13, color:"#8aa0b8" }}>Update product information.</p>
              </div>
              <button onClick={() => setEditingProduct(null)}
                style={{ background:"none", border:"none", color:"#8aa0b8", fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
            </div>

            <form onSubmit={handleUpdate} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { label:"Product Name", key:"name",     type:"text" },
                { label:"SKU",          key:"sku",      type:"text" },
                { label:"Category",    key:"category", type:"text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:"#8aa0b8" }}>{label}</label>
                  <input type={type} value={editingProduct[key]} required
                    onChange={e => setEditingProduct({ ...editingProduct, [key]: e.target.value })}
                    style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", background:"rgba(16,32,52,.8)", color:"#d3e4fe", fontSize:14, outline:"none", boxSizing:"border-box" }}
                    onFocus={e => e.target.style.borderColor="#4edea3"}
                    onBlur={e  => e.target.style.borderColor="rgba(255,255,255,.08)"} />
                </div>
              ))}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[
                  { label:"Price (ETB)", key:"price",    step:"0.01" },
                  { label:"Min Stock",   key:"minStock" },
                ].map(({ label, key, step }) => (
                  <div key={key}>
                    <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:"#8aa0b8" }}>{label}</label>
                    <input type="number" min="0" step={step} value={editingProduct[key]} required
                      onChange={e => setEditingProduct({ ...editingProduct, [key]: e.target.value })}
                      style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", background:"rgba(16,32,52,.8)", color:"#d3e4fe", fontSize:14, outline:"none", boxSizing:"border-box" }}
                      onFocus={e => e.target.style.borderColor="#4edea3"}
                      onBlur={e  => e.target.style.borderColor="rgba(255,255,255,.08)"} />
                  </div>
                ))}
              </div>

              <div style={{ padding:"12px 14px", borderRadius:10, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", fontSize:13, color:"#8aa0b8" }}>
                Current stock: <strong style={{ color:"#d3e4fe" }}>{editingProduct.quantity}</strong>
                <p style={{ marginTop:4, fontSize:12, color:"#3a5a7a" }}>Use Stock Movement to change quantity.</p>
              </div>

              <div style={{ display:"flex", gap:12 }}>
                <button type="button" onClick={() => setEditingProduct(null)}
                  style={{ flex:1, padding:"11px", borderRadius:10, border:"1px solid rgba(255,255,255,.1)", background:"transparent", color:"#8aa0b8", fontSize:14, cursor:"pointer" }}>Cancel</button>
                <button type="submit" disabled={saving}
                  style={{ flex:1, padding:"11px", borderRadius:10, background: saving?"rgba(16,185,129,.4)":"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, border:"none", cursor: saving?"not-allowed":"pointer" }}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Products;
