export const TOKEN_KEY = "re_auth_token";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("re_admin_token");
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem("re_admin_token");
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("re_admin_token");
}
