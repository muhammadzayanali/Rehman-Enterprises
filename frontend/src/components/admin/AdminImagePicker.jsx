import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";
import { fullPhotoUrl } from "../../utils/photos.js";

export default function AdminImagePicker({
  existingImages = [],
  newFiles = [],
  onAddFiles,
  onRemoveExisting,
  onMoveExisting,
  onRemoveNew,
  onMoveNew,
  editing = false,
}) {
  const inputRef = useRef(null);
  const stripRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [active, setActive] = useState(null);
  const previousNewCount = useRef(newFiles.length);

  const items = [
    ...existingImages.map((image, index) => ({
      kind: "saved",
      index,
      key: `saved-${image.id}`,
      src: fullPhotoUrl(image.image_url),
      label: `Saved photo ${index + 1}`,
    })),
    ...newFiles.map((item, index) => ({
      kind: "new",
      index,
      key: item.preview,
      src: item.preview,
      label: item.file?.name || `New photo ${index + 1}`,
    })),
  ];

  useEffect(() => {
    if (newFiles.length > previousNewCount.current) {
      setActive({ kind: "new", index: newFiles.length - 1 });
    } else if (!active && existingImages.length) {
      setActive({ kind: "saved", index: 0 });
    } else if (active?.kind === "new" && active.index >= newFiles.length) {
      setActive(newFiles.length ? { kind: "new", index: newFiles.length - 1 } : existingImages[0] ? { kind: "saved", index: 0 } : null);
    } else if (active?.kind === "saved" && active.index >= existingImages.length) {
      setActive(existingImages.length ? { kind: "saved", index: existingImages.length - 1 } : null);
    }
    previousNewCount.current = newFiles.length;
  }, [newFiles.length, existingImages.length, active, existingImages]);

  useEffect(() => {
    if (!active) return;
    const strip = stripRef.current;
    const thumb = strip?.querySelector(`[data-key="${active.kind}-${active.index}"]`);
    if (!strip || !thumb) return;
    const stripBox = strip.getBoundingClientRect();
    const thumbBox = thumb.getBoundingClientRect();
    const delta = thumbBox.left - stripBox.left - (stripBox.width - thumbBox.width) / 2;
    strip.scrollBy({ left: delta, behavior: "smooth" });
  }, [active]);

  function addFromList(fileList) {
    const images = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    if (images.length) onAddFiles(images);
  }

  const current = items.find((item) => item.kind === active?.kind && item.index === active?.index) || items[0] || null;
  const currentPosition = current ? items.findIndex((item) => item.key === current.key) : -1;

  return (
    <div>
      <p className="text-sm font-medium">{editing ? "Edit photos" : "Images"}</p>
      <p className="mb-3 text-xs text-black/50">
        {editing
          ? "Review every saved photo at full size. Add more, reorder them, or remove one before you save."
          : "Add one photo or a whole set. Each picture shows here in full before you save."}
      </p>

      {current && (
        <div className="mt-4 border bg-white p-3">
          <div className="flex items-center justify-center bg-white">
            <img
              src={current.src}
              alt={current.label}
              className="h-auto w-full object-contain"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <p className="min-w-0 break-all text-black/60">
              {currentPosition + 1} / {items.length}
              <span className="mx-2 text-black/20">·</span>
              {current.kind === "new" ? "Not saved yet" : "Saved"}
              <span className="mx-2 text-black/20">·</span>
              {current.label}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={current.index <= 0}
                onClick={() => {
                  const nextIndex = current.index - 1;
                  if (current.kind === "saved") onMoveExisting(current.index, -1);
                  else onMoveNew(current.index, -1);
                  setActive({ kind: current.kind, index: nextIndex });
                }}
                className="border border-black/10 px-2 py-1 disabled:opacity-30"
              >
                Earlier
              </button>
              <button
                type="button"
                disabled={
                  current.kind === "saved"
                    ? current.index >= existingImages.length - 1
                    : current.index >= newFiles.length - 1
                }
                onClick={() => {
                  const nextIndex = current.index + 1;
                  if (current.kind === "saved") onMoveExisting(current.index, 1);
                  else onMoveNew(current.index, 1);
                  setActive({ kind: current.kind, index: nextIndex });
                }}
                className="border border-black/10 px-2 py-1 disabled:opacity-30"
              >
                Later
              </button>
              <button
                type="button"
                onClick={() => {
                  if (current.kind === "saved") onRemoveExisting(existingImages[current.index].id);
                  else onRemoveNew(current.index);
                }}
                className="border border-black/10 px-2 py-1 text-brand-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous photos"
            onClick={() => stripRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          <div ref={stripRef} className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth">
            {items.map((item) => {
              const selected = current?.key === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  data-key={`${item.kind}-${item.index}`}
                  onClick={() => setActive({ kind: item.kind, index: item.index })}
                  className={`relative flex h-20 w-16 shrink-0 items-center justify-center border bg-white ${
                    selected ? "border-ink" : "border-black/10"
                  }`}
                >
                  <img src={item.src} alt="" className="max-h-full max-w-full object-contain" />
                  {item.kind === "new" && (
                    <span className="absolute left-0 top-0 bg-ink px-1 text-[9px] uppercase tracking-wide text-white">
                      New
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Next photos"
            onClick={() => stripRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 bg-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          addFromList(event.dataTransfer.files);
        }}
        className={`mt-4 flex w-full flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-sm transition ${
          dragOver ? "border-ink bg-white" : "border-black/20 bg-white hover:border-black/40"
        }`}
      >
        <ImagePlus size={22} />
        <span className="font-medium">{editing ? "Add more photos" : "Add photos"}</span>
        <span className="text-xs text-black/50">Drop images here, or click to choose several</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFromList(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
