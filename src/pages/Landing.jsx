import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

/* ─── tiny animated counter hook ─── */
function useCounter(target, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

/* ─── stock item row ─── */
function StockRow({ icon, name, sku, qty, status, pct, colorClass, bgClass, borderClass, textClass }) {
  return (
    <div className="ip-stock-row">
      <div className="ip-stock-row__inner">
        <div className="ip-stock-icon" style={{ background: "rgba(255,255,255,0.05)" }}>
          <span className={`ip-icon ${textClass}`}>{icon}</span>
        </div>
        <div className="ip-stock-meta">
          <span className="ip-stock-name">{name}</span>
          <span className="ip-stock-sku">{sku}</span>
        </div>
        <div className="ip-stock-right">
          <span className={`ip-qty ${textClass}`}>
            {qty} <span className="ip-qty-unit">left</span>
          </span>
          <span className={`ip-badge ${bgClass} ${textClass} ${borderClass}`}>{status}</span>
        </div>
      </div>
      <div className="ip-bar-track">
        <div className={`ip-bar-fill ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─── feature card ─── */
function FeatureCard({ icon, accent, title, desc }) {
  return (
    <div className={`ip-feature-card ip-feature-card--${accent}`}>
      <div className={`ip-feature-icon ip-feature-icon--${accent}`}>{icon}</div>
      <h3 className="ip-feature-title">{title}</h3>
      <p className="ip-feature-desc">{desc}</p>
    </div>
  );
}

export default function Landing() {
  const items = useCounter(10000, 2000);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="ip-root">
      {/* ── Fonts ── */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap"
        rel="stylesheet"
      />

      {/* ── Header ── */}
      <header className="ip-header">
        <div className="ip-header__inner">
          <Link to="/" className="ip-logo">
            <div className="ip-logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 3L21 9V21H15V15H9V21H3V9Z" fill="currentColor" opacity="0.9" />
              </svg>
            </div>
            <span className="ip-logo-text">InventoryPro</span>
          </Link>

          <nav className="ip-nav">
            <a href="#features" className="ip-nav__link">Features</a>
            <a href="#metrics" className="ip-nav__link">Metrics</a>
            <a href="#about" className="ip-nav__link">About</a>
            <Link to="/login" className="ip-nav__link">Login</Link>
          </nav>

          <Link to="/register" className="ip-btn ip-btn--primary">
            Get Started
          </Link>

          {/* Mobile hamburger */}
          <button
            className="ip-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="ip-mobile-menu">
            <a href="#features" className="ip-mobile-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#metrics" className="ip-mobile-link" onClick={() => setMobileMenuOpen(false)}>Metrics</a>
            <Link to="/login" className="ip-mobile-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link to="/register" className="ip-btn ip-btn--primary ip-btn--block" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
          </div>
        )}
      </header>

      <main className="ip-main">

        {/* ── Hero ── */}
        <section className="ip-hero">
          {/* ambient glow blobs */}
          <div className="ip-glow ip-glow--teal" />
          <div className="ip-glow ip-glow--blue" />

          <div className="ip-hero__inner">
            {/* Left Column */}
            <div className="ip-hero__copy">
              <div className="ip-pill">
                <span className="ip-pill__dot" />
                <span>Smart Inventory Management · Real-time sync</span>
              </div>

              <h1 className="ip-headline">
                Take control of your{" "}
                <span className="ip-headline--accent">inventory.</span>
              </h1>

              <p className="ip-subheadline">
                Manage products, monitor stock levels, track inventory value, and keep
                your business organized — all from one powerful cloud platform.
              </p>

              <div className="ip-hero__actions">
                <Link to="/register" className="ip-btn ip-btn--primary ip-btn--lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                  </svg>
                  Start Free Trial
                </Link>
                <Link to="/login" className="ip-btn ip-btn--ghost ip-btn--lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Sign In
                </Link>
              </div>

              <div className="ip-hero__stats">
                <div className="ip-hero__stat">
                  <span className="ip-hero__stat-num">Real‑time</span>
                  <span className="ip-hero__stat-label">Stock tracking</span>
                </div>
                <div className="ip-hero__stat-divider" />
                <div className="ip-hero__stat">
                  <span className="ip-hero__stat-num">Secure</span>
                  <span className="ip-hero__stat-label">Authentication</span>
                </div>
                <div className="ip-hero__stat-divider" />
                <div className="ip-hero__stat">
                  <span className="ip-hero__stat-num">Cloud</span>
                  <span className="ip-hero__stat-label">Architecture</span>
                </div>
              </div>
            </div>

            {/* Right Column — Live Inventory Card */}
            <div className="ip-hero__visual">
              <div className="ip-glass-card">
                <div className="ip-glass-card__header">
                  <div className="ip-glass-card__title">
                    <span className="ip-dot ip-dot--pulse ip-dot--green" />
                    Live Inventory Overview
                  </div>
                  <span className="ip-glass-card__badge">Real‑time sync</span>
                </div>

                {/* Mini stat row */}
                <div className="ip-mini-stats">
                  <div className="ip-mini-stat">
                    <span className="ip-mini-stat__label">Products</span>
                    <span className="ip-mini-stat__val">1,248</span>
                  </div>
                  <div className="ip-mini-stat">
                    <span className="ip-mini-stat__label">Low Stock</span>
                    <span className="ip-mini-stat__val ip-mini-stat__val--warn">24</span>
                  </div>
                  <div className="ip-mini-stat">
                    <span className="ip-mini-stat__label">Value</span>
                    <span className="ip-mini-stat__val">ETB 48K</span>
                  </div>
                </div>

                {/* Stock rows */}
                <div className="ip-stock-list">
                  <StockRow
                    icon="🍃"
                    name="Organic Matcha Powder"
                    sku="SKU‑1092 · Central Store"
                    qty="420"
                    status="In Stock"
                    pct={84}
                    colorClass="ip-bar--green"
                    bgClass="ip-badge--green-bg"
                    borderClass="ip-badge--green-border"
                    textClass="ip-text--green"
                  />
                  <StockRow
                    icon="📡"
                    name="Smart Wireless Sensor"
                    sku="SKU‑4819 · Main Warehouse"
                    qty="14"
                    status="Low Stock"
                    pct={18}
                    colorClass="ip-bar--red"
                    bgClass="ip-badge--red-bg"
                    borderClass="ip-badge--red-border"
                    textClass="ip-text--red"
                  />
                  <StockRow
                    icon="☕"
                    name="Cold Brew Concentrate"
                    sku="SKU‑3104 · Transit Fleet"
                    qty="+500"
                    status="On Order"
                    pct={52}
                    colorClass="ip-bar--cyan"
                    bgClass="ip-badge--cyan-bg"
                    borderClass="ip-badge--cyan-border"
                    textClass="ip-text--cyan"
                  />
                </div>

                {/* Sparkline bars */}
                <div className="ip-sparkline">
                  <div className="ip-sparkline__header">
                    <span className="ip-sparkline__title">Stock Activity</span>
                    <span className="ip-sparkline__sub">Last 7 days</span>
                  </div>
                  <div className="ip-sparkline__bars">
                    {[45, 70, 55, 85, 60, 95, 75].map((h, i) => (
                      <div
                        key={i}
                        className="ip-sparkline__bar"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Metric bar ── */}
        <section id="metrics" className="ip-metrics">
          <div className="ip-metrics__inner">
            <div className="ip-metric">
              <span className="ip-metric__num">{items.toLocaleString()}+</span>
              <span className="ip-metric__label">Items Managed</span>
            </div>
            <div className="ip-metric-divider" />
            <div className="ip-metric">
              <span className="ip-metric__num ip-metric__num--green">99.9%</span>
              <span className="ip-metric__label">Inventory Accuracy</span>
            </div>
            <div className="ip-metric-divider" />
            <div className="ip-metric">
              <span className="ip-metric__num ip-metric__num--cyan">Under 5 Min</span>
              <span className="ip-metric__label">Quick Setup</span>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="ip-features">
          <div className="ip-features__inner">
            <div className="ip-section-header">
              <p className="ip-section-eyebrow">Features</p>
              <h2 className="ip-section-title">Everything you need. Nothing you don't.</h2>
              <p className="ip-section-sub">
                Designed to save hours every week so you can focus on building your brand.
              </p>
            </div>

            <div className="ip-feature-grid">
              <FeatureCard
                accent="green"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
                  </svg>
                }
                title="Product Management"
                desc="Add, edit, delete, search, and organize your products from a centralized inventory system with bulk actions."
              />
              <FeatureCard
                accent="cyan"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                }
                title="Smart Stock Tracking"
                desc="Monitor quantities and get automatic low-stock alerts before they become a problem. Never run out unexpectedly."
              />
              <FeatureCard
                accent="green"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                }
                title="Secure Role-Based Access"
                desc="Firebase Authentication provides secure, multi-role access. Admins, staff, and viewers — each with the right permissions."
              />
              <FeatureCard
                accent="cyan"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                  </svg>
                }
                title="Real-time Cloud Sync"
                desc="All data synced live across all your devices via Firebase Firestore. No refresh needed — always up to date."
              />
              <FeatureCard
                accent="green"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>
                  </svg>
                }
                title="Analytics & Reports"
                desc="Get a bird's-eye view of stock movements, total inventory value, and product performance — at a glance."
              />
              <FeatureCard
                accent="cyan"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                }
                title="Multi-location Support"
                desc="Track stock across multiple warehouses, stores, and transit fleets — all in one unified dashboard without confusion."
              />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="about" className="ip-cta">
          <div className="ip-cta__card">
            <div className="ip-cta__glow" />
            <div className="ip-pill ip-pill--center">
              <span className="ip-pill__dot ip-pill__dot--green" />
              <span>Free 14-day trial · No credit card needed</span>
            </div>
            <h2 className="ip-cta__title">
              Ready to manage your inventory the modern way?
            </h2>
            <p className="ip-cta__sub">
              Create your account and start organizing your products today. Join thousands of businesses already using InventoryPro.
            </p>
            <div className="ip-cta__actions">
              <Link to="/register" className="ip-btn ip-btn--primary ip-btn--lg">
                Create Your Account →
              </Link>
              <Link to="/login" className="ip-btn ip-btn--ghost ip-btn--lg">
                Already have an account?
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="ip-footer">
        <div className="ip-footer__inner">
          <div className="ip-footer__brand">
            <div className="ip-logo-mark ip-logo-mark--sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9L12 3L21 9V21H15V15H9V21H3V9Z" opacity="0.9" />
              </svg>
            </div>
            <span>© 2026 InventoryPro. All rights reserved.</span>
          </div>
          <div className="ip-footer__status">
            <span className="ip-dot ip-dot--green" />
            <span>Systems Operational</span>
          </div>
          <div className="ip-footer__links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
