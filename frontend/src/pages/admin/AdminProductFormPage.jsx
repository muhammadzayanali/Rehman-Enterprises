import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  adminCreateProduct,
  adminDeleteProductImage,
  adminFetchCategories,
  adminFetchProduct,
  adminReorderImages,
  adminUpdateProduct,
} from "../../api/catalog";
import { getErrorMessage, unwrapList } from "../../api/client";

const empty = {
  name: "",
  category_id: "",
  description: "",
  price: "0",
  show_price: false,
  material: "",
  dimensions: "",
  shape: "",
  sku: "",
  stock: "1",
  is_featured: false,
  is_active: true,
};

export default function AdminProductFormPage() {
  const { id, categoryId } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const listPath = categoryId ? `/admin/categories/${categoryId}/products` : "/admin/products";
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminFetchCategories().then((data) => {
      const list = unwrapList(data);
      setCategories(list);
      if (!isEdit && categoryId) {
        setForm((current) => ({ ...current, category_id: categoryId }));
      }
    });
  }, [categoryId, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    adminFetchProduct(id).then((product) => {
      setForm({
        name: product.name,
        category_id: product.category?.id || "",
        description: product.description || "",
        price: product.price,
        show_price: product.show_price,
        material: product.material || "",
        dimensions: product.dimensions || "",
        shape: product.shape || "",
        sku: product.sku || "",
        stock: String(product.stock ?? 1),
        is_featured: product.is_featured,
        is_active: product.is_active,
      });
      setExistingImages(product.images || []);
    });
  }, [id, isEdit]);

  function addFiles(fileList) {
    const files = Array.from(fileList || []).map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      sort: newFiles.length + index,
    }));
    setNewFiles((current) => [...current, ...files]);
  }

  async function removeExisting(imageId) {
    if (!window.confirm("Remove this image?")) return;
    await adminDeleteProductImage(imageId);
    setExistingImages((current) => current.filter((image) => image.id !== imageId));
  }

  async function moveExisting(index, direction) {
    const next = [...existingImages];
    const swap = index + direction;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setExistingImages(next);
    if (isEdit) {
      await adminReorderImages(
        id,
        next.map((image) => image.id)
      );
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name.trim() || !form.category_id) {
      setError("Name and category are required.");
      return;
    }
    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("category_id", form.category_id);
    payload.append("description", form.description);
    payload.append("price", form.price || "0");
    payload.append("show_price", form.show_price ? "true" : "false");
    payload.append("material", form.material);
    payload.append("dimensions", form.dimensions);
    payload.append("shape", form.shape);
    payload.append("sku", form.sku);
    payload.append("stock", String(Math.max(0, Number(form.stock) || 0)));
    payload.append("is_featured", form.is_featured ? "true" : "false");
    payload.append("is_active", form.is_active ? "true" : "false");
    newFiles.forEach((item) => payload.append("images", item.file));

    setLoading(true);
    try {
      if (isEdit) await adminUpdateProduct(id, payload);
      else await adminCreateProduct(payload);
      setSuccess("Product saved.");
      navigate(listPath);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save product."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-4">
      <p className="text-sm text-black/50">
        <Link to={listPath} className="hover:text-ink">
          Back to products
        </Link>
      </p>
      <h1 className="text-2xl font-medium">{isEdit ? "Edit product" : "Add product"}</h1>
      <label className="block text-sm">
        Product Name
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-2 w-full border bg-white px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Category
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          disabled={Boolean(categoryId)}
          className="mt-2 w-full border bg-white px-3 py-2 disabled:bg-mist"
        >
          <option value="">Select a collection</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Description
        <textarea
          rows="5"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-2 w-full border bg-white px-3 py-2"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Price
          <input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="mt-2 w-full border bg-white px-3 py-2"
          />
        </label>
        <label className="mt-8 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.show_price}
            onChange={(e) => setForm({ ...form, show_price: e.target.checked })}
          />
          Show price
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm">
          Material
          <input
            value={form.material}
            onChange={(e) => setForm({ ...form, material: e.target.value })}
            className="mt-2 w-full border bg-white px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Dimensions
          <input
            value={form.dimensions}
            onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
            className="mt-2 w-full border bg-white px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Shape
          <input
            value={form.shape}
            onChange={(e) => setForm({ ...form, shape: e.target.value })}
            className="mt-2 w-full border bg-white px-3 py-2"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Stock ID
          <input
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="mt-2 w-full border bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Stock quantity
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="mt-2 w-full border bg-white px-3 py-2"
          />
          <span className="mt-1 block text-xs text-black/45">
            When a rug sells, reduce this number. At 0 the shop shows it gray with Out of stock.
          </span>
        </label>
      </div>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
          />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Active
        </label>
      </div>

      <div>
        <p className="text-sm font-medium">Images</p>
        <p className="mb-3 text-xs text-black/50">
          Upload several photos. For now, products can reuse the collection image.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {existingImages.map((image, index) => (
            <div key={image.id} className="border bg-white p-2">
              <img src={image.image_url} alt="" className="h-32 w-full object-cover" />
              <div className="mt-2 flex justify-between text-xs">
                <button type="button" onClick={() => moveExisting(index, -1)}>
                  Up
                </button>
                <button type="button" onClick={() => moveExisting(index, 1)}>
                  Down
                </button>
                <button type="button" onClick={() => removeExisting(image.id)} className="text-brand-600">
                  Remove
                </button>
              </div>
            </div>
          ))}
          {newFiles.map((item, index) => (
            <div key={item.preview} className="border bg-white p-2">
              <img src={item.preview} alt="" className="h-32 w-full object-cover" />
              <button
                type="button"
                className="mt-2 text-xs text-brand-600"
                onClick={() => setNewFiles((current) => current.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          className="mt-4"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-sm text-brand-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}
      <button disabled={loading} className="bg-ink px-6 py-3 text-sm text-white">
        {loading ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
