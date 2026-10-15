import { useEffect, useState } from "react";
import { adminFetchInquiries, adminUpdateInquiry } from "../../api/inquiries";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [selected, setSelected] = useState(null);

  function load() {
    adminFetchInquiries().then((data) => setInquiries(data.results));
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(inquiry, status) {
    await adminUpdateInquiry(inquiry.id, { status });
    load();
    if (selected?.id === inquiry.id) {
      setSelected({ ...inquiry, status });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-medium">Inquiries</h1>
      <div className="mt-6 overflow-x-auto bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-black/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th>Email</th>
              <th>Product</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b border-black/5">
                <td className="px-4 py-3">{inquiry.name}</td>
                <td>{inquiry.email}</td>
                <td>{inquiry.product?.name || "General"}</td>
                <td>{inquiry.status}</td>
                <td>{new Date(inquiry.created_at).toLocaleDateString()}</td>
                <td className="space-x-3 py-3">
                  <button onClick={() => setSelected(inquiry)} className="text-brand-600">
                    View
                  </button>
                  <button onClick={() => setStatus(inquiry, "CONTACTED")}>Contacted</button>
                  <button onClick={() => setStatus(inquiry, "CLOSED")}>Closed</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white p-6">
            <h2 className="text-xl font-medium">{selected.name}</h2>
            <p className="mt-1 text-sm text-black/50">{selected.email}</p>
            <p className="mt-2 text-sm">{selected.product?.name || "General inquiry"}</p>
            <p className="mt-4 text-sm leading-6">{selected.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
