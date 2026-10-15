import { api } from "./client";

export async function login(email, password) {
  const { data } = await api.post("/auth/login/", { email, password });
  return data;
}

export async function register(payload) {
  const { data } = await api.post("/auth/register/", payload);
  return data;
}

export async function logout() {
  try {
    await api.post("/auth/logout/");
  } catch {
    // token may already be invalid
  }
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me/");
  return data;
}
