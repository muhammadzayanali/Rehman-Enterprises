import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addToCartApi, fetchCart, fetchWishlist, removeFromCartApi, toggleWishlistApi } from "../api/shop";
import { sendOrderToWhatsApp } from "../utils/whatsapp";
import { useAuth } from "./AuthContext.jsx";

const UiContext = createContext(null);

function normalize(product) {
  return {
    ...product,
    category: product.category?.name || product.category || "",
  };
}

export function UiProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [bag, setBag] = useState([]);
  const [toast, setToast] = useState("");

  async function refreshLists() {
    if (!isAuthenticated) {
      setWishlist([]);
      setBag([]);
      return;
    }
    const [saved, cart] = await Promise.all([fetchWishlist(), fetchCart()]);
    setWishlist(saved.map(normalize));
    setBag(cart.map(normalize));
  }

  useEffect(() => {
    refreshLists().catch(() => {
      setWishlist([]);
      setBag([]);
    });
  }, [isAuthenticated, user?.id]);

  const value = useMemo(
    () => ({
      searchOpen,
      setSearchOpen,
      menuOpen,
      setMenuOpen,
      wishlistOpen,
      setWishlistOpen,
      bagOpen,
      setBagOpen,
      quoteProduct,
      openQuote: (product) => setQuoteProduct(product || {}),
      closeQuote: () => setQuoteProduct(null),
      wishlist,
      bag,
      async toggleWishlist(product) {
        const data = await toggleWishlistApi(product.id);
        await refreshLists();
        return Boolean(data.saved);
      },
      isWished(slug) {
        return wishlist.some((item) => item.slug === slug);
      },
      async addToBag(product) {
        if (Number(product?.stock ?? 0) <= 0) {
          setToast("This rug is out of stock");
          return bag;
        }
        const incoming = normalize(product);
        sendOrderToWhatsApp([incoming], user);
        const cart = await addToCartApi(product.id);
        const items = cart.map(normalize);
        setBag(items);
        return items;
      },
      sendCartOrder() {
        if (!bag.length) return false;
        return sendOrderToWhatsApp(bag, user);
      },
      async removeFromBag(product) {
        const productId = product.id || product;
        await removeFromCartApi(productId);
        setBag((current) => current.filter((item) => item.id !== productId && item.slug !== product.slug));
      },
      isInBag(slug) {
        return bag.some((item) => item.slug === slug);
      },
      toast,
      showToast(message) {
        setToast(message);
        window.setTimeout(() => setToast(""), 2800);
      },
      closeOverlays() {
        setMenuOpen(false);
        setWishlistOpen(false);
        setBagOpen(false);
        setSearchOpen(false);
      },
    }),
    [searchOpen, menuOpen, wishlistOpen, bagOpen, quoteProduct, wishlist, bag, toast, isAuthenticated, user]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  return useContext(UiContext);
}
