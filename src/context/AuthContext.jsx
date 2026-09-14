
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));

          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              ...data,
              role: (data.role || "viewer").toLowerCase().trim(),
            });
          } else {
            const emailLower = (currentUser.email || "").toLowerCase();
            const fallbackRole = emailLower.includes("admin")
              ? "admin"
              : emailLower.includes("staff")
              ? "staff"
              : "viewer";

            setUserData({
              uid: currentUser.uid,
              email: currentUser.email,
              fullName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
              role: fallbackRole,
            });
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
          const emailLower = (currentUser?.email || "").toLowerCase();
          const fallbackRole = emailLower.includes("admin")
            ? "admin"
            : emailLower.includes("staff")
            ? "staff"
            : "viewer";

          setUserData({
            uid: currentUser.uid,
            email: currentUser.email,
            fullName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
            role: fallbackRole,
          });
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
