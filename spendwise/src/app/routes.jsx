import { Navigate, Route, Routes } from "react-router-dom";
import ProductsPage from "../pages/Products/ProductsPage.jsx";
import ListsPage from "../pages/Lists/ListsPage.jsx";
import CategoriesPage from "../pages/Categories/CategoriesPage.jsx";
import UnitsPage from "../pages/Units/UnitsPage.jsx";

// 🔐 IMPORT AUTH PAGES
import Login from "../pages/Auth/Login.jsx";
import Signup from "../pages/Auth/Signup.jsx";

export default function AppRoutes() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* 🔐 AUTH ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 🛡️ PROTECTED ROUTES */}
      <Route
        path="/"
        element={token ? <Navigate to="/products" /> : <Navigate to="/login" />}
      />

      <Route
        path="/products"
        element={token ? <ProductsPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/lists"
        element={token ? <ListsPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/categories"
        element={token ? <CategoriesPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/units"
        element={token ? <UnitsPage /> : <Navigate to="/login" />}
      />

      {/* ❌ FALLBACK */}
      <Route
        path="*"
        element={<div style={{ color: "white" }}>Page not found</div>}
      />
    </Routes>
  );
}