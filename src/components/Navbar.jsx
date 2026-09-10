
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, userData, logout } = useAuth();
  const location = useLocation();

  const role = userData?.role;

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-slate-900 lg:block">
      <div className="flex h-full flex-col">

        {/* Logo */}
        <div className="border-b border-white/10 px-6 py-6">
          <h1 className="text-xl font-bold text-white">
            InventoryPro
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Inventory Management
          </p>
        </div>

        {/* User */}
        <div className="border-b border-white/10 px-6 py-5">
          <p className="truncate text-sm font-medium text-white">
            {userData?.fullName || user?.email}
          </p>

          <span
            className={`mt - 2 inline - block rounded - full px - 2.5 py - 1 text - xs font - semibold ${role === "admin"
                ? "bg-purple-500/10 text-purple-400"
                : role === "staff"
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "bg-slate-500/10 text-slate-400"
              } `}
          >
            {role || "User"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">

          <Link
            to="/dashboard"
            className={`block rounded - lg px - 4 py - 3 text - sm font - medium transition ${isActive("/dashboard")
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
              } `}
          >
            Dashboard
          </Link>

          <Link
            to="/products"
            className={`block rounded - lg px - 4 py - 3 text - sm font - medium transition ${isActive("/products")
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
              } `}
          >
            Products
          </Link>

          {/* ADMIN ONLY */}
          {role === "admin" && (
            <Link
              to="/users"
              className={`block rounded - lg px - 4 py - 3 text - sm font - medium transition ${isActive("/users")
                  ? "bg-purple-500/10 text-purple-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                } `}
            >
              User Management
            </Link>
          )}

        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            Sign out
          </button>
        </div>

      </div>
    </aside>
  );
}

export default Navbar;
