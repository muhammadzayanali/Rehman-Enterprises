export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

export function isValidPhone(value) {
  return digitsOnly(value).length >= 10;
}
