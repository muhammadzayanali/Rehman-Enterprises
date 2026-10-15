import { useEffect, useMemo, useState } from "react";
import { fetchCategories } from "../api/catalog";
import CategoryCard from "../components/categories/CategoryCard.jsx";
import RoundLoader from "../components/ui/RoundLoader.jsx";

export default function CollectionsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const groups = {
      "Area Rugs": [],
      "Runners & Shapes": [],
      "Curated Lines": [],
    };
    categories.forEach((category) => {
      if (groups[category.group]) groups[category.group].push(category);
      else groups["Area Rugs"].push(category);
    });
    return groups;
  }, [categories]);

  return (
    <div>
      <section className="relative h-[220px] overflow-hidden sm:h-[280px]">
        <img src="/expert_of_unique_img.webp" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-white">
          <h1 className="text-3xl font-medium sm:text-4xl">Collections</h1>
          <p className="mt-3 text-sm text-white/80">Home / Collections</p>
        </div>
      </section>

      <section className="container-wide py-10 sm:py-16">
        {loading && <RoundLoader className="py-16" />}
        {Object.entries(grouped).map(([group, items]) =>
          items.length ? (
            <div key={group} className="mb-16">
              <div className="mb-8">
                <h2 className="text-2xl font-medium tracking-wide">{group}</h2>
                <span className="mt-3 block h-[2px] w-10 bg-brand-500" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                {items.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          ) : null
        )}
      </section>
    </div>
  );
}
