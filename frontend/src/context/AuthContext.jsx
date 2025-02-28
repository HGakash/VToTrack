import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        setUser(decoded);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (token) => {
    localStorage.removeItem("token");
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser(decoded);
    return decoded;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Don't render children until initial auth check is complete
  if (loading) {
    return null; // or return a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;