import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  adminDeleteProduct,
  adminFetchCategory,
  adminFetchProducts,
  adminUpdateProduct,
} from "../../api/catalog";
import { getErrorMessage, unwrapList } from "../../api/client";
import AdminBulkBar from "../../components/admin/AdminBulkBar.jsx";
import RoundLoader from "../../components/ui/RoundLoader.jsx";
import { isOutOfStock, stockCount } from "../../utils/stock.js";

export default function AdminCategoryProductsPage() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const dirtyStock = useRef(new Set());
  const totalStock = products.reduce((sum, item) => sum + stockCount(item), 0);
  const allSelected = products.length > 0 && selected.size === products.length;
  const someSelected = selected.size > 0 && !allSelected;

  function load() {
    setLoading(true);
    setError("");
    Promise.all([
      adminFetchCategory(categoryId),
      adminFetchProducts({ category: categoryId, search }),
    ])
      .then(([cat, data]) => {
        setCategory(cat);
        setProducts(unwrapList(data));
        setSelected(new Set());
      })
      .catch((err) => setError(getErrorMessage(err, "Could not load products.")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [categoryId, search]);

  async function toggle(product, field) {
    const payload = new FormData();
    payload.append(field, product[field] ? "false" : "true");
    await adminUpdateProduct(product.id, payload);
    load();
  }

  async function saveStock(product, nextStock) {
    const stock = Math.max(0, Number(nextStock) || 0);
    dirtyStock.current.delete(product.id);
    const payload = new FormData();
    payload.append("stock", String(stock));
    await adminUpdateProduct(product.id, payload);
    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, stock, in_stock: stock > 0 } : item
      )
    );
  }

  async function markSold(product) {
    if (stockCount(product) <= 0) return;
    dirtyStock.current.delete(product.id);
    await saveStock(product, stockCount(product) - 1);
  }

  async function removeProduct(product) {
    if (!window.confirm(`Remove “${product.name}” from ${category?.name || "this category"}?`)) {
      return;
    }
    await adminDeleteProduct(product.id);
    load();
  }

  function toggleOne(id) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(products.map((item) => item.id)));
  }

  function selectedItems() {
    return products.filter((item) => selected.has(item.id));
  }

  async function deactivateSelected() {
    const items = selectedItems();
    if (!items.length) return;
    setBulkBusy(true);
    setError("");
    try {
      await Promise.all(
        items.map((item) => {
          const payload = new FormData();
          payload.append("is_active", "false");
          return adminUpdateProduct(item.id, payload);
        })
      );
      setSelected(new Set());
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not deactivate the selected products."));
    } finally {
      setBulkBusy(false);
    }
  }

  async function removeSelected() {
    const items = selectedItems();
    if (!items.length) return;
    const label = items.length === 1 ? `“${items[0].name}”` : `${items.length} products`;
    if (!window.confirm(`Remove ${label} from ${category?.name || "this category"}?`)) {
      return;
    }
    setBulkBusy(true);
    setError("");
    try {
      await Promise.all(items.map((item) => adminDeleteProduct(item.id)));
      setSelected(new Set());
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not remove the selected products."));
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-black/50">
        <Link to="/admin/products" className="hover:text-ink">
          Products
        </Link>
        {" / "}
        {category?.name || "Category"}
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium">{category?.name || "Category"} products</h1>
          <p className="mt-1 text-sm text-black/55">
            {products.length} products · {totalStock} in stock. When a rug sells, tap Sold or change the stock number.
          </p>
        </div>
        <Link to={`/admin/categories/${categoryId}/products/new`} className="btn-dark w-full sm:w-auto">
          + Add product
        </Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products in this category"
        className="field-input mt-6 w-full max-w-sm"
      />
      {error && <p className="mt-4 text-sm text-brand-600">{error}</p>}
      <AdminBulkBar
        count={selected.size}
        busy={bulkBusy}
        onDeactivate={deactivateSelected}
        onRemove={removeSelected}
      />

      <div className="mt-6 overflow-x-auto bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-black/50">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all products"
                />
              </th>
              <th className="px-4 py-3">Product</th>
              <th>Size</th>
              <th>Stock ID</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="py-16">
                  <RoundLoader />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-black/50">
                  No products in this category yet. Add the first rug.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const out = isOutOfStock(product);
                return (
                  <tr
                    key={product.id}
                    className={`border-b border-black/5 ${
                      selected.has(product.id) ? "bg-brand-500/5" : out ? "bg-black/[0.03] text-black/45" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => toggleOne(product.id)}
                        aria-label={`Select ${product.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt=""
                            className={`h-12 w-9 object-cover ${out ? "grayscale" : ""}`}
                          />
                        )}
                        <div>
                          <p className="font-medium text-ink">{product.name}</p>
                          {out ? (
                            <p className="text-xs font-medium uppercase tracking-wide text-black/45">
                              Out of stock
                            </p>
                          ) : product.is_featured ? (
                            <p className="text-xs text-brand-600">Featured</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td>{product.dimensions || "—"}</td>
                    <td>{product.sku || "—"}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stockCount(product)}
                          onChange={(event) => {
                            dirtyStock.current.add(product.id);
                            setProducts((current) =>
                              current.map((item) =>
                                item.id === product.id
                                  ? { ...item, stock: event.target.value }
                                  : item
                              )
                            );
                          }}
                          onBlur={(event) => {
                            if (!dirtyStock.current.has(product.id)) return;
                            saveStock(product, event.target.value);
                          }}
                          className="w-16 border border-black/15 bg-white px-2 py-1 text-ink"
                        />
                        <button
                          type="button"
                          disabled={out}
                          onClick={() => markSold(product)}
                          className="text-xs font-medium uppercase tracking-wide text-brand-600 disabled:text-black/30"
                        >
                          Sold
                        </button>
                      </div>
                    </td>
                    <td>
                      {product.show_price
                        ? `$${Number(product.price).toFixed(2)}`
                        : "Inquire"}
                    </td>
                    <td>{out ? "Out of stock" : product.is_active ? "Active" : "Inactive"}</td>
                    <td className="space-x-3 py-3">
                      <Link
                        to={`/admin/categories/${categoryId}/products/${product.id}/edit`}
                        className="text-brand-600"
                      >
                        Edit
                      </Link>
                      <button onClick={() => toggle(product, "is_active")}>
                        {product.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => removeProduct(product)} className="text-brand-600">
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
