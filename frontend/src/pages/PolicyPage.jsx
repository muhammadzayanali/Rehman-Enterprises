import { useParams } from "react-router-dom";

const copy = {
  "privacy-policy": {
    title: "Privacy Policy",
    body: "Rehman Enterprises collects only the information needed to answer catalog inquiries: name, email, and your message. We do not sell personal data. Inquiry records are stored so the studio can follow up on commissions and quotes.",
  },
  "exchange-return-policy": {
    title: "Exchange / Return Policy",
    body: "Handmade rugs are often commissioned or reserved as unique pieces. Please write to us before a purchase if you need measurements confirmed. Returns and exchanges are handled case by case for unused rugs in original condition.",
  },
  "shipping-policy": {
    title: "Shipping Policy",
    body: "We ship from our Lahore production and US distribution partners. Lead times depend on whether a rug is in current stock or being woven to order. Freight details are confirmed when a quote is accepted.",
  },
  terms: {
    title: "Terms & Conditions",
    body: "Content on this website describes our current collections. Colors on screen may differ slightly from the finished wool. Quotes are valid for a limited period and subject to yarn availability.",
  },
  faqs: {
    title: "FAQs",
    body: "Can you weave a custom size? Yes. Most collections can be commissioned. Do you publish prices online? Many pieces are quoted individually because size, knot count, and silk content vary. How do I reach you? Use Request a Quote or the contact form.",
  },
};

export default function PolicyPage() {
  const { slug } = useParams();
  const page = copy[slug] || { title: "Information", body: "Please contact us for details." };

  return (
    <div className="container-wide max-w-3xl py-12 sm:py-20">
      <h1 className="text-3xl font-medium sm:text-4xl">{page.title}</h1>
      <span className="mt-4 mb-8 block h-[2px] w-10 bg-brand-500" />
      <p className="text-[15px] leading-7 text-black/75">{page.body}</p>
    </div>
  );
}
