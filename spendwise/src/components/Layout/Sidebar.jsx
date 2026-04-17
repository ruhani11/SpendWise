import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function navClass({ isActive }) {
  return `sideLink ${isActive ? "sideLinkActive" : ""}`;
}

export default function Sidebar({ onNavigate }) {
  return (
    <div className="sideInner">
      <div className="sideBrand">Shopping</div>

      <nav className="sideNav">
        <NavLink to="/products" className={navClass} onClick={onNavigate}>
          Products
        </NavLink>
        <NavLink to="/lists" className={navClass} onClick={onNavigate}>
          Lists
        </NavLink>
        <NavLink to="/categories" className={navClass} onClick={onNavigate}>
          Categories
        </NavLink>
        <NavLink to="/units" className={navClass} onClick={onNavigate}>
          Units of Measure
        </NavLink>
      </nav>
    </div>
  );
}
