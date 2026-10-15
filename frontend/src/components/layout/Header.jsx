import { NavLink, Link, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useUi } from "../../context/UiContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLoginGate } from "../../hooks/useLoginGate.js";
import { formatPrice, orderTotalLabel } from "../../utils/whatsapp";
import SideDrawer from "./SideDrawer.jsx";

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/pages/about-us", label: "About Us" },
  { to: "/collections", label: "Shop" },
  { to: "/pages/contact", label: "Contact" },
];

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative flex h-11 w-11 items-center justify-center text-ink transition hover:text-brand-500"
    >
      {children}
    </button>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const requireLogin = useLoginGate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const {
    setSearchOpen,
    menuOpen,
    setMenuOpen,
    wishlist,
    wishlistOpen,
    bag,
    bagOpen,
    setWishlistOpen,
    setBagOpen,
    sendCartOrder,
    showToast,
    closeOverlays,
  } = useUi();

  const links = isAdmin ? [...NAV_LINKS, { to: "/admin", label: "Admin" }] : NAV_LINKS;

  function openWishlist() {
    if (!requireLogin("wishlist")) return;
    setWishlistOpen(true);
  }

  function openBag() {
    if (!requireLogin("cart")) return;
    setBagOpen(true);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="container-wide flex h-[64px] items-center justify-between gap-3 md:h-[82px]">
        <div className="flex min-w-[72px] items-center md:min-w-[240px]">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
          <nav className="hidden items-center gap-6 text-[13px] font-medium tracking-[0.12em] lg:gap-7 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `relative py-1 transition ${isActive ? "text-brand-500" : "text-ink hover:text-brand-500"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span className={`absolute inset-x-0 -bottom-1 h-px ${isActive ? "bg-brand-500" : "bg-transparent"}`} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <Link to="/" className="flex min-w-0 items-center justify-center gap-2" onClick={closeOverlays}>
          <img src="/logo.webp" alt="Rehman Enterprises" className="h-9 w-auto object-contain md:h-11" />
          <span className="hidden leading-tight sm:block">
            <span className="block text-[14px] font-semibold tracking-wide md:text-[16px]">Rehman</span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-black/55 md:text-[11px]">
              Enterprises
            </span>
          </span>
        </Link>

        <div className="flex min-w-[72px] items-center justify-end md:min-w-[240px]">
          <IconButton label="Search" onClick={() => setSearchOpen(true)}>
            <Search size={18} />
          </IconButton>
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            aria-label="Account"
            className="hidden h-11 w-11 items-center justify-center hover:text-brand-500 sm:flex"
          >
            <User size={18} />
          </Link>
          <IconButton label="Wishlist" onClick={openWishlist}>
            <Heart size={18} />
            {isAuthenticated && wishlist.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] text-white">
                {wishlist.length}
              </span>
            )}
          </IconButton>
          <IconButton label="Cart" onClick={openBag}>
            <ShoppingBag size={18} />
            {isAuthenticated && bag.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] text-white">
                {bag.length}
              </span>
            )}
          </IconButton>
        </div>
      </div>

      <SideDrawer open={menuOpen} title="Menu" side="left" onClose={() => setMenuOpen(false)}>
        <nav className="flex flex-col gap-1 text-lg">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex min-h-12 items-center border-b border-black/5 ${isActive ? "text-brand-500" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/account" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center border-b border-black/5">
                {user?.email}
              </Link>
              <button
                type="button"
                className="flex min-h-12 items-center text-left"
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                  navigate("/");
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center border-b border-black/5">
                Sign in
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center">
                Create account
              </Link>
            </>
          )}
        </nav>
      </SideDrawer>

      <SideDrawer open={wishlistOpen} title="Favorites" onClose={() => setWishlistOpen(false)}>
        {wishlist.length === 0 ? (
          <p className="text-sm leading-6 text-black/60">Save rugs you love. They will appear here.</p>
        ) : (
          <ul className="space-y-4">
            {wishlist.map((item) => (
              <li key={item.slug} className="flex gap-3">
                <button
                  type="button"
                  className="h-20 w-16 shrink-0 overflow-hidden bg-mist"
                  onClick={() => {
                    setWishlistOpen(false);
                    navigate(`/products/${item.slug}`);
                  }}
                >
                  <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-black/50">{item.category}</p>
                  <button
                    type="button"
                    className="mt-2 text-sm text-brand-600"
                    onClick={() => {
                      setWishlistOpen(false);
                      navigate(`/products/${item.slug}`);
                    }}
                  >
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SideDrawer>

      <SideDrawer open={bagOpen} title="Cart" onClose={() => setBagOpen(false)}>
        {bag.length === 0 ? (
          <p className="text-sm leading-6 text-black/60">
            Add rugs to your cart. We send the order to WhatsApp with product details.
          </p>
        ) : (
          <div className="flex min-h-full flex-col">
            <ul className="space-y-4">
              {bag.map((item) => (
                <li key={item.slug} className="flex gap-3">
                  <img src={item.image_url} alt="" className="h-20 w-16 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-xs text-black/50">
                      {[item.dimensions, item.sku].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 text-sm text-brand-600">{formatPrice(item)}</p>
                    <RemoveBagButton item={item} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-black/10 pt-4">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-black/50">Order total</span>
                <span className="font-medium">{orderTotalLabel(bag)}</span>
              </div>
              <button
                type="button"
                className="btn-dark w-full"
                onClick={() => {
                  const sent = sendCartOrder();
                  if (sent) {
                    showToast("Opening WhatsApp with your order");
                    setBagOpen(false);
                  }
                }}
              >
                Send order on WhatsApp
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-black/45">
                Message goes to +92 300 8425999 with the rug, size, and stock ID.
              </p>
            </div>
          </div>
        )}
      </SideDrawer>
    </header>
  );
}

function RemoveBagButton({ item }) {
  const { removeFromBag } = useUi();
  return (
    <button type="button" className="text-black/50" onClick={() => removeFromBag(item)}>
      Remove
    </button>
  );
}
