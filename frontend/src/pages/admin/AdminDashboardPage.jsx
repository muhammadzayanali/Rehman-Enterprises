import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetchCategories, adminFetchProducts } from "../../api/catalog";
import { adminFetchInquiries } from "../../api/inquiries";
import { unwrapList } from "../../api/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ categories: 0, products: 0, inquiries: 0 });

  useEffect(() => {
    Promise.all([
      adminFetchCategories(),
      adminFetchProducts(),
      adminFetchInquiries(),
    ]).then(([categories, products, inquiries]) => {
      setStats({
        categories: unwrapList(categories).length || categories.count || 0,
        products: unwrapList(products).length || products.count || 0,
        inquiries: inquiries.count || 0,
      });
    });
  }, []);

  const cards = [
    { label: "Categories", value: stats.categories, to: "/admin/categories" },
    { label: "Products", value: stats.products, to: "/admin/products" },
    { label: "Inquiries", value: stats.inquiries, to: "/admin/inquiries" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-medium">Dashboard</h1>
      <p className="mt-2 text-sm text-black/60">Manage the Heritage Home Decore catalog.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="rounded-lg bg-white p-6 shadow-soft">
            <p className="text-sm text-black/50">{card.label}</p>
            <p className="mt-2 text-3xl font-medium">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
