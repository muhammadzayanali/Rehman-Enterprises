import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function useLoginGate() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (intent = "account") => {
    if (isAuthenticated) return true;
    navigate("/login", { state: { from: location.pathname, intent } });
    return false;
  };
}
