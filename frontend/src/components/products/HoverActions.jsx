import { Heart, Search, ShoppingBag } from "lucide-react";

export default function HoverActions({ wished, inBag, bagDisabled, onWish, onBag, onView }) {
  const buttonClass =
    "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:text-brand-500";

  function handle(event, action) {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent?.stopImmediatePropagation?.();
    action?.(event);
  }

  return (
    <div
      className="hover-actions absolute right-3 top-1/2 z-30 flex flex-col gap-2"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <button type="button" onClick={(event) => handle(event, onWish)} className={`${buttonClass} ${wished ? "text-brand-500" : ""}`} aria-label="Favorite">
        <Heart size={15} fill={wished ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        disabled={bagDisabled}
        onClick={(event) => handle(event, onBag)}
        className={`${buttonClass} ${inBag ? "text-brand-500" : ""} ${bagDisabled ? "cursor-not-allowed opacity-40" : ""}`}
        aria-label={bagDisabled ? "Out of stock" : "Add to cart"}
      >
        <ShoppingBag size={15} />
      </button>
      <button type="button" onClick={(event) => handle(event, onView)} className={buttonClass} aria-label="View">
        <Search size={15} />
      </button>
    </div>
  );
}
