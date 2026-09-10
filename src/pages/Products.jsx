
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const API_URL =
  "http://127.0.0.1:5001/inventory-app-19292/us-central1/api";

function Products() {
  const { userData } = useAuth();

  const role = userData?.role;

  const canManageProducts =
    role === "admin" || role === "staff";

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

  // --------------------------------------------------
  // FETCH PRODUCTS
  // --------------------------------------------------

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();

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

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
          minStock: Number(formData.minStock),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create product"
        );
      }

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
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete product"
        );
      }

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

      const response = await fetch(
        `${API_URL}/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingProduct.name,
            sku: editingProduct.sku,
            category: editingProduct.category,
            price: Number(editingProduct.price),
            minStock: Number(editingProduct.minStock),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update product"
        );
      }

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

      const response = await fetch(
        `${API_URL}/products/${selectedProduct.id}/stock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: stockType,
            quantity: movementQuantity,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update stock"
        );
      }

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
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

          {/* HEADER */}
          <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-indigo-400">
                Inventory
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                Products
              </h1>

              <p className="mt-2 text-slate-500">
                Manage products and track inventory movements.
              </p>
            </div>

            {canManageProducts && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(true);
                }}
                className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
              >
                + Add Product
              </button>
            )}
          </header>

          {/* ADD PRODUCT FORM */}
          {showForm && (
            <section className="mt-8 rounded-xl border border-white/10 bg-slate-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Add New Product
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter the product information below.
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(false)}
                  className="text-xl text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">

                  {/* NAME */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Product Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Wireless Mouse"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-500"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      SKU
                    </label>

                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="e.g. WM-001"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-500"
                    />
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Category
                    </label>

                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="e.g. Electronics"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-500"
                    />
                  </div>

                  {/* INITIAL QUANTITY */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Initial Stock
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="e.g. 25"
                      min="0"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-500"
                    />
                  </div>

                  {/* PRICE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Price (ETB)
                    </label>

                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g. 750"
                      min="0"
                      step="0.01"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-500"
                    />
                  </div>

                  {/* MIN STOCK */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Minimum Stock
                    </label>

                    <input
                      type="number"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleChange}
                      placeholder="e.g. 5"
                      min="0"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Creating..."
                      : "Create Product"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* PRODUCTS */}
          <section className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-slate-900">

            {/* FILTERS */}
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name or SKU..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-500"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300 outline-none focus:border-indigo-500"
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* CONTENT */}
            {loading ? (
              <div className="flex min-h-96 items-center justify-center">
                <p className="text-slate-500">
                  Loading products...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex min-h-96 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
                  📦
                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  {products.length === 0
                    ? "No products yet"
                    : "No products found"}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {products.length === 0
                    ? "Your inventory doesn't have any products yet. Add your first product to start managing your stock."
                    : "Try changing your search or category filter."}
                </p>

                {products.length === 0 &&
                  canManageProducts && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-6 rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
                    >
                      + Add Your First Product
                    </button>
                  )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">

                  <thead className="border-b border-white/10 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">
                        Product
                      </th>

                      <th className="px-6 py-4">
                        SKU
                      </th>

                      <th className="px-6 py-4">
                        Category
                      </th>

                      <th className="px-6 py-4">
                        Quantity
                      </th>

                      <th className="px-6 py-4">
                        Price
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => {
                      const quantity = Number(product.quantity);
                      const minStock = Number(product.minStock);

                      const isOutOfStock =
                        quantity === 0;

                      const isLowStock =
                        quantity > 0 &&
                        quantity <= minStock;

                      return (
                        <tr
                          key={product.id}
                          className="border-b border-white/5 transition hover:bg-white/[0.02]"
                        >
                          <td className="px-6 py-4 font-medium">
                            {product.name}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {product.sku}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {product.category}
                          </td>

                          <td className="px-6 py-4 font-medium">
                            {quantity}
                          </td>

                          <td className="px-6 py-4">
                            ETB{" "}
                            {Number(
                              product.price
                            ).toLocaleString()}
                          </td>

                          <td className="px-6 py-4">
                            {isOutOfStock ? (
                              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                                Low Stock
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                In Stock
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {canManageProducts && (
                              <div className="flex flex-wrap gap-3">

                                <button
                                  onClick={() =>
                                    openStockModal(product)
                                  }
                                  className="text-emerald-400 transition hover:text-emerald-300"
                                >
                                  Stock
                                </button>

                                <button
                                  onClick={() =>
                                    handleEdit(product)
                                  }
                                  className="text-indigo-400 transition hover:text-indigo-300"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() =>
                                    handleDelete(
                                      product.id
                                    )
                                  }
                                  className="text-red-400 transition hover:text-red-300"
                                >
                                  Delete
                                </button>

                              </div>
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
      </main>

      {/* --------------------------------------------------
          STOCK MOVEMENT MODAL
      -------------------------------------------------- */}

      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm text-indigo-400">
                  Inventory Movement
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  {selectedProduct.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  SKU: {selectedProduct.sku}
                </p>
              </div>

              <button
                onClick={closeStockModal}
                disabled={stockLoading}
                className="text-2xl text-slate-400 transition hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleStockMovement}
              className="space-y-5"
            >

              {/* MOVEMENT TYPE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Stock Action
                </label>

                <select
                  value={stockType}
                  onChange={(e) =>
                    setStockType(e.target.value)
                  }
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                >
                  <option value="received">
                    Received / Imported
                  </option>

                  <option value="sold">
                    Sold
                  </option>

                  <option value="returned">
                    Customer Return
                  </option>

                  <option value="damaged">
                    Damaged / Lost
                  </option>
                </select>
              </div>

              {/* QUANTITY */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={stockQuantity}
                  onChange={(e) =>
                    setStockQuantity(e.target.value)
                  }
                  placeholder="Enter quantity"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              {/* STOCK PREVIEW */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Current stock
                  </span>

                  <span className="font-semibold text-white">
                    {selectedProduct.quantity}
                  </span>
                </div>

                <div className="my-3 border-t border-white/10" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Movement
                  </span>

                  <span
                    className={`font-semibold ${isStockIncrease
                      ? "text-emerald-400"
                      : "text-red-400"
                      }`}
                  >
                    {isStockIncrease ? "+" : "-"}
                    {movementQuantity}
                  </span>
                </div>

                <div className="my-3 border-t border-white/10" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">
                    New stock
                  </span>

                  <span
                    className={`text-lg font-bold ${newStock < 0
                      ? "text-red-400"
                      : "text-white"
                      }`}
                  >
                    {newStock}
                  </span>
                </div>
              </div>

              {/* WARNING */}
              {!isStockIncrease &&
                movementQuantity >
                selectedProduct.quantity &&
                movementQuantity > 0 && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    You cannot remove more stock than is
                    currently available.
                  </div>
                )}

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeStockModal}
                  disabled={stockLoading}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    stockLoading ||
                    !stockQuantity ||
                    movementQuantity <= 0 ||
                    newStock < 0
                  }
                  className="flex-1 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {stockLoading
                    ? "Updating..."
                    : "Confirm Movement"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Edit Product
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update product information.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingProduct(null)
                }
                className="text-2xl text-slate-400 transition hover:text-white"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdate}
              className="space-y-4"
            >

              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Product Name
                </label>

                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  SKU
                </label>

                <input
                  type="text"
                  value={editingProduct.sku}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      sku: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Category
                </label>

                <input
                  type="text"
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* PRICE + MIN STOCK */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Price (ETB)
                  </label>

                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: e.target.value,
                      })
                    }
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Min Stock
                  </label>

                  <input
                    type="number"
                    value={editingProduct.minStock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        minStock: e.target.value,
                      })
                    }
                    min="0"
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>

              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                Current stock:{" "}
                <span className="font-semibold text-white">
                  {editingProduct.quantity}
                </span>

                <p className="mt-1 text-xs text-slate-600">
                  Use Stock Movement to change inventory quantity.
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setEditingProduct(null)
                  }
                  className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
