import { Link, useNavigate } from "react-router-dom";
import { useUi } from "../../context/UiContext.jsx";
import { useLoginGate } from "../../hooks/useLoginGate.js";
import SmartImage from "../ui/SmartImage.jsx";
import HoverActions from "./HoverActions.jsx";
import { isOutOfStock } from "../../utils/stock.js";

export default function ProductCard({ product, eager = false }) {
  const navigate = useNavigate();
  const requireLogin = useLoginGate();
  const { toggleWishlist, isWished, addToBag, isInBag, showToast, setBagOpen } = useUi();
  const wished = isWished(product.slug);
  const inBag = isInBag(product.slug);
  const outOfStock = isOutOfStock(product);
  const productTo = `/products/${product.slug}`;

  async function onWish(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (!requireLogin("wishlist")) return;
    const added = await toggleWishlist(product);
    showToast(added ? "Saved to favorites" : "Removed from favorites");
  }

  async function onBag(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (outOfStock) {
      showToast("This rug is out of stock");
      return;
    }
    if (!requireLogin("cart")) return;
    if (inBag) {
      setBagOpen(true);
      return;
    }
    await addToBag(product);
    showToast("Added to cart — opening WhatsApp order");
  }

  return (
    <article className={`group ${outOfStock ? "grayscale" : ""}`}>
      <div className="relative overflow-hidden bg-mist">
        <Link to={productTo} className="block">
          <SmartImage
            src={product.image_url}
            alt={product.name}
            eager={eager}
            className={`aspect-[3/4] h-full w-full object-cover transition duration-500 ${
              outOfStock ? "opacity-60" : "group-hover:scale-[1.03]"
            }`}
          />
        </Link>
        {outOfStock && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-black/55 py-2 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-white">
            Out of stock
          </span>
        )}
        <div
          className="absolute inset-y-0 right-0 z-30 w-16"
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <HoverActions
            wished={wished}
            inBag={inBag}
            bagDisabled={outOfStock}
            onWish={onWish}
            onBag={onBag}
            onView={() => navigate(productTo)}
          />
        </div>
      </div>
      <Link to={productTo} className="mt-3 block">
        <h3 className="product-name text-[15px] leading-snug sm:text-base">{product.name}</h3>
        <p className={`mt-1 text-[13px] md:text-sm ${outOfStock ? "text-black/40" : "text-brand-500"}`}>
          {outOfStock ? "Out of stock" : "Inquire for price"}
        </p>
      </Link>
    </article>
  );
}
