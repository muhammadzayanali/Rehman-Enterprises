import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useUi } from "../../context/UiContext.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import { searchCatalog } from "../../api/catalog";
import RoundLoader from "../ui/RoundLoader.jsx";

export default function SearchModal() {
  const { searchOpen, setSearchOpen } = useUi();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ categories: [], products: [] });
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 350);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchOpen) return undefined;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (!searchOpen || !debounced.trim()) {
      setResults({ categories: [], products: [] });
      return;
    }
    setLoading(true);
    searchCatalog(debounced)
      .then(setResults)
      .catch(() => setResults({ categories: [], products: [] }))
      .finally(() => setLoading(false));
  }, [debounced, searchOpen]);

  if (!searchOpen) return null;

  function onSubmit(event) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    navigate(`/collections/all?search=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="fixed inset-0 z-[210] overflow-y-auto bg-white">
      <button
        type="button"
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center sm:right-6 sm:top-6"
        onClick={() => setSearchOpen(false)}
        aria-label="Close search"
      >
        <X size={26} />
      </button>
      <div className="mx-auto mt-20 max-w-3xl px-5 pb-16 sm:mt-24 sm:px-6">
        <h2 className="text-center text-2xl font-medium tracking-tight sm:text-3xl">
          Start typing and hit Enter
        </h2>
        <form onSubmit={onSubmit} className="mt-8 flex items-center border-b border-black/20 sm:mt-10">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rugs, collections, materials"
            className="w-full bg-transparent py-3 text-sm outline-none"
          />
          <button type="submit" aria-label="Search" className="flex h-11 w-11 items-center justify-center">
            <Search size={18} />
          </button>
        </form>
        <div className="mt-8 space-y-6">
          {loading && <RoundLoader size="sm" className="py-6" />}
          {!loading &&
            debounced &&
            results.categories.length === 0 &&
            results.products.length === 0 && (
              <p className="text-sm text-black/50">
                No matching rugs or collections yet. Try another name or material.
              </p>
            )}
          {results.categories.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                Collections
              </p>
              {results.categories.map((category) => (
                <Link
                  key={`cat-${category.id}`}
                  to={`/collections/${category.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex min-h-16 items-center gap-4 rounded-lg p-2 hover:bg-mist"
                >
                  <img
                    src={category.image_url || category.product?.image_url}
                    alt={category.name}
                    className="h-16 w-12 object-cover"
                  />
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-black/50">
                      Collection
                      {category.product_count
                        ? ` · ${category.product_count} rugs`
                        : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {results.products.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                Rugs
              </p>
              {results.products.map((product) => (
                <Link
                  key={`p-${product.id}`}
                  to={`/products/${product.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex min-h-16 items-center gap-4 rounded-lg p-2 hover:bg-mist"
                >
                  <img src={product.image_url} alt={product.name} className="h-16 w-12 object-cover" />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-black/50">{product.category?.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
