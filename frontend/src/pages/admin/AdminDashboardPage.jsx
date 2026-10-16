import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetchCategories, adminFetchProducts } from "../../api/catalog";
import { unwrapList } from "../../api/client";
import RoundLoader from "../../components/ui/RoundLoader.jsx";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ categories: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([adminFetchCategories(), adminFetchProducts()])
      .then(([categories, products]) => {
        if (cancelled) return;
        setStats({
          categories: unwrapList(categories).length || categories.count || 0,
          products: unwrapList(products).length || products.count || 0,
        });
      })
      .catch(() => {
        if (!cancelled) setStats({ categories: 0, products: 0 });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: "Categories", value: stats.categories, to: "/admin/categories" },
    { label: "Products", value: stats.products, to: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-medium">Dashboard</h1>
      <p className="mt-2 text-sm text-black/60">Manage the Heritage Home Decore catalog.</p>

      {loading ? (
        <div className="mt-16">
          <RoundLoader className="py-6" />
          <p className="mt-3 text-center text-sm text-black/55">
            Loading your resources. The server may take a moment to wake up.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Link key={card.label} to={card.to} className="rounded-lg bg-white p-6 shadow-soft">
              <p className="text-sm text-black/50">{card.label}</p>
              <p className="mt-2 text-3xl font-medium">{card.value}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
