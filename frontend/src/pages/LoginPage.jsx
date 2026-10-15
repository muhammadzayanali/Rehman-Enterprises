import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../api/client";
import PasswordField from "../components/form/PasswordField.jsx";
import { isValidEmail } from "../utils/validation.js";

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin, ready } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = location.state?.from || "/";
  const wantsAdmin = nextPath.startsWith("/admin") || location.pathname === "/admin/login";

  if (ready && isAuthenticated) {
    if (wantsAdmin && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to={wantsAdmin ? "/admin" : nextPath} replace />;
  }

  function validate() {
    const next = {};
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 7) next.password = "Password must be at least 7 characters.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      if (wantsAdmin && !user.is_staff) {
        setError("This account does not have admin access.");
        return;
      }
      navigate(user.is_staff && wantsAdmin ? "/admin" : nextPath || "/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-wide flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-6 shadow-soft sm:p-10" noValidate>
        <p className="text-center text-xs uppercase tracking-[0.22em] text-black/50">Rehman Enterprises</p>
        <h1 className="mt-2 text-center text-2xl font-medium">
          {wantsAdmin ? "Admin Login" : "Sign in"}
        </h1>
        <p className="mt-3 text-center text-sm text-black/60">
          {wantsAdmin
            ? "Staff can open the catalog CMS after signing in."
            : "Sign in to save favorites and add rugs to your cart."}
        </p>
        <label className="mt-8 block text-sm">
          Email
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`field-input mt-2 ${fieldErrors.email ? "border-brand-500" : ""}`}
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-brand-600">{fieldErrors.email}</p>}
        </label>
        <PasswordField
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          invalid={Boolean(fieldErrors.password)}
          error={fieldErrors.password}
        />
        {error && <p className="mb-4 text-sm text-brand-600">{error}</p>}
        <button disabled={loading} className="btn-dark w-full">
          {loading ? "Signing in…" : "Login"}
        </button>
        {!wantsAdmin && (
          <p className="mt-6 text-center text-sm text-black/60">
            New here?{" "}
            <Link to="/register" state={location.state} className="text-brand-600">
              Create an account
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}
