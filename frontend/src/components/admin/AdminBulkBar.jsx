export default function AdminBulkBar({ count, onDeactivate, onRemove, busy }) {
  if (!count) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border border-black/10 bg-white px-4 py-3 text-sm">
      <span className="font-medium text-ink">{count} selected</span>
      <button
        type="button"
        disabled={busy}
        onClick={onDeactivate}
        className="min-h-9 border border-black/15 px-3 py-1.5 disabled:opacity-50"
      >
        Deactivate
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onRemove}
        className="min-h-9 px-3 py-1.5 text-brand-600 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
