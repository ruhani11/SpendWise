import { Navigate, Route, Routes } from "react-router-dom";
import ProductsPage from "../pages/Products/ProductsPage.jsx";
import ListsPage from "../pages/Lists/ListsPage.jsx";
import CategoriesPage from "../pages/Categories/CategoriesPage.jsx";
import UnitsPage from "../pages/Units/UnitsPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />

      <Route path="/products" element={<ProductsPage />} />
      <Route path="/lists" element={<ListsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/units" element={<UnitsPage />} />

      <Route path="*" element={<div style={{ color: "white" }}>Page not found</div>} />
    </Routes>
  );
}
