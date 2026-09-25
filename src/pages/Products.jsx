
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
  const [stockReason, setStockReason] = useState("");
  const [stockReference, setStockReference] = useState("");
  const [stockLoading, setStockLoading] = useState(false);

  // Stock movement history ledger
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [historyMovements, setHistoryMovements] = useState([]);
  const [historySummary, setHistorySummary] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  const fetchProducts = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

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
    setStockReason("");
    setStockReference("");
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    if (stockLoading) return;

    setShowStockModal(false);
    setSelectedProduct(null);
    setStockQuantity("");
    setStockType("received");
    setStockReason("");
    setStockReference("");
  };

  const openHistoryModal = async (product = null) => {
    setHistoryProduct(product);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await api.getStockMovements({
        productId: product ? product.id : undefined,
        limit: 50,
      });
      setHistoryMovements(res.data || []);
      setHistorySummary(res.summary || null);
    } catch (err) {
      console.error("Failed to load movement ledger:", err);
      alert(err.message || "Could not load stock ledger.");
    } finally {
      setHistoryLoading(false);
    }
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

      const result = await api.recordStockMovement({
        productId: selectedProduct.id,
        type: stockType,
        quantity: movementQuantity,
        reason: stockReason.trim() || undefined,
        referenceNumber: stockReference.trim() || undefined,
      });

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
      alert(error.message || "Failed to record stock movement.");
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

              <button
                onClick={() => openHistoryModal(null)}
                title="View complete stock movement audit ledger"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 18px",
                  borderRadius: 12,
                  background: "rgba(76,215,246,.1)",
                  border: "1px solid rgba(76,215,246,.35)",
                  color: "#4cd7f6",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all .2s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(76,215,246,.18)";
                  e.currentTarget.style.borderColor = "#4cd7f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(76,215,246,.1)";
                  e.currentTarget.style.borderColor = "rgba(76,215,246,.35)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Movement Ledger
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
                                  onClick={() => openHistoryModal(product)}
                                  title="View stock movement history for this item"
                                  style={{
                                    display:"inline-flex", alignItems:"center", gap:5,
                                    padding:"6px 12px", borderRadius:8,
                                    background:"rgba(76,215,246,.08)", color:"#4cd7f6",
                                    border:"1px solid rgba(76,215,246,.25)",
                                    fontSize:12, fontWeight:600, cursor:"pointer",
                                    transition:"all .15s",
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background="rgba(76,215,246,.18)"}
                                  onMouseLeave={e => e.currentTarget.style.background="rgba(76,215,246,.08)"}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                                  </svg>
                                  Audit
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
                  <option value="received">Received / Inbound Shipment (+)</option>
                  <option value="returned">Customer Return (+)</option>
                  <option value="sold">Sold / Dispatch (-)</option>
                  <option value="damaged">Damaged / Waste (-)</option>
                  <option value="lost">Lost / Shrinkage (-)</option>
                </select>
              </div>

              <div>
                <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:"#8aa0b8" }}>Quantity</label>
                <input type="number" min="1" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)}
                  placeholder="Enter quantity" required
                  style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", background:"rgba(16,32,52,.8)", color:"#d3e4fe", fontSize:14, outline:"none", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor="#4edea3"}
                  onBlur={e  => e.target.style.borderColor="rgba(255,255,255,.08)"} />
              </div>

              <div>
                <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:"#8aa0b8" }}>Reason / Notes (Optional)</label>
                <input type="text" value={stockReason} onChange={e => setStockReason(e.target.value)}
                  placeholder="e.g. Vendor shipment, Customer invoice, Physical audit"
                  style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", background:"rgba(16,32,52,.8)", color:"#d3e4fe", fontSize:14, outline:"none", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor="#4edea3"}
                  onBlur={e  => e.target.style.borderColor="rgba(255,255,255,.08)"} />
              </div>

              <div>
                <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:"#8aa0b8" }}>Reference # (Optional)</label>
                <input type="text" value={stockReference} onChange={e => setStockReference(e.target.value)}
                  placeholder="e.g. PO-1049, INV-8821, AUDIT-01"
                  style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", background:"rgba(16,32,52,.8)", color:"#d3e4fe", fontSize:14, outline:"none", boxSizing:"border-box" }}
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
          STOCK MOVEMENT AUDIT LEDGER MODAL
      -------------------------------------------------- */}
      {showHistoryModal && (
        <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,.75)", padding:20, backdropFilter:"blur(8px)" }}>
          <div style={{ width:"100%", maxWidth:880, maxHeight:"90vh", display:"flex", flexDirection:"column", background:"rgba(11,28,48,.98)", border:"1px solid rgba(255,255,255,.12)", borderRadius:20, padding:28, boxShadow:"0 40px 100px rgba(0,0,0,.6)", overflow:"hidden" }}>
            
            {/* Modal Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <p style={{ fontSize:12, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#4cd7f6", marginBottom:4 }}>Audit Trail</p>
                <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#d3e4fe", marginBottom:4 }}>
                  {historyProduct ? `Movement History: ${historyProduct.name}` : "Global Stock Movement Ledger"}
                </h2>
                <p style={{ fontSize:13, color:"#8aa0b8" }}>
                  {historyProduct ? `SKU: ${historyProduct.sku} | Track all inbound, outbound, and adjustment events.` : "Live chronological ledger of all inventory transactions."}
                </p>
              </div>
              <button onClick={() => setShowHistoryModal(false)}
                style={{ background:"rgba(255,255,255,.06)", border:"none", color:"#8aa0b8", width:36, height:36, borderRadius:10, fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background .2s" }}>✕</button>
            </div>

            {/* Summary Statistics Bar */}
            {historySummary && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:12, marginBottom:20 }}>
                <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"12px 16px" }}>
                  <span style={{ fontSize:11, color:"#8aa0b8", textTransform:"uppercase", letterSpacing:".05em" }}>Transactions</span>
                  <p style={{ fontSize:20, fontWeight:700, color:"#d3e4fe", marginTop:2 }}>{historySummary.totalTransactions || 0}</p>
                </div>
                <div style={{ background:"rgba(78,222,163,.06)", border:"1px solid rgba(78,222,163,.2)", borderRadius:12, padding:"12px 16px" }}>
                  <span style={{ fontSize:11, color:"#8aa0b8", textTransform:"uppercase", letterSpacing:".05em" }}>Units In</span>
                  <p style={{ fontSize:20, fontWeight:700, color:"#4edea3", marginTop:2 }}>+{historySummary.totalUnitsIn || 0}</p>
                </div>
                <div style={{ background:"rgba(255,100,100,.06)", border:"1px solid rgba(255,100,100,.2)", borderRadius:12, padding:"12px 16px" }}>
                  <span style={{ fontSize:11, color:"#8aa0b8", textTransform:"uppercase", letterSpacing:".05em" }}>Units Out</span>
                  <p style={{ fontSize:20, fontWeight:700, color:"#fca5a5", marginTop:2 }}>-{historySummary.totalUnitsOut || 0}</p>
                </div>
                <div style={{ background:"rgba(76,215,246,.06)", border:"1px solid rgba(76,215,246,.2)", borderRadius:12, padding:"12px 16px" }}>
                  <span style={{ fontSize:11, color:"#8aa0b8", textTransform:"uppercase", letterSpacing:".05em" }}>Net Delta</span>
                  <p style={{ fontSize:20, fontWeight:700, color:"#4cd7f6", marginTop:2 }}>
                    {(historySummary.netStockChange || 0) > 0 ? "+" : ""}{historySummary.netStockChange || 0}
                  </p>
                </div>
              </div>
            )}

            {/* Content List */}
            <div style={{ flex:1, overflowY:"auto", paddingRight:4 }}>
              {historyLoading ? (
                <div style={{ padding:"48px 0", textAlign:"center", color:"#8aa0b8" }}>
                  <div style={{ display:"inline-block", width:32, height:32, border:"3px solid rgba(76,215,246,.2)", borderTopColor:"#4cd7f6", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
                  <p style={{ marginTop:12, fontSize:14 }}>Fetching movement records from microservice...</p>
                </div>
              ) : historyMovements.length === 0 ? (
                <div style={{ padding:"48px 0", textAlign:"center", color:"#8aa0b8" }}>
                  <p style={{ fontSize:15, fontWeight:600, color:"#d3e4fe" }}>No stock movements recorded yet</p>
                  <p style={{ fontSize:13, color:"#5a7a9a", marginTop:4 }}>Perform stock adjustments or inbound receipts to generate ledger audit logs.</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {historyMovements.map((movement) => {
                    const isPositive = (movement.delta || 0) > 0;
                    const typeLabel = {
                      received: "Received / Inbound",
                      returned: "Customer Return",
                      sold: "Sold / Dispatched",
                      damaged: "Damaged / Waste",
                      lost: "Lost / Shrinkage",
                      adjustment: "Audit Adjustment",
                      audit_adjustment: "Audit Reconciliation",
                    }[movement.type] || movement.type;

                    const badgeStyle = isPositive
                      ? { bg: "rgba(78,222,163,.12)", color: "#4edea3", border: "rgba(78,222,163,.3)" }
                      : { bg: "rgba(255,100,100,.12)", color: "#fca5a5", border: "rgba(255,100,100,.3)" };

                    const dateStr = movement.createdAt
                      ? typeof movement.createdAt === "string"
                        ? new Date(movement.createdAt).toLocaleString()
                        : movement.createdAt._seconds
                        ? new Date(movement.createdAt._seconds * 1000).toLocaleString()
                        : "Just now"
                      : "Recent";

                    return (
                      <div key={movement.id}
                        style={{
                          background:"rgba(255,255,255,.025)",
                          border:"1px solid rgba(255,255,255,.06)",
                          borderRadius:14,
                          padding:"14px 18px",
                          display:"flex",
                          flexWrap:"wrap",
                          justifyContent:"space-between",
                          alignItems:"center",
                          gap:12,
                          transition:"background .15s ease",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.045)"}
                        onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.025)"}
                      >
                        <div style={{ display:"flex", flexDirection:"column", gap:4, minWidth:200 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{
                              padding:"2px 8px",
                              borderRadius:6,
                              fontSize:11,
                              fontWeight:700,
                              textTransform:"uppercase",
                              background: badgeStyle.bg,
                              color: badgeStyle.color,
                              border: `1px solid ${badgeStyle.border}`,
                            }}>
                              {typeLabel}
                            </span>
                            {!historyProduct && (
                              <span style={{ fontWeight:600, fontSize:13, color:"#d3e4fe" }}>
                                {movement.productName || "Product"} <span style={{ color:"#5a7a9a", fontSize:12 }}>({movement.sku})</span>
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize:13, color:"#8aa0b8", margin:0 }}>
                            {movement.reason || "Manual inventory action"}
                            {movement.referenceNumber && (
                              <span style={{ marginLeft:8, padding:"1px 6px", borderRadius:4, background:"rgba(255,255,255,.05)", color:"#4cd7f6", fontFamily:"'JetBrains Mono',monospace", fontSize:11 }}>
                                Ref: {movement.referenceNumber}
                              </span>
                            )}
                          </p>
                          <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:12, color:"#5a7a9a" }}>
                            <span>{dateStr}</span>
                            <span>•</span>
                            <span>By: {movement.recordedBy || "System"}</span>
                          </div>
                        </div>

                        <div style={{ textAlign:"right", minWidth:120 }}>
                          <p style={{
                            fontSize:18,
                            fontWeight:800,
                            fontFamily:"'JetBrains Mono',monospace",
                            color: isPositive ? "#4edea3" : "#fca5a5",
                            margin:0,
                          }}>
                            {isPositive ? `+${movement.quantity}` : `-${movement.quantity}`}
                          </p>
                          <p style={{ fontSize:12, color:"#8aa0b8", margin:"2px 0 0" }}>
                            Stock: {movement.previousStock} → <strong style={{ color:"#d3e4fe" }}>{movement.newStock}</strong>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid rgba(255,255,255,.08)", display:"flex", justifyContent:"flex-end" }}>
              <button onClick={() => setShowHistoryModal(false)}
                style={{ padding:"10px 20px", borderRadius:10, border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.05)", color:"#d3e4fe", fontSize:14, fontWeight:600, cursor:"pointer" }}>
                Close Ledger
              </button>
            </div>
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
