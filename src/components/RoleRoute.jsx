
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ allowedRoles }) {
    const { user, userData, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", color: "#8aa0b8", background: "#031427" }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const emailLower = (user.email || "").toLowerCase();
    const currentRole = (
        userData?.role ||
        (emailLower.includes("admin") ? "admin" :
         emailLower.includes("staff") ? "staff" : "viewer")
    ).toLowerCase().trim();

    const allowed = allowedRoles.map((r) => r.toLowerCase().trim());

    if (!allowed.includes(currentRole)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export default RoleRoute;

