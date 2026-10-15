import { useState } from "react";
import { X } from "lucide-react";
import { useUi } from "../../context/UiContext.jsx";
import { submitInquiry } from "../../api/inquiries";
import { getErrorMessage } from "../../api/client";
import { isValidEmail } from "../../utils/validation.js";

export default function QuoteModal() {
  const { quoteProduct, closeQuote, showToast } = useUi();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!quoteProduct) return null;

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (form.message.trim().length < 8) next.message = "Please add a little more detail.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await submitInquiry({
        name: form.name,
        email: form.email,
        message: form.message,
        product_id: quoteProduct.id || null,
      });
      setForm({ name: "", email: "", message: "" });
      closeQuote();
      showToast("Inquiry sent. We will contact you shortly.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not send inquiry."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[220] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-soft sm:rounded-lg sm:p-8">
        <button
          type="button"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center"
          onClick={closeQuote}
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-500">Request a quote</p>
        <h3 className="mt-2 pr-8 text-2xl font-medium">{quoteProduct.name || "General inquiry"}</h3>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="field-input"
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-brand-600">{fieldErrors.name}</p>}
          </div>
          <div>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="field-input"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-brand-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <textarea
              rows="4"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us the size, colors, or room you have in mind."
              className="field-input"
            />
            {fieldErrors.message && <p className="mt-1 text-xs text-brand-600">{fieldErrors.message}</p>}
          </div>
          {error && <p className="text-sm text-brand-600">{error}</p>}
          <button disabled={loading} className="btn-dark w-full">
            {loading ? "Sending…" : "Send inquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}
