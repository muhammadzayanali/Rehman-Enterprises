import { api, unwrapList } from "./client";

export async function submitInquiry(payload) {
  const { data } = await api.post("/inquiries/", payload);
  return data;
}

export async function adminFetchInquiries(params) {
  const { data } = await api.get("/admin/inquiries/", { params });
  return {
    results: unwrapList(data),
    count: data?.count ?? unwrapList(data).length,
  };
}

export async function adminUpdateInquiry(id, payload) {
  const { data } = await api.patch(`/admin/inquiries/${id}/`, payload);
  return data;
}
