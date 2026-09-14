import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

const PROJECT_ID = "inventory-app-19292";

const S = {
  bg:"#031427", text:"#d3e4fe", muted:"#8aa0b8", dim:"#5a7a9a",
  green:"#4edea3", input:"rgba(16,32,52,.8)", inputBorder:"rgba(255,255,255,.08)",
};

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

function ForgotPassword() {
  const [email, setEmail]       = useState("");
  const [message, setMessage]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage(""); setError(""); setResetLink("");
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email, { url:"http://localhost:5173/reset-password", handleCodeInApp:true });

      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        try {
          const res  = await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT_ID}/oobCodes`);
          const data = await res.json();
          const match = [...(data.oobCodes||[])].reverse().find(c => c.email === email && c.requestType === "PASSWORD_RESET");
          if (match?.oobLink) {
            const oobCode = new URL(match.oobLink).searchParams.get("oobCode");
            if (oobCode) setResetLink(`http://localhost:5173/reset-password?oobCode=${oobCode}`);
          }
        } catch {}
      }
      setMessage("Password reset instructions have been sent to your email.");
    } catch (err) {
      if      (err.code === "auth/user-not-found") setError("No account was found with this email.");
      else if (err.code === "auth/invalid-email")  setError("Please enter a valid email address.");
      else setError("Unable to send reset instructions. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:S.bg, color:S.text, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px", position:"relative", overflow:"hidden" }}>
      {/* ambient glow */}
      <div style={{ position:"absolute", top:"-80px", left:"50%", transform:"translateX(-50%)", width:500, height:300, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(78,222,163,.08) 0%,transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:440, position:"relative", zIndex:1 }}>

        {/* Card */}
        <div style={{ background:"rgba(11,28,48,.8)", border:"1px solid rgba(255,255,255,.08)", borderRadius:20, padding:"40px 36px", backdropFilter:"blur(20px)" }}>

          <Link to="/login" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:S.muted, marginBottom:28, transition:"color .2s" }}
            onMouseEnter={e=>e.currentTarget.style.color=S.green}
            onMouseLeave={e=>e.currentTarget.style.color=S.muted}
          >
            ← Back to login
          </Link>

          <div style={{ marginBottom:28 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"rgba(78,222,163,.1)", border:"1px solid rgba(78,222,163,.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#4edea3"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <h1 style={{ fontSize:26, fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:8 }}>Forgot your password?</h1>
            <p style={{ fontSize:14, color:S.muted, lineHeight:1.65 }}>Enter your email and we'll send you a password reset link.</p>
          </div>

          {error && (
            <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"rgba(255,75,75,.08)", border:"1px solid rgba(255,75,75,.2)", fontSize:13, color:"#fca5a5" }}>{error}</div>
          )}
          {message && (
            <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"rgba(78,222,163,.08)", border:"1px solid rgba(78,222,163,.2)", fontSize:13, color:S.green }}>{message}</div>
          )}
          {resetLink && (
            <div style={{ marginBottom:16, padding:"14px 16px", borderRadius:10, background:"rgba(78,222,163,.06)", border:"1px solid rgba(78,222,163,.2)", fontSize:13 }}>
              <p style={{ fontWeight:600, color:S.green, marginBottom:8 }}>🔗 Dev mode — click your reset link:</p>
              <a href={resetLink} style={{ color:S.green, textDecoration:"underline", wordBreak:"break-all" }}>Click here to reset your password →</a>
            </div>
          )}

          <form onSubmit={handleReset} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:S.text }}>Email Address</label>
              <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ padding:"13px", borderRadius:10, background: loading ? "rgba(16,185,129,.4)" : "linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, border:"none", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 18px rgba(78,222,163,.25)", transition:"all .2s" }}
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;