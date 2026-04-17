import { useMemo, useState, useEffect } from "react";
import useAppStore from "../../store/useAppStore";
import ConfirmModel from "../../components/Layout/ConfirmModel";
import "./UnitsPage.css";

function uid() {
  return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

export default function UnitsPage() {
  const { units, setUnits, items } = useAppStore();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // ✅ inline message like CategoriesPage
  const [message, setMessage] = useState(null);

  const usageCountByUnitId = useMemo(() => {
    const map = new Map();
    for (const it of items || []) {
      if (!it.unitId) continue;
      map.set(it.unitId, (map.get(it.unitId) || 0) + 1);
    }
    return map;
  }, [items]);

  const pendingUnit = useMemo(() => {
    if (!pendingDeleteId) return null;
    return (units || []).find((u) => u.id === pendingDeleteId) || null;
  }, [pendingDeleteId, units]);

  function showMessage(text, type = "success") {
    setMessage({ text, type });
    window.clearTimeout(showMessage._t);
    showMessage._t = window.setTimeout(() => setMessage(null), 2500);
  }

  function isDuplicate(name, ignoreId = null) {
    const n = name.trim().toLowerCase();
    return (units || []).some(
      (u) => u.id !== ignoreId && u.name.trim().toLowerCase() === n
    );
  }

  function addUnit(e) {
    e.preventDefault();
    const nm = newName.trim();

    if (!nm) return showMessage("Enter unit name.", "error");
    if (isDuplicate(nm)) return showMessage(`"${nm}" already exists.`, "error");

    // eslint-disable-next-line react-hooks/purity
    const newUnit = { id: uid(), name: nm, createdAt: Date.now() };
    setUnits((prev) => [newUnit, ...(prev || [])]);
    setNewName("");

    showMessage(`"${nm}" created successfully.`, "success");
  }

  function startEdit(unit) {
    setEditingId(unit.id);
    setEditName(unit.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  function saveEdit(id) {
    const nm = editName.trim();

    if (!nm) return showMessage("Enter unit name.", "error");
    if (isDuplicate(nm, id)) return showMessage(`"${nm}" already exists.`, "error");

    setUnits((prev) => (prev || []).map((u) => (u.id === id ? { ...u, name: nm } : u)));
    cancelEdit();

    showMessage(`"${nm}" updated successfully.`, "success");
  }

  function deleteUnit(id) {
    const used = usageCountByUnitId.get(id) || 0;

    // ✅ inline error (no confirm modal)
    if (used > 0) {
      return showMessage(`Already used by ${used} item(s). Cannot delete.`, "error");
    }

    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;

    const name = pendingUnit?.name || "Unit";

    setUnits((prev) => (prev || []).filter((u) => u.id !== pendingDeleteId));
    if (editingId === pendingDeleteId) cancelEdit();

    closeConfirm();
    showMessage(`"${name}" deleted successfully.`, "success");
  }

  // ESC closes modal
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e) => e.key === "Escape" && closeConfirm();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  return (
    <div className="unitsPage">
      <div className="unitsHeader">
        <div>
          <h2 className="unitsTitle">Units of Measure</h2>
          <div className="unitsMuted">Add, rename, and manage your units.</div>
        </div>
      </div>

      {/* ✅ message bar ABOVE add unit */}
      {message && <div className={`unitMessage ${message.type}`}>{message.text}</div>}

      <div className="unitsCard">
        <h3 className="unitsSectionTitle">Add Unit</h3>
        <form className="unitsForm" onSubmit={addUnit}>
          <input
            className="input"
            placeholder="Unit name (e.g., Kg, Piece, Litre)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="btnPrimary" type="submit">
            Add
          </button>
        </form>
      </div>

      <div className="unitsCard">
        <h3 className="unitsSectionTitle">All Units</h3>

        {(units || []).length === 0 ? (
          <div className="unitsMuted">No units yet. Add one above.</div>
        ) : (
          <div className="unitsList">
            {(units || []).map((u) => {
              const used = usageCountByUnitId.get(u.id) || 0;
              const isEditing = u.id === editingId;

              return (
                <div key={u.id} className="unitRow">
                  <div className="unitLeft">
                    <div className="unitName">
                      {isEditing ? (
                        <input
                          className="inputLight"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        u.name
                      )}
                    </div>

                    <div className="unitMeta">
                      Used by <b>{used}</b> item(s)
                    </div>
                  </div>

                  <div className="unitActions">
                    {isEditing ? (
                      <>
                        <button
                          className="btnSecondary"
                          type="button"
                          onClick={() => saveEdit(u.id)}
                        >
                          Save
                        </button>
                        <button className="btnGhost" type="button" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btnSecondary" type="button" onClick={() => startEdit(u)}>
                          Rename
                        </button>
                        <button className="btnDanger" type="button" onClick={() => deleteUnit(u.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModel
        isOpen={confirmOpen}
        title="Delete unit?"
        message={pendingUnit ? `Delete unit "${pendingUnit.name}"?` : "Delete this unit?"}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
      />
    </div>
  );
}
