import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Layers, LogOut, Menu, MessageSquare, Package, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/categories", label: "Categories", icon: Layers },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
];

function NavItems({ onClick }) {
  return (
    <>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onClick}
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm ${
              isActive ? "bg-brand-50 text-brand-700" : "hover:bg-mist"
            }`
          }
        >
          <link.icon size={16} />
          {link.label}
        </NavLink>
      ))}
    </>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function onLogout() {
    await logout();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f1ee] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-black/10 bg-white md:flex md:flex-col">
        <div className="border-b border-black/10 px-6 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-500">Rehman Enterprises</p>
          <p className="mt-1 text-lg font-semibold">Admin</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <NavItems />
        </nav>
        <button
          type="button"
          onClick={onLogout}
          className="m-4 flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-mist"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col bg-white">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <p className="font-semibold">Admin</p>
              <button type="button" className="flex h-11 w-11 items-center justify-center" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              <NavItems onClick={() => setOpen(false)} />
            </nav>
            <button type="button" onClick={onLogout} className="m-4 flex min-h-11 items-center gap-3 text-sm">
              <LogOut size={16} /> Logout
            </button>
          </aside>
        </div>
      )}

      <div className="md:pl-64">
        <header className="flex items-center justify-between gap-3 border-b border-black/10 bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open admin menu"
            >
              <Menu size={20} />
            </button>
            <p className="truncate text-sm text-black/60">{user?.email}</p>
          </div>
          <a href="/" className="shrink-0 text-sm text-brand-600">
            View website
          </a>
        </header>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
