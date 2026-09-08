import { Link } from "react-router-dom";
function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {" "}
      {/* Navbar */}{" "}
      <nav className="border-b border-white/10">
        {" "}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {" "}
          <Link to="/" className="flex items-center gap-3">
            {" "}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 font-bold">
              {" "}
              I{" "}
            </div>{" "}
            <span className="text-xl font-bold tracking-tight">
              {" "}
              InventoryPro{" "}
            </span>{" "}
          </Link>{" "}
          <div className="hidden items-center gap-8 md:flex">
            {" "}
            <a
              href="#features"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {" "}
              Features{" "}
            </a>{" "}
            <a
              href="#about"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {" "}
              About{" "}
            </a>{" "}
            <Link
              to="/login"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {" "}
              Login{" "}
            </Link>{" "}
            <Link
              to="/register"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              {" "}
              Get Started{" "}
            </Link>{" "}
          </div>{" "}
        </div>{" "}
      </nav>{" "}
      {/* Hero */}{" "}
      <main>
        {" "}
        <section className="relative overflow-hidden">
          {" "}
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
            {" "}
            <div>
              {" "}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-300">
                {" "}
                <span className="h-2 w-2 rounded-full bg-indigo-400" /> Smart
                Inventory Management{" "}
              </div>{" "}
              <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                {" "}
                Take control of your{" "}
                <span className="text-indigo-400">inventory.</span>{" "}
              </h1>{" "}
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
                {" "}
                Manage products, monitor stock levels, track inventory value,
                and keep your business organized from one powerful
                platform.{" "}
              </p>{" "}
              <div className="mt-8 flex flex-wrap gap-4">
                {" "}
                <Link
                  to="/register"
                  className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
                >
                  {" "}
                  Get Started →{" "}
                </Link>{" "}
                <Link
                  to="/login"
                  className="rounded-lg border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/5"
                >
                  {" "}
                  Sign In{" "}
                </Link>{" "}
              </div>{" "}
              <div className="mt-12 flex flex-wrap gap-10 border-t border-white/10 pt-8">
                {" "}
                <div>
                  {" "}
                  <p className="text-2xl font-bold">Real-time</p>{" "}
                  <p className="mt-1 text-sm text-slate-500">
                    Stock tracking
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="text-2xl font-bold">Secure</p>{" "}
                  <p className="mt-1 text-sm text-slate-500">
                    Authentication
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="text-2xl font-bold">Cloud</p>{" "}
                  <p className="mt-1 text-sm text-slate-500">
                    Ready architecture
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* Dashboard Preview */}{" "}
            <div className="relative">
              {" "}
              <div className="absolute -inset-10 rounded-full bg-indigo-500/10 blur-3xl" />{" "}
              <div className="relative rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
                {" "}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  {" "}
                  <div>
                    {" "}
                    <p className="font-semibold">Inventory Overview</p>{" "}
                    <p className="text-xs text-slate-500">
                      {" "}
                      Updated just now{" "}
                    </p>{" "}
                  </div>{" "}
                  <span className="flex items-center gap-2 text-xs text-emerald-400">
                    {" "}
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />{" "}
                    Live{" "}
                  </span>{" "}
                </div>{" "}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {" "}
                  <div className="rounded-xl bg-white/5 p-4">
                    {" "}
                    <p className="text-xs text-slate-500">Products</p>{" "}
                    <p className="mt-2 text-2xl font-bold">1,248</p>{" "}
                  </div>{" "}
                  <div className="rounded-xl bg-white/5 p-4">
                    {" "}
                    <p className="text-xs text-slate-500">Low Stock</p>{" "}
                    <p className="mt-2 text-2xl font-bold text-amber-400">
                      {" "}
                      24{" "}
                    </p>{" "}
                  </div>{" "}
                  <div className="rounded-xl bg-white/5 p-4">
                    {" "}
                    <p className="text-xs text-slate-500">Value</p>{" "}
                    <p className="mt-2 text-2xl font-bold">$48K</p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mt-4 rounded-xl bg-white/5 p-5">
                  {" "}
                  <div className="flex justify-between">
                    {" "}
                    <p className="font-medium">Stock Activity</p>{" "}
                    <span className="text-xs text-slate-500">
                      {" "}
                      Last 7 days{" "}
                    </span>{" "}
                  </div>{" "}
                  <div className="mt-6 flex h-40 items-end justify-between gap-3">
                    {" "}
                    {[45, 70, 55, 85, 60, 95, 75].map((height, index) => (
                      <div
                        key={index}
                        className="w-full rounded-t-md bg-indigo-500/70"
                        style={{ height: `${height}%` }}
                      />
                    ))}{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        {/* Features */}{" "}
        <section
          id="features"
          className="border-y border-white/10 bg-slate-900/50"
        >
          {" "}
          <div className="mx-auto max-w-7xl px-6 py-24">
            {" "}
            <div className="max-w-2xl">
              {" "}
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
                {" "}
                Features{" "}
              </p>{" "}
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {" "}
                Everything you need to manage inventory.{" "}
              </h2>{" "}
              <p className="mt-4 text-slate-400">
                {" "}
                Keep your products organized and your inventory under
                control.{" "}
              </p>{" "}
            </div>{" "}
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {" "}
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-7">
                {" "}
                <div className="text-3xl">📦</div>{" "}
                <h3 className="mt-5 text-xl font-semibold">
                  {" "}
                  Product Management{" "}
                </h3>{" "}
                <p className="mt-3 leading-7 text-slate-400">
                  {" "}
                  Add, edit, delete, search, and organize your products from a
                  centralized inventory system.{" "}
                </p>{" "}
              </div>{" "}
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-7">
                {" "}
                <div className="text-3xl">📊</div>{" "}
                <h3 className="mt-5 text-xl font-semibold"> Stock Tracking </h3>{" "}
                <p className="mt-3 leading-7 text-slate-400">
                  {" "}
                  Monitor quantities and identify low-stock products before they
                  become a problem.{" "}
                </p>{" "}
              </div>{" "}
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-7">
                {" "}
                <div className="text-3xl">🔐</div>{" "}
                <h3 className="mt-5 text-xl font-semibold"> Secure Access </h3>{" "}
                <p className="mt-3 leading-7 text-slate-400">
                  {" "}
                  Firebase Authentication provides secure access to your
                  inventory management system.{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        {/* CTA */}{" "}
        <section id="about" className="px-6 py-24">
          {" "}
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-indigo-500/10 px-6 py-16 text-center">
            {" "}
            <h2 className="text-3xl font-bold sm:text-4xl">
              {" "}
              Ready to manage your inventory?{" "}
            </h2>{" "}
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              {" "}
              Create your account and start organizing your products today.{" "}
            </p>{" "}
            <Link
              to="/register"
              className="mt-8 inline-block rounded-lg bg-indigo-500 px-7 py-3 font-semibold transition hover:bg-indigo-400"
            >
              {" "}
              Create Your Account →{" "}
            </Link>{" "}
          </div>{" "}
        </section>{" "}
      </main>{" "}
      {/* Footer */}{" "}
      <footer className="border-t border-white/10">
        {" "}
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold">
              {" "}
              I{" "}
            </div>{" "}
            <span className="font-semibold">InventoryPro</span>{" "}
          </div>{" "}
          <p className="text-sm text-slate-500">
            {" "}
            © 2026 InventoryPro. All rights reserved.{" "}
          </p>{" "}
        </div>{" "}
      </footer>{" "}
    </div>
  );
}
export default Landing;
