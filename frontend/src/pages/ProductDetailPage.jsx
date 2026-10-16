import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProduct } from "../api/catalog";
import ProductGrid from "../components/products/ProductGrid.jsx";
import RoundLoader from "../components/ui/RoundLoader.jsx";
import SmartImage from "../components/ui/SmartImage.jsx";
import { useUi } from "../context/UiContext.jsx";
import { useLoginGate } from "../hooks/useLoginGate.js";
import { isOutOfStock } from "../utils/stock.js";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
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
        setActiveImage(data.images?.[0]?.image_url || data.image_url);
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
      <p className="text-xs text-black/50 sm:text-sm">
        <Link to="/">Home</Link> /{" "}
        <Link to={`/collections/${product.category?.slug}`}>{product.category?.name}</Link> /{" "}
        {product.name}
      </p>

      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className={`relative bg-mist ${outOfStock ? "grayscale" : ""}`}>
            <SmartImage
              key={activeImage}
              src={activeImage}
              alt={product.name}
              eager
              aspectClass="aspect-[3/4]"
              className={`h-full w-full object-cover ${outOfStock ? "opacity-60" : ""}`}
            />
            {outOfStock && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/55 py-2 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-white">
                Out of stock
              </span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:gap-3">
              {product.images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(image.image_url)}
                  className={`border ${activeImage === image.image_url ? "border-ink" : "border-transparent"}`}
                >
                  <img src={image.image_url} alt={image.alt_text || product.name} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-500 sm:text-sm">
            {product.category?.name}
          </p>
          <h1 className="product-name mt-2 text-[1.75rem] leading-snug sm:text-4xl md:text-[2.75rem] lg:text-5xl">
            {product.name}
          </h1>
          <p className={`mt-4 text-lg ${outOfStock ? "text-black/40" : "text-brand-500"}`}>
            {outOfStock ? "Out of stock" : "Inquire for price"}
          </p>
          <p className="mt-6 text-[15px] leading-7 text-black/75">{product.description}</p>
          <dl className="mt-8 space-y-3 text-sm">
            {product.material && (
              <div className="flex gap-4 border-b border-black/10 py-3">
                <dt className="w-28 shrink-0 text-black/50 sm:w-32">Material</dt>
                <dd>{product.material}</dd>
              </div>
            )}
            {product.dimensions && (
              <div className="flex gap-4 border-b border-black/10 py-3">
                <dt className="w-28 shrink-0 text-black/50 sm:w-32">Dimensions</dt>
                <dd>{product.dimensions}</dd>
              </div>
            )}
            {product.shape && (
              <div className="flex gap-4 border-b border-black/10 py-3">
                <dt className="w-28 shrink-0 text-black/50 sm:w-32">Shape</dt>
                <dd>{product.shape}</dd>
              </div>
            )}
            {product.sku && (
              <div className="flex gap-4 border-b border-black/10 py-3">
                <dt className="w-28 shrink-0 text-black/50 sm:w-32">Stock ID</dt>
                <dd>{product.sku}</dd>
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
