import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./AppLayout.css";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((p) => !p);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`layoutShell ${menuOpen ? "layoutMenuOpen" : ""}`}>
      {/* Sidebar */}
      <aside className="layoutSidebar">
        <Sidebar onNavigate={closeMenu} />
      </aside>

      {/* Overlay */}
      <div className="layoutOverlay" onClick={closeMenu} />

      {/* Main */}
      <div className="layoutMain">
        <Header menuOpen={menuOpen} onMenuClick={toggleMenu} />
        <main className="layoutContent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
