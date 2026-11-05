/** Detail photos keep their real shape. Shop cards still use the padded frame. */
export function fullPhotoUrl(url) {
  if (!url || !url.includes("/upload/")) return url;
  const [prefix, rest] = url.split("/upload/");
  const parts = rest.split("/");
  const first = parts[0] || "";
  const isTransform = first.includes(",") || /^(w_|h_|c_|ar_|f_|q_|b_|g_)/.test(first);
  const tail = (isTransform ? parts.slice(1) : parts).join("/");
  return `${prefix}/upload/c_limit,w_2000,f_auto,q_auto/${tail}`;
}
