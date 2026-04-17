import { useMemo } from "react";
import useAppStore from "../../store/useAppStore";

export default function Header({ menuOpen, onMenuClick }) {
  const { lists, activeListId } = useAppStore();

  const activeName = useMemo(() => {
    return lists?.find((l) => l.id === activeListId)?.name || "None";
  }, [lists, activeListId]);

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
    </header>
  );
}
