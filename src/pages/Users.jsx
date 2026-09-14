import { useEffect, useState } from "react";
import { AppLayout } from "../components/Navbar";
import { api } from "../services/api";

const S = {
  bg:"#031427", surface:"rgba(11,28,48,.7)", border:"rgba(255,255,255,.07)",
  text:"#d3e4fe", muted:"#8aa0b8", dim:"#5a7a9a",
  green:"#4edea3", greenDim:"rgba(78,222,163,.1)", greenBorder:"rgba(78,222,163,.2)",
  input:"rgba(16,32,52,.8)", inputBorder:"rgba(255,255,255,.08)",
};

const roleMeta = {
  admin:  { bg:"rgba(168,85,247,.1)",  color:"#c084fc", border:"rgba(168,85,247,.25)" },
  staff:  { bg:"rgba(78,222,163,.1)",  color:"#4edea3", border:"rgba(78,222,163,.25)" },
  viewer: { bg:"rgba(76,215,246,.1)",  color:"#4cd7f6", border:"rgba(76,215,246,.25)" },
};

function FormInput({ label, ...props }) {
  return (
    <div>
      <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:S.muted }}>{label}</label>
      <input
        {...props}
        style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${S.inputBorder}`, background:S.input, color:S.text, fontSize:14, outline:"none", transition:"border-color .2s" }}
        onFocus={e => e.target.style.borderColor = S.green}
        onBlur={e  => e.target.style.borderColor = S.inputBorder}
      />
    </div>
  );
}

function Users() {
  const [users, setUsers]       = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ fullName:"", email:"", password:"", role:"staff" });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("loadUsers error:", err);
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/users", formData);
      setFormData({ fullName: "", email: "", password: "", role: "staff" });
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Unable to create user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setError(err.message || "Unable to delete user.");
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px 64px", color:S.text }}>

          {/* Header */}
          <header style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"flex-start", gap:16, marginBottom:32 }}>
            <div>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:S.green, marginBottom:6 }}>Admin</p>
              <h1 style={{ fontSize:30, fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:6 }}>User Management</h1>
              <p style={{ fontSize:14, color:S.muted }}>Manage users and their roles.</p>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setError(""); }}
              style={{ padding:"11px 20px", borderRadius:12, background: showForm ? "rgba(255,255,255,.06)" : "linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, border: showForm ? `1px solid ${S.border}` : "none", cursor:"pointer", boxShadow: showForm ? "none" : "0 0 18px rgba(78,222,163,.25)", transition:"all .2s" }}
            >
              {showForm ? "Cancel" : "+ Create User"}
            </button>
          </header>

          {/* Create form */}
          {showForm && (
            <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:16, padding:28, marginBottom:24 }}>
              <h2 style={{ fontSize:17, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:20 }}>Create New User</h2>
              {error && (
                <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"rgba(255,75,75,.08)", border:"1px solid rgba(255,75,75,.2)", fontSize:13, color:"#fca5a5" }}>{error}</div>
              )}
              <form onSubmit={handleCreateUser} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
                <FormInput label="Full Name"  type="text"     value={formData.fullName} onChange={e=>setFormData({...formData,fullName:e.target.value})}  placeholder="Enter full name" />
                <FormInput label="Email"      type="email"    value={formData.email}    onChange={e=>setFormData({...formData,email:e.target.value})}     placeholder="Enter email" />
                <FormInput label="Password"   type="password" value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})}  placeholder="Minimum 6 characters" />
                <div>
                  <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:S.muted }}>Role</label>
                  <select
                    value={formData.role}
                    onChange={e=>setFormData({...formData,role:e.target.value})}
                    style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${S.inputBorder}`, background:S.input, color:S.text, fontSize:14, outline:"none" }}
                    onFocus={e=>e.target.style.borderColor=S.green}
                    onBlur={e=>e.target.style.borderColor=S.inputBorder}
                  >
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ padding:"11px 24px", borderRadius:10, background: saving ? "rgba(16,185,129,.4)" : "linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, border:"none", cursor: saving?"not-allowed":"pointer", boxShadow: saving?"none":"0 0 16px rgba(78,222,163,.2)" }}
                  >
                    {saving ? "Creating…" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Error banner outside form */}
          {error && !showForm && (
            <div style={{ marginBottom:20, padding:"12px 16px", borderRadius:10, background:"rgba(255,75,75,.08)", border:"1px solid rgba(255,75,75,.2)", fontSize:13, color:"#fca5a5", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>{error}</span>
              <button onClick={() => setError("")} style={{ background:"none", border:"none", color:"#fca5a5", cursor:"pointer", fontSize:14 }}>✕</button>
            </div>
          )}

          {/* Users table */}
          <div style={{ background:S.surface, border:`1px solid ${S.border}`, borderRadius:16, overflow:"hidden" }}>
            <div style={{ padding:"18px 24px", borderBottom:`1px solid ${S.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <h2 style={{ fontSize:16, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>All Users</h2>
                <span style={{ fontSize:12, fontWeight:600, padding:"2px 8px", borderRadius:99, background:"rgba(78,222,163,.12)", color:S.green, border:`1px solid ${S.greenBorder}` }}>
                  {users.length} {users.length === 1 ? "user" : "users"}
                </span>
              </div>
              <button
                onClick={loadUsers}
                disabled={loading}
                title="Reload users list"
                style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8, background:"rgba(255,255,255,.05)", border:`1px solid ${S.border}`, color:S.muted, fontSize:12, fontWeight:500, cursor: loading ? "not-allowed" : "pointer" }}
              >
                ↻ Refresh
              </button>
            </div>

            {loading ? (
              <div style={{ padding:48, textAlign:"center", color:S.muted }}>Loading users…</div>
            ) : users.length === 0 ? (
              <div style={{ padding:48, textAlign:"center", color:S.muted }}>
                <p style={{ marginBottom:14 }}>No users found in database.</p>
                <button
                  onClick={loadUsers}
                  style={{ padding:"8px 18px", borderRadius:8, background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:13, border:"none", cursor:"pointer" }}
                >
                  ↻ Reload Users
                </button>
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${S.border}` }}>
                      {["Name","Email","Role","Action"].map((h,i) => (
                        <th key={h} style={{ padding:"12px 20px", textAlign: i===3?"right":"left", fontSize:11, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", color:S.dim }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const rm = roleMeta[u.role] || roleMeta.viewer;
                      return (
                        <tr key={u.id} style={{ borderBottom:`1px solid rgba(255,255,255,.04)` }}>
                          <td style={{ padding:"14px 20px", fontWeight:600, fontSize:14 }}>{u.fullName||"Unnamed User"}</td>
                          <td style={{ padding:"14px 20px", fontSize:13, color:S.muted }}>{u.email}</td>
                          <td style={{ padding:"14px 20px" }}>
                            <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:99, fontSize:12, fontWeight:600, background:rm.bg, color:rm.color, border:`1px solid ${rm.border}` }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding:"14px 20px", textAlign:"right" }}>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              style={{ fontSize:13, fontWeight:500, color:"#fca5a5", background:"none", border:"none", cursor:"pointer", transition:"color .2s" }}
                              onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
                              onMouseLeave={e=>e.currentTarget.style.color="#fca5a5"}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

      </div>
    </AppLayout>
  );
}

export default Users;
