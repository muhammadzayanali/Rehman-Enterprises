import { api, unwrapList } from "./client";

export async function fetchWishlist() {
  const { data } = await api.get("/wishlist/");
  return unwrapList(data);
}

export async function toggleWishlistApi(productId) {
  const { data } = await api.post("/wishlist/", { product_id: productId });
  return data;
}

export async function fetchCart() {
  const { data } = await api.get("/cart/");
  return unwrapList(data);
}

export async function addToCartApi(productId) {
  const { data } = await api.post("/cart/", { product_id: productId });
  return unwrapList(data);
}

export async function removeFromCartApi(productId) {
  await api.delete("/cart/", { params: { product_id: productId } });
}
