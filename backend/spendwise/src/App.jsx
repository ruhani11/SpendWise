import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";

import ProductsPage from "./pages/Products/ProductsPage";
import ListsPage from "./pages/Lists/ListsPage";
import CategoriesPage from "./pages/Categories/CategoriesPage";
import UnitsPage from "./pages/Units/UnitsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/products" />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/units" element={<UnitsPage />} />
      </Route>
    </Routes>
  );
}