import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProduct, fetchProducts } from "../../api/catalog";
import { useUi } from "../../context/UiContext.jsx";
import { useLoginGate } from "../../hooks/useLoginGate.js";
import SmartImage from "../ui/SmartImage.jsx";
import HoverActions from "../products/HoverActions.jsx";
import { isOutOfStock } from "../../utils/stock.js";

export default function CategoryCard({ category }) {
  const navigate = useNavigate();
  const requireLogin = useLoginGate();
  const { toggleWishlist, isWished, addToBag, isInBag, showToast, setBagOpen } = useUi();
  const collectionTo = `/collections/${category.slug}`;
  const [product, setProduct] = useState(category.product || null);
  const wished = product ? isWished(product.slug) : false;
  const inBag = product ? isInBag(product.slug) : false;
  const categorySoldOut = (category.product_count || 0) > 0 && (category.stock_count || 0) <= 0;
  const productSoldOut = isOutOfStock(product);
  const outOfStock = categorySoldOut;

  useEffect(() => {
    let cancelled = false;
    if (category.product?.id) {
      setProduct(category.product);
      return undefined;
    }
    fetchProduct(category.slug)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() =>
        fetchProducts({ category: category.slug, limit: 1 }).then((data) => {
          if (!cancelled) setProduct(data.results?.[0] || null);
        })
      )
      .catch(() => {
        if (!cancelled) setProduct(null);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  async function onWish(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (!requireLogin("wishlist")) return;
    if (!product?.id) {
      showToast("This collection has no product to save yet.");
      return;
    }
    const added = await toggleWishlist(product);
    showToast(added ? "Saved to favorites" : "Removed from favorites");
  }

  async function onBag(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (outOfStock || productSoldOut) {
      showToast("This rug is out of stock");
      return;
    }
    if (!requireLogin("cart")) return;
    if (!product?.id) {
      showToast("This collection has no product to add yet.");
      return;
    }
    if (inBag) {
      setBagOpen(true);
      return;
    }
    await addToBag(product);
    showToast("Added to cart — opening WhatsApp order");
  }

  return (
    <article className={`group relative overflow-hidden bg-mist ${outOfStock ? "grayscale" : ""}`}>
      <Link to={collectionTo} className="block">
        <SmartImage
          src={category.image_url}
          alt={category.name}
          className={`aspect-[3/4] h-full w-full object-cover transition duration-700 ${
            outOfStock ? "opacity-60" : "group-hover:scale-105"
          }`}
        />
      </Link>
      {outOfStock && (
        <span className="pointer-events-none absolute inset-x-0 top-4 z-20 mx-auto w-max bg-black/55 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
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
          bagDisabled={outOfStock || productSoldOut}
          onWish={onWish}
          onBag={onBag}
          onView={() => navigate(collectionTo)}
        />
      </div>
      <Link
        to={collectionTo}
        className="absolute bottom-5 left-0 z-[1] max-w-[90%] bg-brand-500 px-4 py-2 text-[13px] font-medium text-white shadow sm:bottom-8 sm:px-6 sm:text-sm"
      >
        {category.name}
      </Link>
    </article>
  );
}
