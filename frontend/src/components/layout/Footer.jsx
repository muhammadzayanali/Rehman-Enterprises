import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCategories } from "../../api/catalog";
import { WHATSAPP_NUMBER } from "../../utils/whatsapp";

const FACEBOOK_URL = "https://www.facebook.com/search/top?q=rehman%20enterprises";
const INSTAGRAM_URL = "https://www.instagram.com/rehman_enterprises12/";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const headingClass = "text-[13px] font-semibold tracking-[0.04em] text-ink";
const listClass = "mt-5 space-y-2.5 text-[13px] leading-6 text-black/65";
const linkClass = "transition hover:text-ink";

function WhatsAppIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function SocialLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/70 transition hover:border-brand-500 hover:text-brand-500"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const footerCategories = categories.slice(0, 6);

  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="container-wide py-12 sm:py-16">
        <Link to="/" className="inline-flex items-center">
          <img src="/logo.webp" alt="Rehman Enterprises" className="h-10 w-auto object-contain sm:h-11" />
        </Link>

        <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <h3 className={headingClass}>Rehman Enterprises</h3>
            <address className="mt-5 space-y-3 text-[13px] leading-[22px] text-black/65 not-italic">
              <p>
                139-A Habibullah Road
                <br />
                Link Davis Road Lahore
              </p>
              <p>
                <a href="mailto:info@rehmanenterprises.co" className={linkClass}>
                  info@rehmanenterprises.co
                </a>
                <br />
                <a href="mailto:rehman.re@gmail.com" className={linkClass}>
                  rehman.re@gmail.com
                </a>
              </p>
              <p>
                Contact:{" "}
                <a href="tel:+924236364080" className={linkClass}>
                  0092 42 36364080
                </a>
                <br />
                Cell:{" "}
                <a href="tel:+923008425999" className={linkClass}>
                  0092 300 8425999
                </a>
                <br />
                WhatsApp:{" "}
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer noopener" className={linkClass}>
                  0092 300 8425999
                </a>
              </p>
            </address>
            <div className="mt-6 flex items-center gap-2.5">
              <SocialLink href={FACEBOOK_URL} label="Facebook">
                <Facebook size={15} />
              </SocialLink>
              <SocialLink href={INSTAGRAM_URL} label="Instagram">
                <Instagram size={15} />
              </SocialLink>
              <SocialLink href={WHATSAPP_URL} label="WhatsApp">
                <WhatsAppIcon />
              </SocialLink>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className={headingClass}>Quick Links</h3>
            <ul className={listClass}>
              <li>
                <Link to="/" className={linkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/pages/about-us" className={linkClass}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/collections" className={linkClass}>
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/pages/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className={headingClass}>Categories</h3>
            <ul className={listClass}>
              {footerCategories.map((category) => (
                <li key={category.id}>
                  <Link to={`/collections/${category.slug}`} className={linkClass}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className={headingClass}>Information</h3>
            <ul className={listClass}>
              <li>
                <Link to="/pages/privacy-policy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/pages/exchange-return-policy" className={linkClass}>
                  Exchange / Return Policy
                </Link>
              </li>
              <li>
                <Link to="/pages/shipping-policy" className={linkClass}>
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/pages/terms" className={linkClass}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/pages/faqs" className={linkClass}>
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-black/10 py-4 text-center text-[11px] tracking-[0.04em] text-black/50">
        © {new Date().getFullYear()} Rehman Enterprises. Heritage Home Decore.
      </div>
    </footer>
  );
}
