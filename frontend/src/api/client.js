import axios from "axios";
import { getAuthToken } from "./token";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : data.detail;
  if (data.non_field_errors) return data.non_field_errors[0];
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const value = data[firstKey];
    return Array.isArray(value) ? value[0] : String(value);
  }
  return fallback;
}
