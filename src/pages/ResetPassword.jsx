import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebase";

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

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode  = searchParams.get("oobCode");

  const [checking, setChecking]         = useState(true);
  const [validCode, setValidCode]       = useState(false);
  const [newPassword, setNewPassword]   = useState("");
  const [confirmPassword, setConfirm]   = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!oobCode) { setError("Invalid password reset link."); setChecking(false); return; }
      try { await verifyPasswordResetCode(auth, oobCode); setValidCode(true); }
      catch { setError("This password reset link is invalid or expired."); }
      finally { setChecking(false); }
    };
    check();
  }, [oobCode]);

  const handleReset = async (e) => {
    e.preventDefault(); setError("");
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (err) {
      if      (err.code === "auth/expired-action-code") setError("This reset link has expired.");
      else if (err.code === "auth/invalid-action-code") setError("This reset link is invalid or already used.");
      else if (err.code === "auth/weak-password")       setError("Password is too weak.");
      else setError("Unable to reset password.");
    } finally { setLoading(false); }
  };

  if (checking) {
    return (
      <div style={{ minHeight:"100vh", background:S.bg, color:S.text, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, color:S.muted }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite" }}>
            <circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
          </svg>
          Verifying reset link…
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:S.bg, color:S.text, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"-80px", left:"50%", transform:"translateX(-50%)", width:500, height:300, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(78,222,163,.08) 0%,transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:440, position:"relative", zIndex:1 }}>
        <div style={{ background:"rgba(11,28,48,.8)", border:"1px solid rgba(255,255,255,.08)", borderRadius:20, padding:"40px 36px", backdropFilter:"blur(20px)" }}>

          <Link to="/login" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:S.muted, marginBottom:28 }}
            onMouseEnter={e=>e.currentTarget.style.color=S.green}
            onMouseLeave={e=>e.currentTarget.style.color=S.muted}
          >
            ← Back to login
          </Link>

          {success ? (
            <>
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(78,222,163,.12)", border:"1px solid rgba(78,222,163,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#4edea3"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                </div>
                <h1 style={{ fontSize:26, fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:10 }}>Password reset!</h1>
                <p style={{ fontSize:14, color:S.muted, lineHeight:1.65, marginBottom:28 }}>Your password has been changed successfully. You can now log in.</p>
                <button
                  onClick={() => navigate("/login")}
                  style={{ width:"100%", padding:13, borderRadius:10, background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, border:"none", cursor:"pointer", boxShadow:"0 0 18px rgba(78,222,163,.25)" }}
                >
                  Go to Login
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom:28 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:"rgba(78,222,163,.1)", border:"1px solid rgba(78,222,163,.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#4edea3"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>
                </div>
                <h1 style={{ fontSize:26, fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:8 }}>Reset your password</h1>
                <p style={{ fontSize:14, color:S.muted, lineHeight:1.65 }}>Enter your new password below.</p>
              </div>

              {error && (
                <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"rgba(255,75,75,.08)", border:"1px solid rgba(255,75,75,.2)", fontSize:13, color:"#fca5a5" }}>{error}</div>
              )}

              {validCode && (
                <form onSubmit={handleReset} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div>
                    <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:S.text }}>New Password</label>
                    <Input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="••••••••" required />
                  </div>
                  <div>
                    <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:500, color:S.text }}>Confirm Password</label>
                    <Input type="password" value={confirmPassword} onChange={e=>setConfirm(e.target.value)} placeholder="••••••••" required />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ padding:13, borderRadius:10, background: loading ? "rgba(16,185,129,.4)" : "linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:600, fontSize:14, border:"none", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 18px rgba(78,222,163,.25)" }}
                  >
                    {loading ? "Resetting…" : "Reset Password"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;