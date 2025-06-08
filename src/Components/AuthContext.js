import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    userName: null,
    userId: null,
  });

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedId = localStorage.getItem("userId");

    if (storedName && storedId) {
      setUser({
        userName: storedName,
        userId: storedId,
      });
    }
  }, []);

  const login = (name, id) => {
    localStorage.setItem("userName", name);
    localStorage.setItem("userId", id);
    setUser({ userName: name, userId: id });
  };

  const logout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    setUser({ userName: null, userId: null });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
