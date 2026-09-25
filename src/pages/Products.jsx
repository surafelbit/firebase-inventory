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

  // Products state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'

  // Add product form
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

  // Edit product
  const [editingProduct, setEditingProduct] = useState(null);

  // Stock movement modal
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

  const fetchProducts = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const result = await api.get("/products");
      if (result.success) {
        setProducts(result.data || []);
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

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this product from the catalog?"
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

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
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

  // Stock Movement handling
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

  const isStockIncrease = stockType === "received" || stockType === "returned";
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

    if (!isStockIncrease && movementQuantity > selectedProduct.quantity) {
      alert(
        `Insufficient stock available. Current balance is ${selectedProduct.quantity} units.`
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

      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          product.id === selectedProduct.id
            ? { ...product, quantity: result.data.newStock }
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

  // Categories & Filtering
  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  const filteredProducts = products.filter((product) => {
    const searchValue = search.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchValue) ||
      product.sku.toLowerCase().includes(searchValue);

    const matchesCategory =
      category === "all" || product.category === category;

    const qty = Number(product.quantity || 0);
    const min = Number(product.minStock || 0);
    let matchesStatus = true;
    if (statusFilter === "in_stock") matchesStatus = qty > min;
    if (statusFilter === "low_stock") matchesStatus = qty > 0 && qty <= min;
    if (statusFilter === "out_of_stock") matchesStatus = qty === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalCatalogValue = products.reduce(
    (sum, p) => sum + Number(p.quantity || 0) * Number(p.price || 0),
    0
  );
  const totalInStock = products.filter((p) => Number(p.quantity || 0) > Number(p.minStock || 0)).length;
  const totalLowStock = products.filter((p) => Number(p.quantity || 0) > 0 && Number(p.quantity || 0) <= Number(p.minStock || 0)).length;
  const totalDepleted = products.filter((p) => Number(p.quantity || 0) === 0).length;

  return (
    <AppLayout>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Command Center Products Header */}
        <header style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: "1px solid rgba(255,255,255,0.07)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="cc-dot-live" />
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#34d399",
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                Warehouse Catalog & Immutable Ledger
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
              Product Catalog & Stock Ledger
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              Execute inbound/outbound movements, inspect audit trails, and manage SKU specifications.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Export CSV Microservice Trigger */}
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 12,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.3)",
                color: "#34d399",
                fontWeight: 600,
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: exporting ? "not-allowed" : "pointer",
                transition: "all .18s ease",
                opacity: exporting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!exporting) e.currentTarget.style.background = "rgba(16,185,129,0.16)";
              }}
              onMouseLeave={(e) => {
                if (!exporting) e.currentTarget.style.background = "rgba(16,185,129,0.08)";
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exporting ? "Generating CSV..." : "Export CSV"}
            </button>

            {/* Global Audit Ledger Trigger */}
            <button
              onClick={() => openHistoryModal(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 12,
                background: "rgba(6,182,212,0.08)",
                border: "1px solid rgba(6,182,212,0.3)",
                color: "#38bdf8",
                fontWeight: 600,
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                transition: "all .18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(6,182,212,0.16)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(6,182,212,0.08)";
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Global Ledger
            </button>

            {/* Add Product Button */}
            {canManageProducts && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: 13,
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 0 16px rgba(16,185,129,0.35)",
                  cursor: "pointer",
                  transition: "all .18s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(16,185,129,0.55)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 16px rgba(16,185,129,0.35)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Ingest SKU
              </button>
            )}
          </div>
        </header>

        {/* Real-time Telemetry Metrics Ribbon */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 24
        }}>
          <div className="cc-card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Total SKUs</span>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", fontFamily: "'JetBrains Mono', monospace", margin: "4px 0 0" }}>{products.length}</p>
          </div>
          <div className="cc-card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Healthy Stock</span>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#34d399", fontFamily: "'JetBrains Mono', monospace", margin: "4px 0 0" }}>{totalInStock}</p>
          </div>
          <div className="cc-card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Low / Reorder</span>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace", margin: "4px 0 0" }}>{totalLowStock}</p>
          </div>
          <div className="cc-card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Depleted (Zero)</span>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#fb7185", fontFamily: "'JetBrains Mono', monospace", margin: "4px 0 0" }}>{totalDepleted}</p>
          </div>
          <div className="cc-card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Catalog Valuation</span>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace", margin: "6px 0 0" }}>{totalCatalogValue.toLocaleString()} ETB</p>
          </div>
        </section>

        {/* INGEST NEW SKU FORM (Collapsible Panel) */}
        {showForm && (
          <section
            className="cc-card cc-card--accent-emerald"
            style={{
              padding: "26px",
              marginBottom: 24,
              animation: "cc-modal-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <span className="cc-badge cc-badge--emerald" style={{ marginBottom: 6 }}>
                  NEW SKU REGISTRATION
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, color: "#f8fafc" }}>
                  Ingest New Product Specification
                </h2>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>
                  Define product taxonomy, initial warehouse balance, and safety threshold.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#94a3b8",
                  width: 30,
                  height: 30,
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                {[
                  { label: "Product Name", name: "name", type: "text", placeholder: "e.g. Enterprise Router X1" },
                  { label: "SKU Identifier", name: "sku", type: "text", placeholder: "e.g. NET-RTR-01" },
                  { label: "Category", name: "category", type: "text", placeholder: "e.g. Networking" },
                  { label: "Initial Stock Units", name: "quantity", type: "number", placeholder: "e.g. 50", min: "0" },
                  { label: "Unit Price (ETB)", name: "price", type: "number", placeholder: "e.g. 12500", min: "0", step: "0.01" },
                  { label: "Min Stock Threshold", name: "minStock", type: "number", placeholder: "e.g. 10", min: "0" },
                ].map(({ label, ...props }) => (
                  <div key={props.name}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                      {label}
                    </label>
                    <input
                      {...props}
                      value={formData[props.name]}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(6, 19, 37, 0.8)",
                        color: "#f8fafc",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: props.type === "number" || props.name === "sku" ? "'JetBrains Mono', monospace" : "inherit"
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: "#94a3b8",
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 10,
                    background: saving ? "rgba(16,185,129,0.4)" : "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13,
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 0 16px rgba(16,185,129,0.3)"
                  }}
                >
                  {saving ? "Registering SKU..." : "Save Product Specification"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* PRODUCTS DATA GRID */}
        <section className="cc-card" style={{ overflow: "hidden" }}>

          {/* Interactive Filter & Command Toolbar */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255,255,255,0.01)"
          }}>
            {/* Search Input */}
            <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog by SKU, product name..."
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(4, 14, 27, 0.7)",
                  color: "#f8fafc",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(4, 14, 27, 0.8)",
                  color: "#f8fafc",
                  fontSize: 13,
                  outline: "none"
                }}
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(4, 14, 27, 0.8)",
                  color: "#f8fafc",
                  fontSize: 13,
                  outline: "none"
                }}
              >
                <option value="all">All Stock Statuses</option>
                <option value="in_stock">Healthy (In Stock)</option>
                <option value="low_stock">Low Stock (Reorder)</option>
                <option value="out_of_stock">Depleted (Zero)</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <div style={{ minHeight: 340, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
              <div style={{ width: 32, height: 32, border: "3px solid rgba(16,185,129,0.2)", borderTopColor: "#34d399", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 12, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>Syncing catalog telemetry...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ minHeight: 320, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>📦</div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                {products.length === 0 ? "No inventory items registered" : "No matching catalog items"}
              </h2>
              <p style={{ fontSize: 13, color: "#94a3b8", maxWidth: 400, marginTop: 4 }}>
                {products.length === 0
                  ? "Initialize your inventory by adding the first product SKU."
                  : "Refine your search term or reset active category / stock filters."}
              </p>
              {products.length === 0 && canManageProducts && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    marginTop: 18,
                    padding: "9px 20px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  + Ingest First Product
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)" }}>
                    <th style={{ padding: "14px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Product / SKU</th>
                    <th style={{ padding: "14px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Category</th>
                    <th style={{ padding: "14px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Stock Level</th>
                    <th style={{ padding: "14px 18px", textAlign: "right", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Unit Price</th>
                    <th style={{ padding: "14px 18px", textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Status</th>
                    <th style={{ padding: "14px 18px", textAlign: "right", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const quantity = Number(product.quantity || 0);
                    const minStock = Number(product.minStock || 0);
                    const isOut = quantity === 0;
                    const isLow = quantity > 0 && quantity <= minStock;

                    const statusBadge = isOut
                      ? { label: "Depleted", class: "cc-badge--rose", dot: "cc-dot-rose" }
                      : isLow
                      ? { label: "Low Stock", class: "cc-badge--amber", dot: "cc-dot-amber" }
                      : { label: "Healthy", class: "cc-badge--emerald", dot: "cc-dot-live" };

                    // Stock health percentage
                    const capacityTarget = Math.max(minStock * 2, quantity, 10);
                    const fillPct = Math.min(100, Math.round((quantity / capacityTarget) * 100));

                    return (
                      <tr
                        key={product.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          transition: "background .15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {/* Name & SKU */}
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 600, color: "#f8fafc" }}>{product.name}</div>
                          <span style={{
                            display: "inline-block",
                            marginTop: 3,
                            fontSize: 11,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#38bdf8",
                            background: "rgba(6,182,212,0.1)",
                            padding: "1px 6px",
                            borderRadius: 4,
                            border: "1px solid rgba(6,182,212,0.2)"
                          }}>
                            {product.sku}
                          </span>
                        </td>

                        {/* Category */}
                        <td style={{ padding: "14px 18px", color: "#94a3b8" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", fontSize: 12 }}>
                            {product.category || "General"}
                          </span>
                        </td>

                        {/* Stock Level with Mini Gauge */}
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                            <span style={{
                              fontWeight: 700,
                              fontSize: 14,
                              color: isOut ? "#fb7185" : isLow ? "#fbbf24" : "#34d399",
                            }}>
                              {quantity}
                            </span>
                            <span style={{ fontSize: 11, color: "#64748b" }}>
                              / min: {minStock}
                            </span>
                          </div>
                          {/* Mini progress bar */}
                          <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
                            <div style={{
                              height: "100%",
                              width: `${fillPct}%`,
                              background: isOut ? "#f43f5e" : isLow ? "#f59e0b" : "#10b981",
                              borderRadius: 99
                            }} />
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td style={{ padding: "14px 18px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "#cbd5e1" }}>
                          {Number(product.price).toLocaleString()} <span style={{ fontSize: 11, color: "#64748b" }}>ETB</span>
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: "14px 18px", textAlign: "center" }}>
                          <span className={`cc-badge ${statusBadge.class}`}>
                            <span className={statusBadge.dot} />
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Action Operations */}
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          {canManageProducts ? (
                            <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                              {/* Stock Adjustment Action */}
                              <button
                                onClick={() => openStockModal(product)}
                                title="Record stock inbound, sales, or audit"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  background: "rgba(16,185,129,0.1)",
                                  color: "#34d399",
                                  border: "1px solid rgba(16,185,129,0.25)",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                +/- Stock
                              </button>

                              {/* Item Ledger Audit */}
                              <button
                                onClick={() => openHistoryModal(product)}
                                title="View transaction history for this item"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  background: "rgba(6,182,212,0.1)",
                                  color: "#38bdf8",
                                  border: "1px solid rgba(6,182,212,0.25)",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                Ledger
                              </button>

                              {/* Edit SKU */}
                              <button
                                onClick={() => handleEdit(product)}
                                title="Edit product specifications"
                                style={{
                                  padding: "6px 9px",
                                  borderRadius: 8,
                                  background: "rgba(255,255,255,0.05)",
                                  color: "#cbd5e1",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  fontSize: 12,
                                  cursor: "pointer",
                                }}
                              >
                                ✎
                              </button>

                              {/* Delete (Admin only) */}
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  title="Delete product (Admin only)"
                                  style={{
                                    padding: "6px 9px",
                                    borderRadius: 8,
                                    background: "rgba(244,63,94,0.1)",
                                    color: "#fb7185",
                                    border: "1px solid rgba(244,63,94,0.25)",
                                    fontSize: 12,
                                    cursor: "pointer",
                                  }}
                                >
                                  🗑
                                </button>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>Read-only</span>
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

        {/* --------------------------------------------------
            STOCK MOVEMENT MODAL
        -------------------------------------------------- */}
        {showStockModal && selectedProduct && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(2, 8, 19, 0.85)",
            padding: 16,
            backdropFilter: "blur(10px)"
          }}>
            <div
              className="cc-card cc-card--accent-emerald"
              style={{
                width: "100%",
                maxWidth: 500,
                padding: "26px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
                animation: "cc-modal-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <span className="cc-badge cc-badge--emerald" style={{ marginBottom: 6 }}>
                    STOCK TRANSACTION RECORD
                  </span>
                  <h2 style={{ fontSize: 19, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, color: "#f8fafc" }}>
                    {selectedProduct.name}
                  </h2>
                  <p style={{ fontSize: 12, color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                    SKU: {selectedProduct.sku}
                  </p>
                </div>
                <button
                  onClick={closeStockModal}
                  disabled={stockLoading}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#94a3b8",
                    width: 30,
                    height: 30,
                    cursor: "pointer"
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleStockMovement} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                    Transaction Type
                  </label>
                  <select
                    value={stockType}
                    onChange={(e) => setStockType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(6, 19, 37, 0.8)",
                      color: "#f8fafc",
                      fontSize: 13,
                      outline: "none"
                    }}
                  >
                    <option value="received">Inbound / Purchase Order (+)</option>
                    <option value="returned">Customer Return (+)</option>
                    <option value="sold">Dispatched / Sales Outflow (-)</option>
                    <option value="damaged">Damaged / Scrap (-)</option>
                    <option value="lost">Lost / Inventory Shrinkage (-)</option>
                    <option value="adjustment">Physical Audit Adjustment</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                    Units Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Enter units to adjust"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(6, 19, 37, 0.8)",
                      color: "#f8fafc",
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', monospace",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                      Reason / Description
                    </label>
                    <input
                      type="text"
                      value={stockReason}
                      onChange={(e) => setStockReason(e.target.value)}
                      placeholder="e.g. Supplier PO delivery"
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(6, 19, 37, 0.8)",
                        color: "#f8fafc",
                        fontSize: 12,
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                      Reference #
                    </label>
                    <input
                      type="text"
                      value={stockReference}
                      onChange={(e) => setStockReference(e.target.value)}
                      placeholder="e.g. PO-8921"
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(6, 19, 37, 0.8)",
                        color: "#f8fafc",
                        fontSize: 12,
                        fontFamily: "'JetBrains Mono', monospace",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                {/* Calculation Telemetry Strip */}
                <div style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <span style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Current Balance</span>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#cbd5e1", margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>{selectedProduct.quantity}</p>
                  </div>
                  <span style={{ color: isStockIncrease ? "#34d399" : "#fb7185", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 16 }}>
                    {isStockIncrease ? `+${movementQuantity}` : `-${movementQuantity}`}
                  </span>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>New Projected Balance</span>
                    <p style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: newStock < 0 ? "#fb7185" : "#34d399",
                      margin: 0,
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>
                      {newStock}
                    </p>
                  </div>
                </div>

                {/* Error notice if trying to deplete below zero */}
                {!isStockIncrease && movementQuantity > selectedProduct.quantity && movementQuantity > 0 && (
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", fontSize: 12, color: "#fb7185" }}>
                    ⚠ Cannot remove more stock than available balance.
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={closeStockModal}
                    disabled={stockLoading}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: "#94a3b8",
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={stockLoading || !stockQuantity || movementQuantity <= 0 || newStock < 0}
                    style={{
                      flex: 1.5,
                      padding: "10px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13,
                      border: "none",
                      cursor: stockLoading || newStock < 0 ? "not-allowed" : "pointer",
                      opacity: stockLoading || !stockQuantity || movementQuantity <= 0 || newStock < 0 ? 0.6 : 1,
                      boxShadow: "0 0 16px rgba(16,185,129,0.3)"
                    }}
                  >
                    {stockLoading ? "Transacting..." : "Commit Transaction to Ledger"}
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
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(2, 8, 19, 0.85)",
            padding: 20,
            backdropFilter: "blur(10px)"
          }}>
            <div
              className="cc-card"
              style={{
                width: "100%",
                maxWidth: 900,
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid rgba(6,182,212,0.3)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(6,182,212,0.15)",
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
                background: "rgba(6,182,212,0.05)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(6,182,212,0.15)",
                    border: "1px solid rgba(6,182,212,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#38bdf8",
                    fontSize: 18,
                    boxShadow: "0 0 16px rgba(6,182,212,0.2)"
                  }}>
                    📋
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, color: "#f8fafc" }}>
                      {historyProduct ? `Audit Ledger: ${historyProduct.name}` : "Global Inventory Movement Ledger"}
                    </h2>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
                      {historyProduct ? `SKU: ${historyProduct.sku} • Cryptographic & timestamped events` : "Live chronological ledger of all warehouse movements"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#94a3b8",
                    width: 32,
                    height: 32,
                    cursor: "pointer"
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Summary Statistics Strip */}
              {historySummary && (
                <div style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: 12,
                  background: "rgba(0,0,0,0.2)"
                }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>Events Count</span>
                    <p style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>{historySummary.totalTransactions || 0}</p>
                  </div>
                  <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>Total Units In</span>
                    <p style={{ fontSize: 18, fontWeight: 800, color: "#34d399", margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>+{historySummary.totalUnitsIn || 0}</p>
                  </div>
                  <div style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>Total Units Out</span>
                    <p style={{ fontSize: 18, fontWeight: 800, color: "#fb7185", margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>-{historySummary.totalUnitsOut || 0}</p>
                  </div>
                  <div style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>Net Delta</span>
                    <p style={{ fontSize: 18, fontWeight: 800, color: "#38bdf8", margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
                      {(historySummary.netStockChange || 0) > 0 ? "+" : ""}{historySummary.netStockChange || 0}
                    </p>
                  </div>
                </div>
              )}

              {/* Transactions List */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {historyLoading ? (
                  <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ display: "inline-block", width: 32, height: 32, border: "3px solid rgba(6,182,212,0.2)", borderTopColor: "#38bdf8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <p style={{ marginTop: 12, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>Querying ledger records...</p>
                  </div>
                ) : historyMovements.length === 0 ? (
                  <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8" }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>No ledger transactions recorded yet</p>
                    <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                      Record your first stock adjustment to activate the immutable ledger.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {historyMovements.map((movement) => {
                      const isPositive = (movement.delta || 0) > 0;
                      const typeLabel = {
                        received: "RECEIVED",
                        returned: "RETURN",
                        sold: "DISPATCH",
                        damaged: "DAMAGED",
                        lost: "SHRINKAGE",
                        adjustment: "AUDIT ADJ",
                        audit_adjustment: "RECONCILED",
                      }[movement.type] || (movement.type || "").toUpperCase();

                      const dateStr = movement.createdAt
                        ? typeof movement.createdAt === "string"
                          ? new Date(movement.createdAt).toLocaleString()
                          : movement.createdAt._seconds
                          ? new Date(movement.createdAt._seconds * 1000).toLocaleString()
                          : "Recent"
                        : "Recent";

                      return (
                        <div
                          key={movement.id}
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 12,
                            padding: "14px 18px",
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            transition: "background .15s ease",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 220 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{
                                padding: "2px 8px",
                                borderRadius: 5,
                                fontSize: 10,
                                fontWeight: 700,
                                fontFamily: "'JetBrains Mono', monospace",
                                background: isPositive ? "rgba(16,185,129,0.14)" : "rgba(244,63,94,0.14)",
                                color: isPositive ? "#34d399" : "#fb7185",
                                border: `1px solid ${isPositive ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`,
                              }}>
                                {typeLabel}
                              </span>
                              {!historyProduct && (
                                <span style={{ fontWeight: 600, fontSize: 13, color: "#f8fafc" }}>
                                  {movement.productName || "Product"}{" "}
                                  <span style={{ color: "#38bdf8", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>({movement.sku})</span>
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                              {movement.reason || "Inventory action"}
                              {movement.referenceNumber && (
                                <span style={{ marginLeft: 8, padding: "1px 6px", borderRadius: 4, background: "rgba(6,182,212,0.1)", color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                                  Ref: {movement.referenceNumber}
                                </span>
                              )}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                              <span>{dateStr}</span>
                              <span>•</span>
                              <span>By: {movement.recordedBy || "System Operator"}</span>
                            </div>
                          </div>

                          <div style={{ textAlign: "right", minWidth: 120 }}>
                            <p style={{
                              fontSize: 18,
                              fontWeight: 800,
                              fontFamily: "'JetBrains Mono', monospace",
                              color: isPositive ? "#34d399" : "#fb7185",
                              margin: 0,
                            }}>
                              {isPositive ? `+${movement.quantity}` : `-${movement.quantity}`}
                            </p>
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
                              Stock: {movement.previousStock} → <strong style={{ color: "#f8fafc" }}>{movement.newStock}</strong>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#f8fafc",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
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
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(2, 8, 19, 0.85)",
            padding: 16,
            backdropFilter: "blur(10px)"
          }}>
            <div
              className="cc-card cc-card--accent-cyan"
              style={{
                width: "100%",
                maxWidth: 480,
                padding: "26px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
                animation: "cc-modal-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <span className="cc-badge cc-badge--cyan" style={{ marginBottom: 6 }}>
                    SKU RECONFIGURATION
                  </span>
                  <h2 style={{ fontSize: 19, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, color: "#f8fafc" }}>
                    Edit Product Specifications
                  </h2>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#94a3b8",
                    width: 30,
                    height: 30,
                    cursor: "pointer"
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Product Name", key: "name", type: "text" },
                  { label: "SKU Identifier", key: "sku", type: "text" },
                  { label: "Category", key: "category", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                      {label}
                    </label>
                    <input
                      type={type}
                      value={editingProduct[key]}
                      required
                      onChange={(e) => setEditingProduct({ ...editingProduct, [key]: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(6, 19, 37, 0.8)",
                        color: "#f8fafc",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                ))}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Price (ETB)", key: "price", step: "0.01" },
                    { label: "Min Stock Threshold", key: "minStock" },
                  ].map(({ label, key, step }) => (
                    <div key={key}>
                      <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                        {label}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={step}
                        value={editingProduct[key]}
                        required
                        onChange={(e) => setEditingProduct({ ...editingProduct, [key]: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(6, 19, 37, 0.8)",
                          color: "#f8fafc",
                          fontSize: 13,
                          fontFamily: "'JetBrains Mono', monospace",
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                  ))}
                </div>

                <div style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: 12,
                  color: "#94a3b8"
                }}>
                  Current balance: <strong style={{ color: "#34d399", fontFamily: "'JetBrains Mono', monospace" }}>{editingProduct.quantity} units</strong>
                  <p style={{ marginTop: 4, fontSize: 11, color: "#64748b" }}>
                    Physical balance is updated through the dedicated Stock Movement ledger.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: "#94a3b8",
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 1.5,
                      padding: "10px",
                      borderRadius: 10,
                      background: saving ? "rgba(6,182,212,0.4)" : "linear-gradient(135deg, #06b6d4, #0284c7)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13,
                      border: "none",
                      cursor: saving ? "not-allowed" : "pointer"
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}

export default Products;
