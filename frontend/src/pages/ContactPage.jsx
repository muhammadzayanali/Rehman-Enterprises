import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { ADDRESS_LINES, EMAILS, MAPS_EMBED_URL, MAPS_URL, PHONES } from "../data/contact";
import { isValidEmail } from "../utils/validation.js";
import { sendContactToWhatsApp } from "../utils/whatsapp";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ error: "", success: "" });

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (form.message.trim().length < 8) next.message = "Please write a slightly longer message.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(event) {
    event.preventDefault();
    setStatus({ error: "", success: "" });
    if (!validate()) return;
    sendContactToWhatsApp(form);
    setForm({ name: "", email: "", message: "" });
    setStatus({
      error: "",
      success: "WhatsApp is opening. This chat is saved on the shop WhatsApp.",
    });
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
              <a href={MAPS_URL} target="_blank" rel="noreferrer noopener" className="hover:text-ink">
                {ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </a>
            </p>
            <div className="space-y-2">
              {PHONES.map((phone) => (
                <p key={phone.kind} className="flex gap-3">
                  <Phone size={18} className="shrink-0 text-brand-500" />
                  <span>
                    {phone.kind}:{" "}
                    <a
                      href={phone.href}
                      className="hover:text-ink"
                      {...(phone.kind === "WhatsApp" ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                    >
                      {phone.display}
                    </a>
                  </span>
                </p>
              ))}
            </div>
            <div className="space-y-2">
              {EMAILS.map((email) => (
                <p key={email.href} className="flex gap-3">
                  <Mail size={18} className="shrink-0 text-brand-500" />
                  <a href={email.href} className="hover:text-ink">
                    {email.label}
                  </a>
                </p>
              ))}
            </div>
          </div>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Open Rehman Enterprises on Google Maps"
            className="relative mt-8 block overflow-hidden border border-black/10"
          >
            <iframe
              title="Rehman Enterprises location"
              src={MAPS_EMBED_URL}
              className="pointer-events-none h-56 w-full sm:h-64"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <span className="absolute inset-x-0 bottom-0 bg-ink/80 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.14em] text-white">
              Open in Google Maps
            </span>
          </a>
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
          <button className="btn-dark">Send message</button>
        </form>
      </section>
    </div>
  );
}
