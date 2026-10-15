export function stockCount(item) {
  const value = Number(item?.stock ?? item?.stock_count ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function isOutOfStock(item) {
  if (!item) return false;
  if (typeof item.in_stock === "boolean") return !item.in_stock;
  return stockCount(item) <= 0;
}
