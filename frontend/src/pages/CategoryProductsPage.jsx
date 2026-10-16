import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { fetchCategories, fetchCategory, fetchProducts, searchCatalog } from "../api/catalog";
import CategoryCard from "../components/categories/CategoryCard.jsx";
import ProductGrid from "../components/products/ProductGrid.jsx";
import RoundLoader from "../components/ui/RoundLoader.jsx";
import SmartImage from "../components/ui/SmartImage.jsx";

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [matchedCollections, setMatchedCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const isAll = !slug || slug === "all";
    const load = isAll
      ? Promise.resolve().then(async () => {
          setCategory(null);
          if (search) {
            const data = await searchCatalog(search, { productLimit: 48 });
            setMatchedCollections(data.categories);
            return { results: data.products };
          }
          setMatchedCollections([]);
          return fetchProducts({});
        })
      : fetchCategory(slug).then((data) => {
          setCategory(data);
          setMatchedCollections([]);
          return fetchProducts({ category: slug });
        });

    load
      .then((data) => setProducts(data.results))
      .catch(() => {
        setCategory(null);
        setProducts([]);
        setMatchedCollections([]);
      })
      .finally(() => setLoading(false));
  }, [slug, search]);

  return (
    <div>
      <section className="relative h-[200px] overflow-hidden sm:h-[240px] md:h-[300px]">
        <SmartImage
          src={category?.image_url || "/expert_of_unique_img.webp"}
          alt=""
          eager
          aspectClass="h-full"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-white">
          <h1 className="product-name text-[1.75rem] leading-snug text-white sm:text-4xl md:text-5xl">
            {category?.name || (search ? "Search" : "Shop")}
          </h1>
          <p className="mt-3 text-sm text-white/80">
            Home / {category?.name || "Collections"}
          </p>
        </div>
      </section>

      <section className="container-wide py-8 sm:py-10">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={`inline-flex min-h-11 items-center gap-2 border px-4 py-2 text-sm ${
              filtersOpen ? "border-brand-500 bg-brand-500 text-white" : "border-black/15"
            }`}
          >
            <SlidersHorizontal size={16} /> Filter
          </button>
          <p className="text-sm text-black/55">
            {search
              ? `${matchedCollections.length} collections · ${products.length} products`
              : `${products.length} products · Default sorting`}
          </p>
        </div>

        {filtersOpen && (
          <div className="mb-10 grid gap-8 border border-black/10 p-4 sm:p-6 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em]">Categories</h3>
              <span className="mt-2 mb-4 block h-[2px] w-10 bg-brand-500" />
              <ul className="space-y-2 text-sm">
                {categories.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/collections/${item.slug}`}
                      className={item.slug === slug ? "text-brand-500" : "text-black/70"}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em]">Collection note</h3>
              <span className="mt-2 mb-4 block h-[2px] w-10 bg-brand-500" />
              <p className="max-w-md text-sm leading-6 text-black/65">
                {category?.description ||
                  "Each piece is woven in our own facilities. Sizes and colorways can be commissioned."}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <RoundLoader className="py-16" />
        ) : (
          <>
            {search && matchedCollections.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-6 text-xl font-medium tracking-wide">Collections</h2>
                <div className="grid gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                  {matchedCollections.map((item) => (
                    <CategoryCard key={item.id} category={item} />
                  ))}
                </div>
              </div>
            )}
            {search && products.length > 0 && (
              <h2 className="mb-6 text-xl font-medium tracking-wide">Rugs</h2>
            )}
            {(!search || products.length > 0) && <ProductGrid products={products} />}
            {search && products.length === 0 && matchedCollections.length === 0 && (
              <p className="py-16 text-center text-black/50">
                No matching rugs or collections yet.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
