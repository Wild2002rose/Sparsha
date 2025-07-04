import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    //const token = localStorage.getItem("jwt");
    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");

    if (userId && userName && userRole) {
      return { userId,userName, role: userRole };
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      //localStorage.setItem("jwt", user.token);
      localStorage.setItem("userId", user.userId);
      localStorage.setItem("userName", user.userName);
      localStorage.setItem("userRole", user.role);
    } else {
      localStorage.clear();
    }
  }, [user]);

  const login = ( userId, userName, role) => {
    setUser({  userId, userName, role });
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
