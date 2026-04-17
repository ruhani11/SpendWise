import { useMemo, useState, useEffect, useCallback } from "react";
import useAppStore from "../../store/useAppStore";
import ConfirmModal from "../../components/Layout/ConfirmModel";
import "./CategoriesPage.css";

function uid() {
  return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

export default function CategoriesPage() {
  const { categories, setCategories, items } = useAppStore();

  const [newName, setNewName] = useState("");

  // ✅ Confirm modal only for real confirm actions (create/delete)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  // ✅ Inline message (same UX as UnitsPage)
  const [message, setMessage] = useState(null);

  const showMessage = useCallback((text, type = "success") => {
    setMessage({ text, type });
    // eslint-disable-next-line react-hooks/immutability
    window.clearTimeout(showMessage._t);
    showMessage._t = window.setTimeout(() => setMessage(null), 2500);
  }, []);

  const usageCountByCategoryId = useMemo(() => {
    const map = new Map();
    for (const it of items || []) {
      if (!it.categoryId) continue;
      map.set(it.categoryId, (map.get(it.categoryId) || 0) + 1);
    }
    return map;
  }, [items]);

  function isDuplicate(name, ignoreId = null) {
    const n = name.trim().toLowerCase();
    return (categories || []).some(
      (c) => c.id !== ignoreId && c.name.trim().toLowerCase() === n
    );
  }

  /* =========================
     ADD CATEGORY
  ========================= */
  function addCategory(e) {
    e.preventDefault();
    const nm = newName.trim();

    // ✅ Inline messages (NO modal)
    if (!nm) return showMessage("Category name cannot be empty.", "error");
    if (isDuplicate(nm)) return showMessage(`"${nm}" already exists.`, "error");

    // ✅ Confirm modal only for create
    setConfirmData({
      title: "Create Category?",
      message: `Create category "${nm}"?`,
      action: "create",
      name: nm,
    });
    setConfirmOpen(true);
  }

  function confirmCreateCategory(name) {
    const newCat = { id: uid(), name, createdAt: Date.now() };
    setCategories((prev) => [newCat, ...(prev || [])]);
    setNewName("");
    showMessage(`"${name}" created successfully.`, "success");
  }

  /* =========================
     DELETE CATEGORY
  ========================= */
  function deleteCategory(id) {
    const used = usageCountByCategoryId.get(id) || 0;
    const cat = (categories || []).find((c) => c.id === id);
    if (!cat) return;

    // ✅ Inline message (NO modal) if in use
    if (used > 0) {
      showMessage(`"${cat.name}" is used by ${used} item(s). Cannot delete.`, "error");
      return;
    }

    // ✅ Confirm modal only for delete
    setConfirmData({
      title: "Delete Category?",
      message: `Delete "${cat.name}"?`,
      action: "delete",
      id,
      name: cat.name,
    });
    setConfirmOpen(true);
  }

  function confirmDeleteCategory(id, name) {
    setCategories((prev) => (prev || []).filter((c) => c.id !== id));
    showMessage(`"${name}" deleted successfully.`, "success");
  }

  /* =========================
     CONFIRM MODAL HANDLER
  ========================= */
  function handleConfirm() {
    if (!confirmData) return;

    if (confirmData.action === "create") {
      confirmCreateCategory(confirmData.name);
    }

    if (confirmData.action === "delete") {
      confirmDeleteCategory(confirmData.id, confirmData.name);
    }

    setConfirmOpen(false);
    setConfirmData(null);
  }

  const handleCancel = useCallback(() => {
    setConfirmOpen(false);
    setConfirmData(null);
  }, []);

  // ✅ Esc closes modal
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen, handleCancel]);

  return (
    <div className="categoriesPage">
      <div className="categoriesHeader">
        <div>
          <h2 className="categoriesTitle">Categories</h2>
          <div className="categoriesMuted">Add, rename, and manage your categories.</div>
        </div>
      </div>

      {/* ✅ INLINE MESSAGE (above Add Category like UnitsPage) */}
      {message && (
        <div className={`unitMessage ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="categoriesCard">
        <h3 className="categoriesSectionTitle">Add Category</h3>
        <form className="categoriesForm" onSubmit={addCategory}>
          <input
            className="input"
            placeholder="Category name (e.g., Groceries)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="btnPrimary" type="submit">
            Add
          </button>
        </form>
      </div>

      <div className="categoriesCard">
        <h3 className="categoriesSectionTitle">All Categories</h3>

        <div className="categoriesList">
          {(categories || []).map((c) => {
            const used = usageCountByCategoryId.get(c.id) || 0;

            return (
              <div key={c.id} className="categoryRow">
                <div className="categoryLeft">
                  <div className="categoryName">{c.name}</div>
                  <div className="categoryMeta">
                    Used by <b>{used}</b> item(s)
                  </div>
                </div>

                <div className="categoryActions">
                  <button
                    className="btnDanger"
                    type="button"
                    onClick={() => deleteCategory(c.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Confirm modal only for create/delete confirmation */}
      <ConfirmModal
        isOpen={confirmOpen}
        title={confirmData?.title || "Confirm"}
        message={confirmData?.message || ""}
        confirmText={confirmData?.action === "delete" ? "Delete" : "Confirm"}
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        danger={confirmData?.action === "delete"}
      />
    </div>
  );
}
