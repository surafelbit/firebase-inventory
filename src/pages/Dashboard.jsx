import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
function Dashboard() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };
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
              className="flex items-center gap-3 rounded-lg bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-400"
            >
              {" "}
              <span>▣</span> Dashboard{" "}
            </Link>{" "}
            <Link
              to="/products"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              {" "}
              <span>📦</span> Products{" "}
            </Link>{" "}
          </nav>{" "}
          <button
            onClick={handleLogout}
            className="m-3 flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            {" "}
            <span>↪</span> Logout{" "}
          </button>{" "}
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
              <p className="text-sm text-indigo-400">Overview</p>{" "}
              <h1 className="mt-1 text-3xl font-bold">Dashboard</h1>{" "}
              <p className="mt-2 text-slate-500">
                {" "}
                Here's what's happening with your inventory.{" "}
              </p>{" "}
            </div>{" "}
            <Link
              to="/products"
              className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
            >
              {" "}
              + Add Product{" "}
            </Link>{" "}
          </header>{" "}
          {/* Stats */}{" "}
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {" "}
            <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
              {" "}
              <p className="text-sm text-slate-500">Total Products</p>{" "}
              <p className="mt-2 text-3xl font-bold">0</p>{" "}
              <p className="mt-2 text-xs text-slate-600">
                {" "}
                Products in inventory{" "}
              </p>{" "}
            </div>{" "}
            <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
              {" "}
              <p className="text-sm text-slate-500">Total Stock</p>{" "}
              <p className="mt-2 text-3xl font-bold">0</p>{" "}
              <p className="mt-2 text-xs text-slate-600">
                {" "}
                Units available{" "}
              </p>{" "}
            </div>{" "}
            <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
              {" "}
              <p className="text-sm text-slate-500">Low Stock</p>{" "}
              <p className="mt-2 text-3xl font-bold text-amber-400">0</p>{" "}
              <p className="mt-2 text-xs text-slate-600">
                {" "}
                Need attention{" "}
              </p>{" "}
            </div>{" "}
            <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
              {" "}
              <p className="text-sm text-slate-500">Inventory Value</p>{" "}
              <p className="mt-2 text-3xl font-bold">$0</p>{" "}
              <p className="mt-2 text-xs text-slate-600">
                {" "}
                Current total value{" "}
              </p>{" "}
            </div>{" "}
          </section>{" "}
          {/* Content */}{" "}
          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            {" "}
            <div className="rounded-xl border border-white/10 bg-slate-900 p-6 xl:col-span-2">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <h2 className="font-semibold">Recent Products</h2>{" "}
                  <p className="mt-1 text-sm text-slate-500">
                    {" "}
                    Your latest inventory additions.{" "}
                  </p>{" "}
                </div>{" "}
                <Link
                  to="/products"
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  {" "}
                  View all →{" "}
                </Link>{" "}
              </div>{" "}
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                {" "}
                <div className="text-5xl">📦</div>{" "}
                <h3 className="mt-4 font-semibold">No products yet</h3>{" "}
                <p className="mt-2 text-sm text-slate-500">
                  {" "}
                  Start by adding your first product.{" "}
                </p>{" "}
                <Link
                  to="/products"
                  className="mt-5 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/5"
                >
                  {" "}
                  Add Product{" "}
                </Link>{" "}
              </div>{" "}
            </div>{" "}
            <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
              {" "}
              <h2 className="font-semibold">Stock Status</h2>{" "}
              <p className="mt-1 text-sm text-slate-500">
                {" "}
                Inventory health overview.{" "}
              </p>{" "}
              <div className="mt-8 space-y-5">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-sm text-slate-400">In Stock</span>{" "}
                  <span className="font-semibold">0</span>{" "}
                </div>{" "}
                <div className="h-2 rounded-full bg-white/5">
                  {" "}
                  <div className="h-2 w-0 rounded-full bg-emerald-500" />{" "}
                </div>{" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-sm text-slate-400">Low Stock</span>{" "}
                  <span className="font-semibold text-amber-400">0</span>{" "}
                </div>{" "}
                <div className="h-2 rounded-full bg-white/5">
                  {" "}
                  <div className="h-2 w-0 rounded-full bg-amber-500" />{" "}
                </div>{" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-sm text-slate-400">
                    {" "}
                    Out of Stock{" "}
                  </span>{" "}
                  <span className="font-semibold text-red-400">0</span>{" "}
                </div>{" "}
                <div className="h-2 rounded-full bg-white/5">
                  {" "}
                  <div className="h-2 w-0 rounded-full bg-red-500" />{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </section>{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
export default Dashboard;
