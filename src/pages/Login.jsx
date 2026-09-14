import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

const googleProvider = new GoogleAuthProvider();

/* shared inline style tokens */
const S = {
  bg:       "#031427",
  surface:  "rgba(11,28,48,.8)",
  border:   "rgba(255,255,255,.08)",
  text:     "#d3e4fe",
  muted:    "#8aa0b8",
  dim:      "#5a7a9a",
  green:    "#4edea3",
  greenDim: "rgba(78,222,163,.1)",
  greenBorder: "rgba(78,222,163,.25)",
  input:    "rgba(16,32,52,.8)",
  inputBorder: "rgba(255,255,255,.08)",
};

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color: S.text }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      style={{
        width:"100%", padding:"12px 16px", borderRadius:10,
        border:`1px solid ${S.inputBorder}`, background: S.input,
        color: S.text, fontSize:14, outline:"none",
        transition:"border-color .2s",
      }}
      onFocus={e  => e.target.style.borderColor = S.green}
      onBlur={e   => e.target.style.borderColor = S.inputBorder}
    />
  );
}

function PrimaryBtn({ disabled, children, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        width:"100%", padding:"13px", borderRadius:10,
        background: disabled ? "rgba(16,185,129,.4)" : "linear-gradient(135deg,#10b981,#059669)",
        color:"#fff", fontWeight:600, fontSize:14,
        border:"none", cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 0 18px rgba(78,222,163,.3)",
        transition:"all .2s",
      }}
    >
      {children}
    </button>
  );
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setError(""); setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") setError("Google sign-in was cancelled.");
      else if (err.code === "auth/popup-blocked")   setError("The Google popup was blocked by your browser.");
      else setError(err.message);
    } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setError("");
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      if (["auth/invalid-credential","auth/wrong-password","auth/user-not-found"].includes(err.code))
        setError("Invalid email or password.");
      else setError("Unable to sign in. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background: S.bg, color: S.text, display:"flex" }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width:"50%", flexDirection:"column", justifyContent:"space-between",
          padding:"48px", position:"relative", overflow:"hidden",
          background:"rgba(11,28,48,.9)", borderRight:`1px solid ${S.border}`,
        }}
      >
        {/* ambient glow */}
        <div style={{
          position:"absolute", top:"-60px", left:"-60px",
          width:320, height:320, borderRadius:"50%",
          background:"radial-gradient(ellipse,rgba(78,222,163,.12) 0%,transparent 70%)",
          filter:"blur(60px)", pointerEvents:"none",
        }}/>

        <Link to="/" style={{ display:"flex", alignItems:"center", gap:12, zIndex:1 }}>
          <div style={{
            width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center",
            background:"linear-gradient(135deg,#10b981,#059669)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 9L12 3L21 9V21H15V15H9V21H3V9Z" opacity=".9"/></svg>
          </div>
          <span style={{ fontSize:18, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>InventoryPro</span>
        </Link>

        <div style={{ zIndex:1 }}>
          <p style={{ fontSize:12, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color: S.green, marginBottom:16 }}>
            Inventory Management
          </p>
          <h2 style={{ fontSize:40, fontWeight:800, lineHeight:1.15, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:20 }}>
            Welcome back to your inventory.
          </h2>
          <p style={{ fontSize:16, lineHeight:1.7, color: S.muted, maxWidth:380 }}>
            Access your dashboard, manage products, and keep track of your stock from anywhere.
          </p>
        </div>

        <p style={{ fontSize:12, color: S.dim, zIndex:1 }}>© 2026 InventoryPro</p>
      </div>

      {/* ── Form ── */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 24px" }}>
        <div style={{ width:"100%", maxWidth:420 }}>

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M3 9L12 3L21 9V21H15V15H9V21H3V9Z" opacity=".9"/></svg>
            </div>
            <span style={{ fontSize:17, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>InventoryPro</span>
          </Link>

          <h1 style={{ fontSize:28, fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:6 }}>Welcome back</h1>
          <p style={{ fontSize:14, color: S.muted, marginBottom:28 }}>Sign in to access your inventory.</p>

          {error && (
            <div style={{ marginBottom:20, padding:"12px 16px", borderRadius:10, background:"rgba(255,75,75,.08)", border:"1px solid rgba(255,75,75,.2)", fontSize:13, color:"#fca5a5" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <Field label="Email Address">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </Field>

            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:-8 }}>
              <Link to="/forgot-password" style={{ fontSize:13, color: S.green }}>Forgot password?</Link>
            </div>

            <PrimaryBtn type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </PrimaryBtn>
          </form>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"24px 0" }}>
            <div style={{ flex:1, height:1, background: S.border }}/>
            <span style={{ fontSize:12, color: S.dim }}>OR</span>
            <div style={{ flex:1, height:1, background: S.border }}/>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width:"100%", padding:"12px 16px", borderRadius:10, display:"flex",
              alignItems:"center", justifyContent:"center", gap:12,
              background:"#fff", color:"#1a1a1a", fontWeight:600, fontSize:14,
              border:"none", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? .6 : 1, transition:"opacity .2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p style={{ marginTop:24, textAlign:"center", fontSize:13, color: S.dim }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: S.green, fontWeight:600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
