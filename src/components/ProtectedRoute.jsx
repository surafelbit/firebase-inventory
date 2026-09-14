import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#031427", color: "#8aa0b8" }}>
        Loading...
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
