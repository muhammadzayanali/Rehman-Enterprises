import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CollectionsPage from "./pages/CollectionsPage.jsx";
import CategoryProductsPage from "./pages/CategoryProductsPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import PolicyPage from "./pages/PolicyPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage.jsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";
import AdminCategoryProductsPage from "./pages/admin/AdminCategoryProductsPage.jsx";
import AdminProductFormPage from "./pages/admin/AdminProductFormPage.jsx";
import AdminInquiriesPage from "./pages/admin/AdminInquiriesPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Navigate to="/login" replace state={{ from: "/admin" }} />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="categories/:categoryId/products" element={<AdminCategoryProductsPage />} />
        <Route path="categories/:categoryId/products/new" element={<AdminProductFormPage />} />
        <Route path="categories/:categoryId/products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="inquiries" element={<AdminInquiriesPage />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/pages/about-us" element={<AboutPage />} />
        <Route path="/pages/contact" element={<ContactPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:slug" element={<CategoryProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/pages/:slug" element={<PolicyPage />} />
      </Route>
    </Routes>
  );
}
