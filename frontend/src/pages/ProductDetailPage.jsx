import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProduct } from "../api/catalog";
import ProductGallery from "../components/products/ProductGallery.jsx";
import ProductGrid from "../components/products/ProductGrid.jsx";
import RoundLoader from "../components/ui/RoundLoader.jsx";
import { useUi } from "../context/UiContext.jsx";
import { useLoginGate } from "../hooks/useLoginGate.js";
import { isOutOfStock } from "../utils/stock.js";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const { openQuote, toggleWishlist, isWished, addToBag, showToast } = useUi();
  const requireLogin = useLoginGate();
  const outOfStock = isOutOfStock(product);

  useEffect(() => {
    setError("");
    window.scrollTo(0, 0);
    fetchProduct(slug)
      .then((data) => {
        setProduct(data);
      })
      .catch(() => setError("This rug is no longer available."));
  }, [slug]);

  if (error) {
    return <p className="container-wide py-24 text-center text-black/60">{error}</p>;
  }
  if (!product) {
    return <RoundLoader className="container-wide py-24" />;
  }

  return (
    <div className="container-wide py-8 sm:py-12">
      <p className="break-words text-xs text-black/50 sm:text-sm">
        <Link to="/">Home</Link> /{" "}
        <Link to={`/collections/${product.category?.slug}`}>{product.category?.name}</Link> /{" "}
        {product.name}
      </p>

      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          key={product.slug}
          images={
            product.images?.length
              ? product.images
              : product.image_url
                ? [{ id: "cover", image_url: product.image_url, alt_text: product.name }]
                : []
          }
          name={product.name}
          outOfStock={outOfStock}
        />

        <div className="min-w-0">
          <p className="break-words text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-500 sm:text-sm">
            {product.category?.name}
          </p>
          <h1 className="product-name mt-2 text-[1.75rem] leading-snug sm:text-4xl md:text-[2.75rem] lg:text-5xl">
            {product.name}
          </h1>
          <p className={`mt-4 text-lg ${outOfStock ? "text-black/40" : "text-brand-500"}`}>
            {outOfStock ? "Out of stock" : "Inquire for price"}
          </p>
          <p className="mt-6 break-words text-[15px] leading-7 text-black/75 [overflow-wrap:anywhere]">
            {product.description}
          </p>
          <dl className="mt-8 space-y-3 text-sm">
            {product.material && (
              <div className="flex gap-4 border-b border-black/10 py-3">
                <dt className="w-28 shrink-0 text-black/50 sm:w-32">Material</dt>
                <dd className="min-w-0 break-words [overflow-wrap:anywhere]">{product.material}</dd>
              </div>
            )}
            {product.dimensions && (
              <div className="flex gap-4 border-b border-black/10 py-3">
                <dt className="w-28 shrink-0 text-black/50 sm:w-32">Dimensions</dt>
                <dd className="min-w-0 break-words [overflow-wrap:anywhere]">{product.dimensions}</dd>
              </div>
            )}
            {product.shape && (
              <div className="flex gap-4 border-b border-black/10 py-3">
                <dt className="w-28 shrink-0 text-black/50 sm:w-32">Shape</dt>
                <dd className="min-w-0 break-words [overflow-wrap:anywhere]">{product.shape}</dd>
              </div>
            )}
            {product.sku && (
              <div className="flex gap-4 border-b border-black/10 py-3">
                <dt className="w-28 shrink-0 text-black/50 sm:w-32">Stock ID</dt>
                <dd className="min-w-0 break-words [overflow-wrap:anywhere]">{product.sku}</dd>
              </div>
            )}
            <div className="flex gap-4 border-b border-black/10 py-3">
              <dt className="w-28 shrink-0 text-black/50 sm:w-32">Availability</dt>
              <dd className={outOfStock ? "text-black/45" : ""}>
                {outOfStock ? "Out of stock" : `${product.stock} in stock`}
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={() => openQuote(product)} className="btn-dark">
              Request a quote
            </button>
            <button
              type="button"
              disabled={outOfStock}
              onClick={async () => {
                if (outOfStock) return;
                if (!requireLogin("cart")) return;
                await addToBag(product);
                showToast("Added to cart — opening WhatsApp order");
              }}
              className="btn-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              {outOfStock ? "Out of stock" : "Add to cart"}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!requireLogin("wishlist")) return;
                const added = await toggleWishlist(product);
                showToast(added ? "Saved to favorites" : "Removed from favorites");
              }}
              className="btn-light"
            >
              {isWished(product.slug) ? "Saved" : "Save to favorites"}
            </button>
          </div>
        </div>
      </div>

      {product.related_products?.length > 0 && (
        <section className="mt-16 sm:mt-20">
          <h2 className="mb-8 text-center text-xl font-medium tracking-[0.14em] uppercase sm:text-2xl">
            Related pieces
          </h2>
          <ProductGrid products={product.related_products} />
        </section>
      )}
    </div>
  );
}
