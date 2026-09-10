import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
const API_URL = "http://127.0.0.1:5001/inventory-app-19292/us-central1/api";

function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  // Add product form
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
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
        throw new Error(result.message || "Failed to delete product");
      }

      // Remove it immediately from the UI
      setProducts((previousProducts) =>
        previousProducts.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error("Delete product error:", error);
      alert(error.message);
    }
  };
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    price: "",
    minStock: "",
  });

  // Fetch products
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
            quantity: Number(editingProduct.quantity),
            price: Number(editingProduct.price),
            minStock: Number(editingProduct.minStock),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update product");
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
  const handleEdit = (product) => {
    setEditingProduct(product);
  };
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create product
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
        throw new Error(result.message || "Failed to create product");
      }

      // Clear form
      setFormData({
        name: "",
        sku: "",
        category: "",
        quantity: "",
        price: "",
        minStock: "",
      });

      // Close form
      setShowForm(false);

      // Reload products
      await fetchProducts();
    } catch (error) {
      console.error("Create product error:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const categories = [...new Set(products.map((product) => product.category))];

  const filteredProducts = products.filter((product) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(searchValue) ||
      product.sku.toLowerCase().includes(searchValue);

    const matchesCategory = category === "all" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* SIDEBAR */}
      <Navbar />

      {/* MAIN */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {/* HEADER */}
          <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-indigo-400">Inventory</p>

              <h1 className="mt-1 text-3xl font-bold">Products</h1>

              <p className="mt-2 text-slate-500">
                Manage all products in your inventory.
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
            >
              + Add Product
            </button>
          </header>

          {/* ADD PRODUCT FORM */}
          {showForm && (
            <section className="mt-8 rounded-xl border border-white/10 bg-slate-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Add New Product</h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter the product information below.
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white"
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

                  {/* QUANTITY */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Quantity
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

                {/* BUTTONS */}
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
                    {saving ? "Creating..." : "Create Product"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* PRODUCTS TABLE */}
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
                <option value="all">All Categories</option>

                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="flex min-h-96 items-center justify-center">
                <p className="text-slate-500">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* EMPTY */
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

                {products.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-6 rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
                  >
                    + Add Your First Product
                  </button>
                )}
              </div>
            ) : (
              /* TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => {
                      const isLowStock = product.quantity <= product.minStock;

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

                          <td className="px-6 py-4">{product.quantity}</td>

                          <td className="px-6 py-4">
                            ETB {Number(product.price).toLocaleString()}
                          </td>

                          <td className="px-6 py-4">
                            {isLowStock ? (
                              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400">
                                Low Stock
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                                In Stock
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {editingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Edit Product
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Update the product information below.
                      </p>
                    </div>

                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-2xl text-slate-400 transition hover:text-white"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleUpdate} className="space-y-4">
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
                        placeholder="Product name"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                        required
                      />
                    </div>

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
                        placeholder="SKU"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                        required
                      />
                    </div>

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
                        placeholder="Category"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={editingProduct.quantity}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              quantity: e.target.value,
                            })
                          }
                          placeholder="0"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                          min="0"
                          required
                        />
                      </div>

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
                          placeholder="0.00"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                          min="0"
                          required
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
                          placeholder="0"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Products;
