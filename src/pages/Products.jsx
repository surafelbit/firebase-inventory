import { useState } from "react";
import { Link } from "react-router-dom";
function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const products = [];
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {" "}
      {/* Sidebar */}{" "}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-900 lg:block">
        {" "}
        <div className="flex h-full flex-col">
          {" "}
          <Link to="/" className="flex items-center gap-3 px-6 py-6">
            {" "}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 font-bold">
              {" "}
              I{" "}
            </div>{" "}
            <span className="text-lg font-bold">InventoryPro</span>{" "}
          </Link>{" "}
          <nav className="mt-6 flex-1 space-y-1 px-3">
            {" "}
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              {" "}
              <span>▣</span> Dashboard{" "}
            </Link>{" "}
            <Link
              to="/products"
              className="flex items-center gap-3 rounded-lg bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-400"
            >
              {" "}
              <span>📦</span> Products{" "}
            </Link>{" "}
          </nav>{" "}
        </div>{" "}
      </aside>{" "}
      {/* Main */}{" "}
      <main className="lg:pl-64">
        {" "}
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {" "}
          <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            {" "}
            <div>
              {" "}
              <p className="text-sm text-indigo-400">Inventory</p>{" "}
              <h1 className="mt-1 text-3xl font-bold">Products</h1>{" "}
              <p className="mt-2 text-slate-500">
                {" "}
                Manage all products in your inventory.{" "}
              </p>{" "}
            </div>{" "}
            <button className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400">
              {" "}
              + Add Product{" "}
            </button>{" "}
          </header>{" "}
          <section className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
            {" "}
            {/* Toolbar */}{" "}
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row">
              {" "}
              <div className="relative flex-1">
                {" "}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by product name or SKU..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />{" "}
              </div>{" "}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300 outline-none focus:border-indigo-500"
              >
                {" "}
                <option value="all">All Categories</option>{" "}
                <option value="electronics">Electronics</option>{" "}
                <option value="clothing">Clothing</option>{" "}
                <option value="food">Food</option>{" "}
                <option value="other">Other</option>{" "}
              </select>{" "}
            </div>{" "}
            {/* Empty state */}{" "}
            {filteredProducts.length === 0 ? (
              <div className="flex min-h-96 flex-col items-center justify-center px-6 text-center">
                {" "}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
                  {" "}
                  📦{" "}
                </div>{" "}
                <h2 className="mt-5 text-xl font-semibold">
                  {" "}
                  No products found{" "}
                </h2>{" "}
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {" "}
                  Your inventory doesn't have any products yet. Add your first
                  product to start managing your stock.{" "}
                </p>{" "}
                <button className="mt-6 rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400">
                  {" "}
                  + Add Your First Product{" "}
                </button>{" "}
              </div>
            ) : (
              /* Product table */ <div className="overflow-x-auto">
                {" "}
                <table className="w-full text-left text-sm">
                  {" "}
                  <thead className="border-b border-white/10 text-xs uppercase text-slate-500">
                    {" "}
                    <tr>
                      {" "}
                      <th className="px-6 py-4">Product</th>{" "}
                      <th className="px-6 py-4">SKU</th>{" "}
                      <th className="px-6 py-4">Category</th>{" "}
                      <th className="px-6 py-4">Quantity</th>{" "}
                      <th className="px-6 py-4">Price</th>{" "}
                      <th className="px-6 py-4">Status</th>{" "}
                      <th className="px-6 py-4">Actions</th>{" "}
                    </tr>{" "}
                  </thead>{" "}
                  <tbody>
                    {" "}
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-white/5">
                        {" "}
                        <td className="px-6 py-4 font-medium">
                          {" "}
                          {product.name}{" "}
                        </td>{" "}
                        <td className="px-6 py-4 text-slate-400">
                          {" "}
                          {product.sku}{" "}
                        </td>{" "}
                        <td className="px-6 py-4 text-slate-400">
                          {" "}
                          {product.category}{" "}
                        </td>{" "}
                        <td className="px-6 py-4"> {product.quantity} </td>{" "}
                        <td className="px-6 py-4"> ${product.price} </td>{" "}
                        <td className="px-6 py-4">
                          {" "}
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                            {" "}
                            In Stock{" "}
                          </span>{" "}
                        </td>{" "}
                        <td className="px-6 py-4">
                          {" "}
                          <div className="flex gap-3">
                            {" "}
                            <button className="text-indigo-400 hover:text-indigo-300">
                              {" "}
                              Edit{" "}
                            </button>{" "}
                            <button className="text-red-400 hover:text-red-300">
                              {" "}
                              Delete{" "}
                            </button>{" "}
                          </div>{" "}
                        </td>{" "}
                      </tr>
                    ))}{" "}
                  </tbody>{" "}
                </table>{" "}
              </div>
            )}{" "}
          </section>{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
export default Products;
