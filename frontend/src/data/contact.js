import { WHATSAPP_NUMBER } from "../utils/whatsapp";

export const MAPS_URL = "https://maps.app.goo.gl/XCHMSbPwBAjCyjG36?g_st=awb";
export const MAPS_EMBED_URL =
  "https://maps.google.com/maps?q=139-A%20Habibullah%20Road%20Link%20Davis%20Road%20Lahore%20Pakistan&z=16&output=embed";

export const ADDRESS_LINES = ["139-A Habibullah Road", "Link Davis Road Lahore", "Pakistan"];

export const EMAILS = [
  { label: "info@rehmanenterprises.co", href: "mailto:info@rehmanenterprises.co" },
  { label: "rehman.re@gmail.com", href: "mailto:rehman.re@gmail.com" },
];

export const PHONES = [
  { kind: "Contact", display: "+92 42 36364080", href: "tel:+924236364080" },
  { kind: "Cell", display: "+92 300 8425999", href: "tel:+923008425999" },
  { kind: "WhatsApp", display: "+92 300 8425999", href: `https://wa.me/${WHATSAPP_NUMBER}` },
];
