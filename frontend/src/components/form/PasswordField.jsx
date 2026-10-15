import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  value,
  onChange,
  autoComplete = "current-password",
  invalid = false,
  error,
  label = "Password",
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="mt-4 mb-6 block text-sm">
      {label}
      <span className="relative mt-2 block">
        <input
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className={`field-input pr-12 ${invalid ? "border-brand-500" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((open) => !open)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-black/45 transition hover:text-ink"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {error && <p className="mt-1 text-xs text-brand-600">{error}</p>}
    </label>
  );
}
