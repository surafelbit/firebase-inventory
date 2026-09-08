import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {" "}
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {" "}
        {/* Left */}{" "}
        <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 lg:flex">
          {" "}
          <Link to="/" className="flex items-center gap-3">
            {" "}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 font-bold">
              {" "}
              I{" "}
            </div>{" "}
            <span className="text-xl font-bold">InventoryPro</span>{" "}
          </Link>{" "}
          <div>
            {" "}
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
              {" "}
              Inventory Management{" "}
            </p>{" "}
            <h2 className="mt-4 max-w-lg text-5xl font-bold leading-tight">
              {" "}
              Welcome back to your inventory.{" "}
            </h2>{" "}
            <p className="mt-6 max-w-md text-lg leading-8 text-slate-400">
              {" "}
              Access your dashboard, manage products, and keep track of your
              stock from anywhere.{" "}
            </p>{" "}
          </div>{" "}
          <p className="text-sm text-slate-600"> © 2026 InventoryPro </p>{" "}
        </div>{" "}
        {/* Form */}{" "}
        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
          {" "}
          <div className="w-full max-w-md">
            {" "}
            <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
              {" "}
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 font-bold">
                {" "}
                I{" "}
              </div>{" "}
              <span className="text-xl font-bold">InventoryPro</span>{" "}
            </Link>{" "}
            <h1 className="text-3xl font-bold">Welcome back</h1>{" "}
            <p className="mt-2 text-slate-400">
              {" "}
              Sign in to access your inventory.{" "}
            </p>{" "}
            {error && (
              <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {" "}
                {error}{" "}
              </div>
            )}{" "}
            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              {" "}
              <div>
                {" "}
                <label className="mb-2 block text-sm font-medium">
                  {" "}
                  Email Address{" "}
                </label>{" "}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <div className="mb-2 flex justify-between">
                  {" "}
                  <label className="text-sm font-medium">Password</label>{" "}
                  <button
                    type="button"
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    {" "}
                    Forgot password?{" "}
                  </button>{" "}
                </div>{" "}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />{" "}
              </div>{" "}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-500 px-4 py-3 font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {" "}
                {loading ? "Signing in..." : "Sign In"}{" "}
              </button>{" "}
            </form>{" "}
            <p className="mt-6 text-center text-sm text-slate-500">
              {" "}
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                {" "}
                Create one{" "}
              </Link>{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
export default Login;
