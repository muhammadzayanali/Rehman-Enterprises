import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { submitInquiry } from "../api/inquiries";
import { getErrorMessage } from "../api/client";
import { isValidEmail, isValidPhone } from "../utils/validation.js";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!isValidPhone(form.phone)) next.phone = "Enter a WhatsApp number so we can reply.";
    if (form.message.trim().length < 8) next.message = "Please write a slightly longer message.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setStatus({ error: "", success: "" });
    if (!validate()) return;
    setLoading(true);
    try {
      await submitInquiry(form);
      setForm({ name: "", email: "", phone: "", message: "" });
      setStatus({ error: "", success: "Thank you. We will respond shortly." });
    } catch (error) {
      setStatus({ error: getErrorMessage(error, "Could not send your message."), success: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="relative h-[220px] overflow-hidden sm:h-[280px]">
        <img src="/Your_home_imag.webp" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-white">
          <h1 className="text-3xl font-medium sm:text-4xl">Contact Us</h1>
          <p className="mt-3 text-sm text-white/80">Home / Contact</p>
        </div>
      </section>

      <section className="container-wide grid gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="text-2xl font-medium sm:text-3xl">Get in touch</h2>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-black/70">
            Reach out with questions, feedback, or a commission. We value your inquiry and will
            respond as soon as we can.
          </p>
          <div className="mt-8 space-y-5 text-sm leading-6 text-black/75">
            <p className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-brand-500" />
              3550 N. Duke Ave Unit #695, Fresno, CA, 93727, United States.
              <br />
              139-A Habibullah Rd, Garhi Shahu, Lahore, Punjab
            </p>
            <p className="flex gap-3">
              <Phone size={18} className="shrink-0 text-brand-500" />
              <a href="tel:+12679411000">+267-941-1000</a>
            </p>
            <p className="flex gap-3">
              <Mail size={18} className="shrink-0 text-brand-500" />
              <a href="mailto:rehman.re@gmail.com">rehman.re@gmail.com</a>
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 bg-mist p-5 sm:p-8" noValidate>
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
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="WhatsApp number"
              className="field-input"
            />
            {fieldErrors.phone && <p className="mt-1 text-xs text-brand-600">{fieldErrors.phone}</p>}
          </div>
          <div>
            <textarea
              rows="6"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Message"
              className="field-input"
            />
            {fieldErrors.message && <p className="mt-1 text-xs text-brand-600">{fieldErrors.message}</p>}
          </div>
          {status.error && <p className="text-sm text-brand-600">{status.error}</p>}
          {status.success && <p className="text-sm text-green-700">{status.success}</p>}
          <button disabled={loading} className="btn-dark">
            {loading ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
    </div>
  );
}
