import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminFetchCategories,
  adminUpdateCategory,
} from "../../api/catalog";
import { getErrorMessage, unwrapList } from "../../api/client";
import AdminBulkBar from "../../components/admin/AdminBulkBar.jsx";

const emptyForm = {
  name: "",
  description: "",
  group: "Area Rugs",
  sort_order: 0,
  is_active: true,
  image: null,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  function load() {
    adminFetchCategories({ search: query })
      .then((data) => setCategories(unwrapList(data)))
      .catch(() => setCategories([]));
  }

  useEffect(() => {
    load();
    setSelected(new Set());
  }, [query]);

  const allSelected = categories.length > 0 && selected.size === categories.length;
  const someSelected = selected.size > 0 && !allSelected;

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
    else setSelected(new Set(categories.map((item) => item.id)));
  }

  function selectedItems() {
    return categories.filter((item) => selected.has(item.id));
  }

  function openCreate() {
    setEditing("new");
    setForm(emptyForm);
    setPreview("");
    setError("");
  }

  function openEdit(category) {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || "",
      group: category.group || "Area Rugs",
      sort_order: category.sort_order || 0,
      is_active: category.is_active,
      image: null,
    });
    setPreview(category.image_url || "");
    setError("");
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("description", form.description);
    payload.append("group", form.group);
    payload.append("sort_order", String(form.sort_order || 0));
    payload.append("is_active", form.is_active ? "true" : "false");
    if (form.image) payload.append("image", form.image);

    setLoading(true);
    try {
      if (editing === "new") await adminCreateCategory(payload);
      else await adminUpdateCategory(editing.id, payload);
      setEditing(null);
      setSuccess("Category saved.");
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save category."));
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(category) {
    const payload = new FormData();
    payload.append("is_active", category.is_active ? "false" : "true");
    await adminUpdateCategory(category.id, payload);
    load();
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
          return adminUpdateCategory(item.id, payload);
        })
      );
      setSelected(new Set());
      setSuccess(`${items.length} ${items.length === 1 ? "category" : "categories"} deactivated.`);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not deactivate the selected categories."));
    } finally {
      setBulkBusy(false);
    }
  }

  async function removeSelected() {
    const items = selectedItems();
    if (!items.length) return;
    const label = items.length === 1 ? items[0].name : `${items.length} categories`;
    if (
      !window.confirm(
        `Remove ${label}? Products inside ${items.length === 1 ? "this category" : "these categories"} will also be removed.`
      )
    ) {
      return;
    }
    setBulkBusy(true);
    setError("");
    try {
      await Promise.all(items.map((item) => adminDeleteCategory(item.id)));
      setSelected(new Set());
      setSuccess(`${items.length} ${items.length === 1 ? "category" : "categories"} removed.`);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not remove the selected categories."));
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-medium">Categories</h1>
        <button onClick={openCreate} className="btn-dark w-full sm:w-auto">
          + Add Category
        </button>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search categories"
        className="field-input mt-6 w-full max-w-sm"
      />
      {success && <p className="mt-4 text-sm text-green-700">{success}</p>}
      {error && !editing && <p className="mt-4 text-sm text-brand-600">{error}</p>}
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
                  aria-label="Select all categories"
                />
              </th>
              <th className="px-4 py-3">Category</th>
              <th>Products</th>
              <th>In stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className={`border-b border-black/5 ${
                  selected.has(category.id)
                    ? "bg-brand-500/5"
                    : (category.stock_count ?? 0) <= 0 && (category.product_count ?? 0) > 0
                      ? "bg-black/[0.03] text-black/45"
                      : ""
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(category.id)}
                    onChange={() => toggleOne(category.id)}
                    aria-label={`Select ${category.name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {category.image_url && (
                      <img src={category.image_url} alt="" className="h-12 w-9 object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-ink">{category.name}</p>
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
                <td className="space-x-3 py-3">
                  <Link to={`/admin/categories/${category.id}/products`} className="font-medium text-brand-600">
                    Open
                  </Link>
                  <button onClick={() => openEdit(category)} className="text-brand-600">
                    Edit
                  </button>
                  <button onClick={() => toggleActive(category)}>
                    {category.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={onSubmit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6">
            <h2 className="text-xl font-medium">
              {editing === "new" ? "Add category" : "Edit category"}
            </h2>
            <label className="mt-4 block text-sm">
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 w-full border px-3 py-2"
              />
            </label>
            <label className="mt-4 block text-sm">
              Group
              <select
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value })}
                className="mt-2 w-full border px-3 py-2"
              >
                <option>Area Rugs</option>
                <option>Runners & Shapes</option>
                <option>Curated Lines</option>
              </select>
            </label>
            <label className="mt-4 block text-sm">
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-2 w-full border px-3 py-2"
                rows="3"
              />
            </label>
            <label className="mt-4 block text-sm">
              Sort order
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className="mt-2 w-full border px-3 py-2"
              />
            </label>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
            <label className="mt-4 block text-sm">
              Image
              <input
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setForm({ ...form, image: file });
                  setPreview(file ? URL.createObjectURL(file) : preview);
                }}
              />
            </label>
            {preview && <img src={preview} alt="" className="mt-3 h-32 object-cover" />}
            {error && <p className="mt-3 text-sm text-brand-600">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button disabled={loading} className="bg-ink px-4 py-2 text-white">
                {loading ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
