import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import RoundLoader from "../components/ui/RoundLoader.jsx";

export default function AccountPage() {
  const { user, isAuthenticated, isAdmin, logout, ready } = useAuth();

  if (!ready) return <RoundLoader className="container-wide py-20" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="container-wide max-w-xl py-16">
      <h1 className="text-3xl font-medium">Your account</h1>
      <p className="mt-4 text-black/70">{user.name || user.email}</p>
      <p className="text-sm text-black/50">{user.email}</p>
      {isAdmin && (
        <Link to="/admin" className="btn-dark mt-8 inline-flex">
          Open admin
        </Link>
      )}
      <div className="mt-8">
        <button type="button" className="btn-light" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}
