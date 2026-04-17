import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAppStore from "../../store/useAppStore";

export default function Header({ menuOpen, onMenuClick }) {
  const { lists, activeListId } = useAppStore();
  const navigate = useNavigate();

  const activeName = useMemo(() => {
    return lists?.find((l) => l.id === activeListId)?.name || "None";
  }, [lists, activeListId]);

  // 🔥 LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="layoutHeader">
      <button
        className="layoutMenuBtn"
        type="button"
        onClick={onMenuClick}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className="layoutHeaderTitle">
        Active List: <b>{activeName}</b>
      </div>

      {/* 🔥 LOGOUT BUTTON */}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}