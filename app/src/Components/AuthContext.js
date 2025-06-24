import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    userName: null,
    userId: null,
    role: null, // NEW
  });

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("userRole"); // NEW

    if (storedName && storedId && storedRole) {
      setUser({
        userName: storedName,
        userId: storedId,
        role: storedRole,
      });
    }
  }, []);

  const login = (name, id, role = "client") => {
    localStorage.setItem("userName", name);
    localStorage.setItem("userId", id);
    localStorage.setItem("userRole", role); // NEW
    setUser({ userName: name, userId: id, role });
  };

  const logout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole"); // NEW
    setUser({ userName: null, userId: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
