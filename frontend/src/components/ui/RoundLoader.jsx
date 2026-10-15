export default function RoundLoader({ size = "md", className = "" }) {
  const box = size === "sm" ? "h-7 w-7 border-2" : size === "lg" ? "h-12 w-12 border-[3px]" : "h-10 w-10 border-[3px]";
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <span className={`${box} animate-spin rounded-full border-black/10 border-t-brand-500`} />
    </div>
  );
}
