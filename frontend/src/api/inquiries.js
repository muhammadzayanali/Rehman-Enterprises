import { api } from "./client";

export async function submitInquiry(payload) {
  const { data } = await api.post("/inquiries/", payload);
  return data;
}
