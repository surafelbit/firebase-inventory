
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_URL =
  "http://127.0.0.1:5001/inventory-app-19292/us-central1/api";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const result = await response.json();

        setProducts(result.data || []);
      } catch (error) {
        console.error("Dashboard products error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // -------------------------
  // Calculate statistics
  // -------------------------

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.quantity || 0) > 0 &&
      Number(product.quantity || 0) <= Number(product.minStock || 0)
  );

  const outOfStockProducts = products.filter(
    (product) => Number(product.quantity || 0) === 0
  );

  const inStockProducts = products.filter(
    (product) =>
      Number(product.quantity || 0) > Number(product.minStock || 0)
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total +
      Number(product.quantity || 0) * Number(product.price || 0),
    0
  );

  // Most recent products
  const recentProducts = [...products]
    .sort((a, b) => {
      const dateA = a.createdAt?._seconds || 0;
      const dateB = b.createdAt?._seconds || 0;

      return dateB - dateA;
    })
    .slice(0, 5);

  // Percentages for stock status bars
  const totalForPercentage =
    inStockProducts.length +
    lowStockProducts.length +
    outOfStockProducts.length;

  const inStockPercentage = totalForPercentage
    ? (inStockProducts.length / totalForPercentage) * 100
    : 0;

  const lowStockPercentage = totalForPercentage
    ? (lowStockProducts.length / totalForPercentage) * 100
    : 0;

  const outOfStockPercentage = totalForPercentage
    ? (outOfStockProducts.length / totalForPercentage) * 100
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

          {/* Header */}
          <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-indigo-400">Overview</p>

              <h1 className="mt-1 text-3xl font-bold">
                Dashboard
              </h1>

              <p className="mt-2 text-slate-500">
                Here's what's happening with your inventory.
              </p>
            </div>

            <Link
              to="/products"
              className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
            >
              + Add Product
            </Link>
          </header>

          {/* Loading */}
          {loading ? (
            <div className="mt-8 rounded-xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
              Loading inventory...
            </div>
          ) : (
            <>
              {/* Stats */}
              <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* Total Products */}
                <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
                  <p className="text-sm text-slate-500">
                    Total Products
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {totalProducts}
                  </p>

                  <p className="mt-2 text-xs text-slate-600">
                    Products in inventory
                  </p>
                </div>

                {/* Total Stock */}
                <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
                  <p className="text-sm text-slate-500">
                    Total Stock
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {totalStock}
                  </p>

                  <p className="mt-2 text-xs text-slate-600">
                    Units available
                  </p>
                </div>

                {/* Low Stock */}
                <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
                  <p className="text-sm text-slate-500">
                    Low Stock
                  </p>

                  <p className="mt-2 text-3xl font-bold text-amber-400">
                    {lowStockProducts.length}
                  </p>

                  <p className="mt-2 text-xs text-slate-600">
                    Need attention
                  </p>
                </div>

                {/* Inventory Value */}
                <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
                  <p className="text-sm text-slate-500">
                    Inventory Value
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {inventoryValue.toLocaleString()} ETB
                  </p>

                  <p className="mt-2 text-xs text-slate-600">
                    Current total value
                  </p>
                </div>

              </section>

              {/* Content */}
              <section className="mt-6 grid gap-6 xl:grid-cols-3">

                {/* Recent Products */}
                <div className="rounded-xl border border-white/10 bg-slate-900 p-6 xl:col-span-2">

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold">
                        Recent Products
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Your latest inventory additions.
                      </p>
                    </div>

                    <Link
                      to="/products"
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      View all →
                    </Link>
                  </div>

                  {recentProducts.length === 0 ? (
                    <div className="flex min-h-72 flex-col items-center justify-center text-center">
                      <div className="text-5xl">📦</div>

                      <h3 className="mt-4 font-semibold">
                        No products yet
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Start by adding your first product.
                      </p>

                      <Link
                        to="/products"
                        className="mt-5 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/5"
                      >
                        Add Product
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10 text-left text-xs uppercase text-slate-500">
                            <th className="pb-3">Product</th>
                            <th className="pb-3">Category</th>
                            <th className="pb-3">Stock</th>
                            <th className="pb-3 text-right">Price</th>
                          </tr>
                        </thead>

                        <tbody>
                          {recentProducts.map((product) => (
                            <tr
                              key={product.id}
                              className="border-b border-white/5"
                            >
                              <td className="py-4 font-medium">
                                {product.name}
                              </td>

                              <td className="py-4 text-sm text-slate-400">
                                {product.category}
                              </td>

                              <td className="py-4">
                                <span
                                  className={
                                    Number(product.quantity) === 0
                                      ? "text-red-400"
                                      : Number(product.quantity) <=
                                        Number(product.minStock)
                                        ? "text-amber-400"
                                        : "text-emerald-400"
                                  }
                                >
                                  {product.quantity}
                                </span>
                              </td>

                              <td className="py-4 text-right text-sm">
                                {Number(product.price).toLocaleString()} ETB
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>

                {/* Stock Status */}
                <div className="rounded-xl border border-white/10 bg-slate-900 p-6">

                  <h2 className="font-semibold">
                    Stock Status
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Inventory health overview.
                  </p>

                  <div className="mt-8 space-y-5">

                    {/* In Stock */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          In Stock
                        </span>

                        <span className="font-semibold">
                          {inStockProducts.length}
                        </span>
                      </div>

                      <div className="mt-2 h-2 rounded-full bg-white/5">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{
                            width: `${inStockPercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Low Stock */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          Low Stock
                        </span>

                        <span className="font-semibold text-amber-400">
                          {lowStockProducts.length}
                        </span>
                      </div>

                      <div className="mt-2 h-2 rounded-full bg-white/5">
                        <div
                          className="h-2 rounded-full bg-amber-500"
                          style={{
                            width: `${lowStockPercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Out of Stock */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          Out of Stock
                        </span>

                        <span className="font-semibold text-red-400">
                          {outOfStockProducts.length}
                        </span>
                      </div>

                      <div className="mt-2 h-2 rounded-full bg-white/5">
                        <div
                          className="h-2 rounded-full bg-red-500"
                          style={{
                            width: `${outOfStockPercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
