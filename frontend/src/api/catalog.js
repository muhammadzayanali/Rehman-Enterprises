import { api, unwrapList } from "./client";

export async function fetchCategories(params) {
  const { data } = await api.get("/categories/", { params });
  return unwrapList(data);
}

export async function fetchCategory(slug) {
  const { data } = await api.get(`/categories/${slug}/`);
  return data;
}

export async function fetchProducts(params) {
  const { data } = await api.get("/products/", { params });
  if (Array.isArray(data)) return { results: data, count: data.length };
  return {
    results: unwrapList(data),
    count: data?.count ?? unwrapList(data).length,
    next: data?.next ?? null,
  };
}

export async function fetchProduct(slug) {
  const { data } = await api.get(`/products/${slug}/`);
  return data;
}

export async function searchProducts(query) {
  const { products } = await searchCatalog(query);
  return products;
}

export async function searchCatalog(query, { productLimit = 8 } = {}) {
  if (!query?.trim()) return { categories: [], products: [] };
  const params = { search: query.trim() };
  const productParams = { ...params };
  if (productLimit) productParams.limit = productLimit;
  const [{ data: categoryData }, { data: productData }] = await Promise.all([
    api.get("/categories/", { params }),
    api.get("/products/", { params: productParams }),
  ]);
  return {
    categories: unwrapList(categoryData),
    products: unwrapList(productData),
  };
}

export async function adminFetchCategories(params) {
  const { data } = await api.get("/admin/categories/", { params });
  return data;
}

export async function adminFetchCategory(id) {
  const { data } = await api.get(`/admin/categories/${id}/`);
  return data;
}

export async function adminCreateCategory(formData) {
  const { data } = await api.post("/admin/categories/", formData);
  return data;
}

export async function adminUpdateCategory(id, formData) {
  const { data } = await api.patch(`/admin/categories/${id}/`, formData);
  return data;
}

export async function adminDeleteCategory(id) {
  await api.delete(`/admin/categories/${id}/`);
}

export async function adminFetchProducts(params) {
  const { data } = await api.get("/admin/products/", { params });
  return data;
}

export async function adminFetchProduct(id) {
  const { data } = await api.get(`/admin/products/${id}/`);
  return data;
}

export async function adminCreateProduct(formData) {
  const { data } = await api.post("/admin/products/", formData);
  return data;
}

export async function adminUpdateProduct(id, formData) {
  const { data } = await api.patch(`/admin/products/${id}/`, formData);
  return data;
}

export async function adminDeleteProduct(id) {
  await api.delete(`/admin/products/${id}/`);
}

export async function adminDeleteProductImage(id) {
  await api.delete(`/admin/product-images/${id}/`);
}

export async function adminReorderImages(productId, order) {
  const { data } = await api.post(`/admin/products/${productId}/images/reorder/`, {
    order,
  });
  return data;
}
