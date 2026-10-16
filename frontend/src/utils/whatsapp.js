export const WHATSAPP_NUMBER = "923008425999";

export function formatPrice() {
  return "Inquire for price";
}

function whatsappPrice() {
  return "";
}

function categoryName(product) {
  if (!product?.category) return "";
  return typeof product.category === "object" ? product.category.name || "" : String(product.category);
}

function customerName(customer) {
  const name = (customer?.name || customer?.first_name || "").trim();
  if (name && name.toLowerCase() !== String(customer?.email || "").toLowerCase()) {
    return name;
  }
  return "";
}

function formatItem(product, index) {
  const lines = [`${index + 1}) *${product.name || "Rug"}*`];
  const collection = categoryName(product);
  if (collection) lines.push(`   Collection: ${collection}`);
  if (product.dimensions) lines.push(`   Size: ${product.dimensions}`);
  if (product.material) lines.push(`   Material: ${product.material}`);
  if (product.shape) lines.push(`   Shape: ${product.shape}`);
  if (product.sku) lines.push(`   Stock ID: ${product.sku}`);
  const price = whatsappPrice(product);
  if (price) lines.push(`   Price: ${price}`);
  return lines.join("\n");
}

export function orderTotalLabel(products) {
  const items = products || [];
  if (!items.length) return "To be quoted";
  const priced = items.filter((item) => whatsappPrice(item));
  if (priced.length !== items.length) return "To be quoted";
  const total = priced.reduce((sum, item) => sum + Number(item.price || 0), 0);
  return `$${total.toFixed(2)}`;
}

export function buildOrderMessage(products, customer) {
  const items = products || [];
  const name = customerName(customer);
  const customerBlock = ["*Customer*"];
  if (name) customerBlock.push(`Name: ${name}`);
  customerBlock.push(`Email: ${customer?.email || "Not provided"}`);

  const body = [
    "*New Order — Rehman Enterprises*",
    "",
    "I want to place an order for the rug(s) below.",
    "",
    ...customerBlock,
    "",
    `*Order items (${items.length})*`,
    "",
    items.map((item, index) => formatItem(item, index)).join("\n\n"),
    "",
    `*Total: ${orderTotalLabel(items)}*`,
    "",
    "Please confirm availability and how I can complete this order. Thank you.",
  ];
  return body.join("\n");
}

export function whatsappOrderUrl(products, customer) {
  const text = buildOrderMessage(products, customer);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function sendOrderToWhatsApp(products, customer) {
  const items = products || [];
  if (!items.length) return false;
  return openWhatsApp(whatsappOrderUrl(items, customer));
}

export function buildQuoteMessage(product, customer) {
  const name = customerName(customer);
  const customerBlock = ["*Customer*"];
  if (name) customerBlock.push(`Name: ${name}`);
  if (customer?.email) customerBlock.push(`Email: ${customer.email}`);
  if (!name && !customer?.email) customerBlock.push("Browsing as guest");

  return [
    "*Price quote only — Rehman Enterprises*",
    "",
    "I am not placing an order yet. Please send the price for this rug.",
    "",
    ...customerBlock,
    "",
    "*Rug for quote*",
    formatItem(product, 0).replace(/^1\) /, ""),
    "",
    "Please reply with the price, availability, and any custom size options. Thank you.",
  ].join("\n");
}

export function whatsappQuoteUrl(product, customer) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildQuoteMessage(product, customer))}`;
}

export function sendQuoteToWhatsApp(product, customer) {
  if (!product) return false;
  return openWhatsApp(whatsappQuoteUrl(product, customer));
}

export function buildContactMessage(form) {
  return [
    "*Contact message — Rehman Enterprises*",
    "",
    "*Customer*",
    `Name: ${form.name || "Not provided"}`,
    `Email: ${form.email || "Not provided"}`,
    "",
    "*Message*",
    form.message || "",
    "",
    "Please reply in this WhatsApp chat.",
  ].join("\n");
}

export function sendContactToWhatsApp(form) {
  if (!form?.message) return false;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildContactMessage(form))}`;
  return openWhatsApp(url);
}

function openWhatsApp(url) {
  const opened = window.open(url, "_blank");
  if (!opened) {
    window.location.assign(url);
  }
  return true;
}

export function normalizeWhatsAppNumber(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length >= 10) digits = `92${digits.slice(1)}`;
  return digits;
}

export function customerStatusWhatsAppUrl(inquiry, kind) {
  const number = normalizeWhatsAppNumber(inquiry?.phone);
  if (!number) return "";
  const name = inquiry?.name || "there";
  const text =
    kind === "CLOSED"
      ? `Hello ${name}, this is Rehman Enterprises. Thank you for your message. We have closed this request. Reply here on WhatsApp if you need anything else.`
      : `Hello ${name}, this is Rehman Enterprises. We received your message and are happy to help. Please reply here on WhatsApp.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function notifyCustomerOnWhatsApp(inquiry, kind) {
  const url = customerStatusWhatsAppUrl(inquiry, kind);
  if (!url) return false;
  return openWhatsApp(url);
}

