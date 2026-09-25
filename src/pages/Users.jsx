import { useEffect, useState } from "react";
import { AppLayout } from "../components/Navbar";
import { api } from "../services/api";

const roleMeta = {
  admin:  { bg: "rgba(168,85,247,0.14)",  color: "#c084fc", border: "rgba(168,85,247,0.3)" },
  staff:  { bg: "rgba(16,185,129,0.14)",  color: "#34d399", border: "rgba(16,185,129,0.3)" },
  viewer: { bg: "rgba(6,182,212,0.14)",   color: "#38bdf8", border: "rgba(6,182,212,0.3)" },
};

function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", role: "staff" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("loadUsers error:", err);
      setError(err.message || "Unable to load operators.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required credentials.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/users", formData);
      setFormData({ fullName: "", email: "", password: "", role: "staff" });
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Unable to register operator.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to revoke and delete this operator account?")) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err.message || "Unable to revoke operator.");
    }
  };

  const adminCount = users.filter((u) => u.role === "admin").length;
  const staffCount = users.filter((u) => u.role === "staff").length;
  const viewerCount = users.filter((u) => u.role === "viewer").length;

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Command Center IAM Header */}
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
                color: "#c084fc",
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                IAM & Security Governance
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
              Operator & Access Management
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              Configure role-based access control (RBAC), enforce privilege segregation, and provision credentials.
            </p>
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setError("");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 12,
              background: showForm ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              border: showForm ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.2)",
              boxShadow: showForm ? "none" : "0 0 18px rgba(16,185,129,0.35)",
              cursor: "pointer",
              transition: "all .18s ease"
            }}
          >
            {showForm ? "Cancel Provisioning" : "+ Provision Operator"}
          </button>
        </header>

        {/* Telemetry Stat Cards */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 24
        }}>
          <div className="cc-card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Total Operators</span>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", fontFamily: "'JetBrains Mono', monospace", margin: "4px 0 0" }}>{users.length}</p>
          </div>
          <div className="cc-card cc-card--accent-cyan" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Admin Privilege</span>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#c084fc", fontFamily: "'JetBrains Mono', monospace", margin: "4px 0 0" }}>{adminCount}</p>
          </div>
          <div className="cc-card cc-card--accent-emerald" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Warehouse Staff</span>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#34d399", fontFamily: "'JetBrains Mono', monospace", margin: "4px 0 0" }}>{staffCount}</p>
          </div>
          <div className="cc-card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>Auditor / Viewers</span>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace", margin: "4px 0 0" }}>{viewerCount}</p>
          </div>
        </section>

        {/* PROVISION OPERATOR PANEL */}
        {showForm && (
          <div
            className="cc-card cc-card--accent-emerald"
            style={{
              padding: "26px",
              marginBottom: 24,
              animation: "cc-modal-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <span className="cc-badge cc-badge--emerald" style={{ marginBottom: 6 }}>
                IAM CREDENTIAL ENROLLMENT
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, color: "#f8fafc" }}>
                Provision New System Operator
              </h2>
            </div>

            {error && (
              <div style={{
                marginBottom: 16,
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.3)",
                fontSize: 12,
                color: "#fb7185"
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                  Full Operator Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Elena Rostova"
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
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="operator@inventorypro.local"
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
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                  Initial Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 alphanumeric chars"
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
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                  Role Assignment
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                >
                  <option value="staff">Staff (Manage Catalog & Record Movements)</option>
                  <option value="admin">Admin (Full System Privilege & IAM)</option>
                  <option value="viewer">Viewer (Read-only Audit Access)</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
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
                  {saving ? "Provisioning..." : "Confirm & Save Credentials"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Global Error Banner */}
        {error && !showForm && (
          <div style={{
            marginBottom: 20,
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(244,63,94,0.08)",
            border: "1px solid rgba(244,63,94,0.3)",
            fontSize: 13,
            color: "#fb7185",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              style={{ background: "none", border: "none", color: "#fb7185", cursor: "pointer", fontSize: 14 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* OPERATORS DATA TABLE */}
        <section className="cc-card" style={{ overflow: "hidden" }}>
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255,255,255,0.01)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="cc-dot-live" />
              <h2 style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, color: "#f8fafc" }}>
                Enrolled Operators ({users.length})
              </h2>
            </div>
            <button
              onClick={loadUsers}
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
                fontSize: 12,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              ↻ Refresh Directory
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
              <div style={{ display: "inline-block", width: 28, height: 28, border: "2px solid rgba(192,132,252,0.3)", borderTopColor: "#c084fc", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 10, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>Syncing IAM Directory...</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
              <p>No operator accounts found in directory.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)" }}>
                    <th style={{ padding: "14px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Operator</th>
                    <th style={{ padding: "14px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Email Address</th>
                    <th style={{ padding: "14px 18px", textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Assigned Role</th>
                    <th style={{ padding: "14px 18px", textAlign: "right", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const rm = roleMeta[u.role] || roleMeta.viewer;
                    const initial = (u.fullName || u.email || "U")[0].toUpperCase();

                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          transition: "background .15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.05)",
                              border: `1px solid ${rm.border}`,
                              color: rm.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: "'JetBrains Mono', monospace"
                            }}>
                              {initial}
                            </div>
                            <span style={{ fontWeight: 600, color: "#f8fafc" }}>
                              {u.fullName || "Unnamed Operator"}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: "14px 18px", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                          {u.email}
                        </td>

                        <td style={{ padding: "14px 18px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "'JetBrains Mono', monospace",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            background: rm.bg,
                            color: rm.color,
                            border: `1px solid ${rm.border}`
                          }}>
                            {u.role}
                          </span>
                        </td>

                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#fb7185",
                              background: "rgba(244,63,94,0.08)",
                              border: "1px solid rgba(244,63,94,0.25)",
                              cursor: "pointer",
                              transition: "all .18s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(244,63,94,0.18)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(244,63,94,0.08)";
                            }}
                          >
                            Revoke
                          </button>
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
    </AppLayout>
  );
}

export default Users;
