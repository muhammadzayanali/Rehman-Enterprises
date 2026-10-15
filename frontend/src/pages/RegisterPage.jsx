import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../api/client";
import PasswordField from "../components/form/PasswordField.jsx";
import { isValidEmail } from "../utils/validation.js";

export default function RegisterPage() {
  const { register, isAuthenticated, ready } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (ready && isAuthenticated) {
    return <Navigate to={location.state?.from || "/"} replace />;
  }

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 7) next.password = "Password must be at least 7 characters.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not create this account."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-wide flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-6 shadow-soft sm:p-10" noValidate>
        <p className="text-center text-xs uppercase tracking-[0.22em] text-black/50">Rehman Enterprises</p>
        <h1 className="mt-2 text-center text-2xl font-medium">Create account</h1>
        <p className="mt-3 text-center text-sm text-black/60">
          Save favorites and keep rugs in your cart while you browse.
        </p>
        <label className="mt-8 block text-sm">
          Name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`field-input mt-2 ${fieldErrors.name ? "border-brand-500" : ""}`}
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-brand-600">{fieldErrors.name}</p>}
        </label>
        <label className="mt-4 block text-sm">
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
          autoComplete="new-password"
          invalid={Boolean(fieldErrors.password)}
          error={fieldErrors.password}
        />
        {error && <p className="mb-4 text-sm text-brand-600">{error}</p>}
        <button disabled={loading} className="btn-dark w-full">
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="mt-6 text-center text-sm text-black/60">
          Already have an account?{" "}
          <Link to="/login" state={location.state} className="text-brand-600">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
