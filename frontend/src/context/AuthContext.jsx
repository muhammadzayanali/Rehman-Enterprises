import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from "../api/auth";
import { clearAuthToken, getAuthToken, setAuthToken } from "../api/token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setReady(true);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => {
        clearAuthToken();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user?.is_staff),
      async login(email, password) {
        const data = await loginRequest(email, password);
        setAuthToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async register(payload) {
        const data = await registerRequest(payload);
        setAuthToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        await logoutRequest();
        clearAuthToken();
        setUser(null);
      },
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
