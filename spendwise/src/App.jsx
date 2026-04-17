import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";

import ProductsPage from "./pages/Products/ProductsPage";
import ListsPage from "./pages/Lists/ListsPage";
import CategoriesPage from "./pages/Categories/CategoriesPage";
import UnitsPage from "./pages/Units/UnitsPage";

// 🔐 ADD THESE
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* 🔐 Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 🛡️ Protected Routes */}
      <Route element={token ? <AppLayout /> : <Navigate to="/login" />}>
        <Route
          path="/"
          element={<Navigate to="/products" />}
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/units" element={<UnitsPage />} />
      </Route>
    </Routes>
  );
}