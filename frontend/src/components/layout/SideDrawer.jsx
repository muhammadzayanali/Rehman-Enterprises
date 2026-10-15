import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function SideDrawer({ open, title, onClose, side = "right", children }) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200]">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <aside
        className={`absolute top-0 flex h-full w-full max-w-[400px] flex-col bg-white shadow-2xl ${
          side === "left" ? "left-0" : "right-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 bg-white px-5 py-4">
          <h2 className="text-lg font-medium">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-white px-5 py-5">{children}</div>
      </aside>
    </div>,
    document.body
  );
}
