import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SmartImage from "../ui/SmartImage.jsx";
import { fullPhotoUrl } from "../../utils/photos.js";

export default function ProductGallery({ images = [], name = "", outOfStock = false }) {
  const photos = images.filter((image) => image?.image_url);
  const [index, setIndex] = useState(0);
  const stripRef = useRef(null);
  const drag = useRef(null);
  const count = photos.length;
  const active = count ? Math.min(index, count - 1) : 0;

  useEffect(() => {
    setIndex(0);
  }, [photos[0]?.id, count]);

  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.querySelector(`[data-index="${active}"]`);
    if (!strip || !thumb) return;
    const stripBox = strip.getBoundingClientRect();
    const thumbBox = thumb.getBoundingClientRect();
    const delta = thumbBox.left - stripBox.left - (stripBox.width - thumbBox.width) / 2;
    strip.scrollBy({ left: delta, behavior: "smooth" });
  }, [active]);

  function go(next) {
    if (count < 2) return;
    setIndex((next + count) % count);
  }

  function scrollStrip(direction) {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollBy({ left: direction * Math.max(strip.clientWidth * 0.75, 160), behavior: "smooth" });
  }

  function onPointerDown(event) {
    drag.current = { x: event.clientX, id: event.pointerId };
  }

  function onPointerUp(event) {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    const delta = event.clientX - drag.current.x;
    drag.current = null;
    if (delta > 50) go(active - 1);
    else if (delta < -50) go(active + 1);
  }

  if (!count) return null;
  const photo = photos[active];

  return (
    <div className="min-w-0">
      <div
        className={`relative bg-white ${outOfStock ? "grayscale" : ""}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <SmartImage
          key={photo.id || photo.image_url}
          src={fullPhotoUrl(photo.image_url)}
          alt={photo.alt_text || name}
          eager
          natural
          fit="contain"
          className={outOfStock ? "opacity-60" : ""}
        />
        {outOfStock && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/55 py-2 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-white">
            Out of stock
          </span>
        )}
        {count > 1 && (
          <>
            <GalleryButton label="Previous photo" className="left-2" onClick={() => go(active - 1)}>
              <ChevronLeft size={18} />
            </GalleryButton>
            <GalleryButton label="Next photo" className="right-2" onClick={() => go(active + 1)}>
              <ChevronRight size={18} />
            </GalleryButton>
            <span className="pointer-events-none absolute bottom-3 right-3 bg-white/90 px-2 py-1 text-[11px] tracking-[0.14em] text-ink">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex items-center gap-2 sm:mt-4">
          <GalleryButton label="Previous thumbnails" onClick={() => scrollStrip(-1)} floating={false}>
            <ChevronLeft size={16} />
          </GalleryButton>
          <div ref={stripRef} className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth">
            {photos.map((image, imageIndex) => {
              const selected = imageIndex === active;
              return (
                <button
                  key={image.id || image.image_url}
                  type="button"
                  data-index={imageIndex}
                  onClick={() => setIndex(imageIndex)}
                  aria-label={`Photo ${imageIndex + 1} of ${count}`}
                  aria-current={selected ? "true" : undefined}
                  className={`flex h-20 w-16 shrink-0 items-center justify-center border bg-white sm:h-24 sm:w-20 ${
                    selected ? "border-ink" : "border-black/10"
                  }`}
                >
                  <img
                    src={fullPhotoUrl(image.image_url)}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                </button>
              );
            })}
          </div>
          <GalleryButton label="Next thumbnails" onClick={() => scrollStrip(1)} floating={false}>
            <ChevronRight size={16} />
          </GalleryButton>
        </div>
      )}
    </div>
  );
}

function GalleryButton({ label, className = "", children, onClick, floating = true }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onPointerDown={(event) => event.stopPropagation()}
      className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 bg-white text-ink shadow-sm transition hover:border-ink ${
        floating ? `absolute top-1/2 -translate-y-1/2 ${className}` : className
      }`}
    >
      {children}
    </button>
  );
}
