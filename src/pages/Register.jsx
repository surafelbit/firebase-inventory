import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const googleProvider = new GoogleAuthProvider();

const S = {
  bg: "#031427", surface: "rgba(11,28,48,.8)", border: "rgba(255,255,255,.08)",
  text: "#d3e4fe", muted: "#8aa0b8", dim: "#5a7a9a",
  green: "#4edea3", input: "rgba(16,32,52,.8)", inputBorder: "rgba(255,255,255,.08)",
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:S.text }}>{label}</label>
      {children}
      {hint && <p style={{ marginTop:5, fontSize:12, color:S.dim }}>{hint}</p>}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      style={{ width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${S.inputBorder}`, background:S.input, color:S.text, fontSize:14, outline:"none", transition:"border-color .2s" }}
      onFocus={e => e.target.style.borderColor = S.green}
      onBlur={e  => e.target.style.borderColor = S.inputBorder}
    />
  );
}

function PrimaryBtn({ disabled, children, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={{ width:"100%", padding:13, borderRadius:10, background: disabled ? "rgba(16,185,129,.4)" : "linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, border:"none", cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : "0 0 18px rgba(78,222,163,.3)", transition:"all .2s" }}
    >{children}</button>
  );
}

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName:"", email:"", password:"", confirmPassword:"" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }));

  const handleGoogleSignUp = async () => {
    try {
      setError(""); setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), { uid:user.uid, fullName:user.displayName||"Google User", email:user.email, role:"staff", createdAt:serverTimestamp() }, { merge:true });
      navigate("/dashboard");
    } catch (err) {
      setError(err.code === "auth/popup-closed-by-user" ? "Google sign-up was cancelled." : "Google sign-up failed.");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError("");
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await setDoc(doc(db, "users", user.uid), { uid:user.uid, fullName:formData.fullName, email:user.email, role:"staff", createdAt:serverTimestamp() });
      navigate("/dashboard");
    } catch (err) {
      if      (err.code === "auth/email-already-in-use") setError("An account with this email already exists.");
      else if (err.code === "auth/invalid-email")        setError("Please enter a valid email address.");
      else if (err.code === "auth/weak-password")        setError("Password is too weak.");
      else setError("Unable to create account. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:S.bg, color:S.text, display:"flex" }}>

      {/* Left panel */}
      <div className="hidden lg:flex" style={{ width:"50%", flexDirection:"column", justifyContent:"space-between", padding:48, position:"relative", overflow:"hidden", background:"linear-gradient(135deg,#0b1c30 0%,#102034 100%)", borderRight:`1px solid ${S.border}` }}>
        <div style={{ position:"absolute", bottom:-80, right:-80, width:350, height:350, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(78,222,163,.1) 0%,transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }}/>

        <Link to="/" style={{ display:"flex", alignItems:"center", gap:12, zIndex:1 }}>
          <div style={{ width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#10b981,#059669)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 9L12 3L21 9V21H15V15H9V21H3V9Z" opacity=".9"/></svg>
          </div>
          <span style={{ fontSize:18, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>InventoryPro</span>
        </Link>

        <div style={{ zIndex:1 }}>
          <h2 style={{ fontSize:38, fontWeight:800, lineHeight:1.15, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:20 }}>
            Everything you need to keep your inventory under control.
          </h2>
          <p style={{ fontSize:15, lineHeight:1.75, color:S.muted }}>
            Manage products, monitor stock levels, and make better inventory decisions from one simple platform.
          </p>

          {/* Feature pills */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:28 }}>
            {["Real-time stock tracking","Secure role-based access","Cloud-synced across devices"].map(f => (
              <div key={f} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:S.muted }}>
                <span style={{ width:18, height:18, borderRadius:"50%", background:"rgba(78,222,163,.15)", border:"1px solid rgba(78,222,163,.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="#4edea3"><path d="M2 6l3 3 5-5"/></svg>
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize:12, color:S.dim, zIndex:1 }}>© 2026 InventoryPro</p>
      </div>

      {/* Form */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 24px", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:420 }}>

          <Link to="/" className="lg:hidden" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M3 9L12 3L21 9V21H15V15H9V21H3V9Z" opacity=".9"/></svg>
            </div>
            <span style={{ fontSize:17, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>InventoryPro</span>
          </Link>

          <h1 style={{ fontSize:28, fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:6 }}>Create your account</h1>
          <p style={{ fontSize:14, color:S.muted, marginBottom:28 }}>Start managing your inventory today.</p>

          {error && (
            <div style={{ marginBottom:20, padding:"12px 16px", borderRadius:10, background:"rgba(255,75,75,.08)", border:"1px solid rgba(255,75,75,.2)", fontSize:13, color:"#fca5a5" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <Field label="Full Name">
              <Input type="text" name="fullName" value={formData.fullName} onChange={set("fullName")} placeholder="John Doe" required />
            </Field>
            <Field label="Email Address">
              <Input type="email" name="email" value={formData.email} onChange={set("email")} placeholder="you@example.com" required />
            </Field>
            <Field label="Password" hint="Minimum 6 characters">
              <Input type="password" name="password" value={formData.password} onChange={set("password")} placeholder="••••••••" required />
            </Field>
            <Field label="Confirm Password">
              <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" required />
            </Field>
            <PrimaryBtn type="submit" disabled={loading}>{loading ? "Creating account…" : "Create Account"}</PrimaryBtn>
          </form>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"24px 0" }}>
            <div style={{ flex:1, height:1, background:S.border }}/><span style={{ fontSize:12, color:S.dim }}>OR</span><div style={{ flex:1, height:1, background:S.border }}/>
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            style={{ width:"100%", padding:"12px 16px", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", gap:12, background:"#fff", color:"#1a1a1a", fontWeight:600, fontSize:14, border:"none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .6 : 1 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p style={{ marginTop:24, textAlign:"center", fontSize:13, color:S.dim }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color:S.green, fontWeight:600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;