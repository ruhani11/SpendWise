import { useMemo, useState, useEffect } from "react";
import useAppStore from "../../store/useAppStore";
import ConfirmModel from "../../components/Layout/ConfirmModel";
import "./ListsPage.css";

function uid() {
  return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function toMoney(n) {
  const num = Number(n || 0);
  return Number.isFinite(num) ? num : 0;
}

export default function ListsPage() {
  const {
    lists,
    setLists,
    activeListId,
    setActiveListId,
    items,
    budgets,
    setBudgets,
  } = useAppStore();

  const [newListName, setNewListName] = useState("");
  const [newBudget, setNewBudget] = useState("");

  // ✅ inline message (same like UnitsPage)
  const [message, setMessage] = useState(null);

  // ✅ confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  // ✅ edit state (if you already have edit UI, wire these there)
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editBudget, setEditBudget] = useState("");

  const usageCountByListId = useMemo(() => {
    const map = new Map();
    for (const it of items || []) {
      const lid = it.listId;
      if (!lid) continue;
      map.set(lid, (map.get(lid) || 0) + 1);
    }
    return map;
  }, [items]);

  function showMessage(text, type = "success") {
    setMessage({ text, type });
    window.clearTimeout(showMessage._t);
    showMessage._t = window.setTimeout(() => setMessage(null), 2500);
  }

  function isDuplicateListName(name, ignoreId = null) {
    const n = String(name || "").trim().toLowerCase();
    return (lists || []).some(
      (l) => l.id !== ignoreId && String(l.name || "").trim().toLowerCase() === n
    );
  }

  /* =========================
     CREATE LIST
  ========================= */
  function createList(e) {
    e.preventDefault();

    const nm = newListName.trim();
    const budgetNum = newBudget.trim() ? toMoney(newBudget) : 0;

    if (!nm) return showMessage("Enter list name.", "error");
    if (isDuplicateListName(nm)) return showMessage(`"${nm}" already exists.`, "error");

    // eslint-disable-next-line react-hooks/purity
    const newList = { id: uid(), name: nm, createdAt: Date.now() };

    setLists((prev) => [newList, ...(prev || [])]);

    // store budget separately if your app does that
    setBudgets((prev) => ({ ...(prev || {}), [newList.id]: budgetNum }));

    // optional: auto-make active if no active list
    if (!activeListId) setActiveListId(newList.id);

    setNewListName("");
    setNewBudget("");

    showMessage(`"${nm}" created successfully.`, "success");
  }

  /* =========================
     SET ACTIVE LIST
  ========================= */
  function setActive(id) {
    setActiveListId(id);
    const name = (lists || []).find((l) => l.id === id)?.name || "List";
    showMessage(`"${name}" is now active.`, "success");
  }

  /* =========================
     START EDIT (if you already have edit UI)
  ========================= */
  function startEdit(list) {
    setEditingId(list.id);
    setEditName(list.name || "");
    setEditBudget(String(budgets?.[list.id] ?? ""));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditBudget("");
  }

  function saveEdit(id) {
    const nm = editName.trim();
    const budgetNum = editBudget.trim() ? toMoney(editBudget) : 0;

    if (!nm) return showMessage("Enter list name.", "error");
    if (isDuplicateListName(nm, id)) return showMessage(`"${nm}" already exists.`, "error");

    setLists((prev) => (prev || []).map((l) => (l.id === id ? { ...l, name: nm } : l)));
    setBudgets((prev) => ({ ...(prev || {}), [id]: budgetNum }));

    cancelEdit();
    showMessage(`"${nm}" updated successfully.`, "success");
  }

  /* =========================
     DELETE LIST (same rule as you asked)
  ========================= */
  function requestDeleteList(id) {
    const list = (lists || []).find((l) => l.id === id);
    if (!list) return;

    // ✅ if active -> block delete with message
    if (activeListId === id) {
      return showMessage(`"${list.name}" is active (in use). Change active list first.`, "error");
    }

    // ✅ if list contains items -> block delete with message
    const used = usageCountByListId.get(id) || 0;
    if (used > 0) {
      return showMessage(`"${list.name}" is used by ${used} item(s). Cannot delete.`, "error");
    }

    // ✅ otherwise confirm modal
    setConfirmData({
      id,
      name: list.name,
      title: "Delete list?",
      message: `Delete list "${list.name}"?`,
    });
    setConfirmOpen(true);
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setConfirmData(null);
  }

  function confirmDelete() {
    if (!confirmData?.id) return;

    const id = confirmData.id;
    const name = confirmData.name || "List";

    setLists((prev) => (prev || []).filter((l) => l.id !== id));

    // remove budget if stored separately
    setBudgets((prev) => {
      const next = { ...(prev || {}) };
      delete next[id];
      return next;
    });

    // safety: if somehow deleted active, reset (but we already blocked it)
    if (activeListId === id) setActiveListId(null);

    if (editingId === id) cancelEdit();

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
    <div className="listsPage">
      <div className="listsHeader">
        <div>
          <h2 className="listsTitle">Lists</h2>
          <div className="listsMuted">
            Active List: <b>{(lists || []).find((l) => l.id === activeListId)?.name || "None"}</b>
          </div>
        </div>
      </div>

      {/* ✅ message ABOVE create list (same like UnitsPage) */}
      {message && <div className={`unitMessage ${message.type}`}>{message.text}</div>}

      <div className="listsCard">
        <h3 className="listsSectionTitle">Create New List</h3>

        <form className="listsForm" onSubmit={createList}>
          <input
            className="input"
            placeholder="List name (e.g., Monthly Groceries)"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <input
            className="input"
            placeholder="Budget (₹) optional"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
          />
          <button className="btnPrimary" type="submit">
            Create
          </button>
        </form>
      </div>

      <div className="listsCard">
        <h3 className="listsSectionTitle">All Lists</h3>

        {(lists || []).length === 0 ? (
          <div className="listsMuted">No lists yet. Create one above.</div>
        ) : (
          <div className="listsList">
            {(lists || []).map((l) => {
              const used = usageCountByListId.get(l.id) || 0;
              const isActive = l.id === activeListId;
              const isEditing = l.id === editingId;
              const budgetVal = budgets?.[l.id] ?? 0;

              return (
                <div
                  key={l.id}
                  className={`listRow ${isActive ? "listRowActive" : ""}`}
                  onClick={() => setActive(l.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="listLeft">
                    <div className="listName">
                      {isEditing ? (
                        <input
                          className="inputLight"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        l.name
                      )}
                    </div>

                    <div className="listMeta">
                      {isActive ? <b>Active</b> : "Tap to set active"} • Used by <b>{used}</b>{" "}
                      item(s) • Budget{" "}
                      <b>
                        ₹{Number(budgetVal || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </b>
                    </div>

                    {isEditing && (
                      <div style={{ marginTop: 8, width: "100%" }}>
                        <input
                          className="inputLight"
                          value={editBudget}
                          placeholder="Budget (₹) optional"
                          onChange={(e) => setEditBudget(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>

                  <div className="listActions" onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <>
                        <button className="btnSecondary" type="button" onClick={() => saveEdit(l.id)}>
                          Save
                        </button>
                        <button className="btnGhost" type="button" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btnSecondary" type="button" onClick={() => startEdit(l)}>
                          Edit
                        </button>
                        <button className="btnDanger" type="button" onClick={() => requestDeleteList(l.id)}>
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
        title={confirmData?.title || "Confirm"}
        message={confirmData?.message || ""}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
      />
    </div>
  );
}
