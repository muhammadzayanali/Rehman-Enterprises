import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetchCategories } from "../../api/catalog";
import { unwrapList } from "../../api/client";
import RoundLoader from "../../components/ui/RoundLoader.jsx";

export default function AdminProductsPage() {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminFetchCategories({ search: query })
      .then((data) => setCategories(unwrapList(data)))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Products</h1>
          <p className="mt-1 text-sm text-black/55">
            Open a category to add, edit, or remove its rugs, and update stock when a piece sells.
          </p>
        </div>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search categories"
        className="field-input mt-6 w-full max-w-sm"
      />

      <div className="mt-6 overflow-x-auto bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-black/50">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th>Products</th>
              <th>In stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-16">
                  <RoundLoader />
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-10 text-center text-black/50">
                  No categories yet.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className={`border-b border-black/5 ${
                    (category.stock_count ?? 0) <= 0 && (category.product_count ?? 0) > 0
                      ? "bg-black/[0.03] text-black/45"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {category.image_url && (
                        <img src={category.image_url} alt="" className="h-12 w-9 object-cover" />
                      )}
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-black/45">{category.group}</p>
                      </div>
                    </div>
                  </td>
                  <td>{category.product_count ?? 0}</td>
                  <td>{category.stock_count ?? 0}</td>
                  <td>
                    {(category.stock_count ?? 0) <= 0 && (category.product_count ?? 0) > 0
                      ? "Out of stock"
                      : category.is_active
                        ? "Active"
                        : "Inactive"}
                  </td>
                  <td className="py-3">
                    <Link
                      to={`/admin/categories/${category.id}/products`}
                      className="font-medium text-brand-600"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
