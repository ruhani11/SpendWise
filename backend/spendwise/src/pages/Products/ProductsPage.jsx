import { useMemo, useState, useEffect } from "react";
import useAppStore from "../../store/useAppStore";
import ConfirmModel from "../../components/Layout/ConfirmModel"; // ✅ custom modal
import "./ProductsPage.css";

function uid() {
  return crypto?.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

function formatMoney(n) {
  const num = Number(n || 0);
  return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function unitAllowsDecimal(units, unitId) {
  const u = (units || []).find((x) => x.id === unitId);
  if (!u) return true;
  if (typeof u.allowDecimal === "boolean") return u.allowDecimal;

  const nm = String(u.name || "").trim().toLowerCase();
  const decimalUnits = ["litre", "liter", "l", "kg", "kilogram", "g", "gram", "ml"];
  return decimalUnits.some((k) => nm === k || nm.includes(k));
}

export default function ProductsPage() {
  const { activeListId, lists, categories, units, items, setItems, budgets } =
    useAppStore();

  // ✅ Mobile detection (900px breakpoint)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 900 : true
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeList = useMemo(() => {
    return (lists || []).find((l) => l.id === activeListId) || null;
  }, [lists, activeListId]);

  const activeListName = activeList?.name || "";

  const budget = useMemo(() => {
    const b = Number(budgets?.[activeListId]);
    return Number.isFinite(b) ? b : 0;
  }, [budgets, activeListId]);

  const listItems = useMemo(() => {
    if (!activeListId) return [];
    return (items || []).filter((i) => i.listId === activeListId);
  }, [items, activeListId]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of listItems) {
      const cid = it.categoryId || "uncategorized";
      if (!map.has(cid)) map.set(cid, []);
      map.get(cid).push(it);
    }
    return Array.from(map.entries());
  }, [listItems]);

  const plannedTotal = useMemo(() => {
    return listItems.reduce((s, i) => s + Number(i.quantity) * Number(i.price), 0);
  }, [listItems]);

  const purchasedTotal = useMemo(() => {
    return listItems
      .filter((i) => !!i.bought)
      .reduce((s, i) => s + Number(i.quantity) * Number(i.price), 0);
  }, [listItems]);

  const remainingTotal = useMemo(() => {
    return listItems
      .filter((i) => !i.bought)
      .reduce((s, i) => s + Number(i.quantity) * Number(i.price), 0);
  }, [listItems]);

  const remainingBudget = useMemo(() => {
    if (!budget) return null;
    return budget - purchasedTotal;
  }, [budget, purchasedTotal]);

  const isOverBudget = budget > 0 && remainingBudget < 0;

  const budgetWarnText = useMemo(() => {
    if (!budget || !Number.isFinite(remainingBudget)) return "";
    if (remainingBudget < 0)
      return `Over budget by ₹${formatMoney(Math.abs(remainingBudget))}`;
    if (remainingBudget <= budget * 0.1)
      return `Only ₹${formatMoney(remainingBudget)} left`;
    return "";
  }, [budget, remainingBudget]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [editingId, setEditingId] = useState(null);

  // Confirm modal state (delete item)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // ✅ Inline message bar (same like Units)
  const [message, setMessage] = useState(null);
  function showMessage(text, type = "success") {
    setMessage({ text, type });
    window.clearTimeout(showMessage._t);
    showMessage._t = window.setTimeout(() => setMessage(null), 2500);
  }

  // Form fields
  const [fName, setFName] = useState("");
  const [fQty, setFQty] = useState("1");
  const [fUnitId, setFUnitId] = useState("");
  const [fCategoryId, setFCategoryId] = useState("");
  const [fPrice, setFPrice] = useState("0");
  const [fBought, setFBought] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!fUnitId && units?.[0]?.id) setFUnitId(units[0].id);
    if (!fCategoryId && categories?.[0]?.id) setFCategoryId(categories[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, categories]);

  function openAddModal() {
    setMode("add");
    setEditingId(null);
    setFormError("");

    setFName("");
    setFQty("1");
    setFUnitId(units?.[0]?.id || "");
    setFCategoryId(categories?.[0]?.id || "");
    setFPrice("0");
    setFBought(false);

    setIsModalOpen(true);
  }

  function openEditModal(item) {
    setMode("edit");
    setEditingId(item.id);
    setFormError("");

    setFName(item.name || "");
    setFQty(String(item.quantity ?? 1));
    setFUnitId(item.unitId || units?.[0]?.id || "");
    setFCategoryId(item.categoryId || categories?.[0]?.id || "");
    setFPrice(String(item.price ?? 0));
    setFBought(!!item.bought);

    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setFormError("");
  }

  function updateItem(id, patch) {
    setItems((prev) =>
      (prev || []).map((i) =>
        i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i
      )
    );
  }

  // ✅ OPEN confirm modal (no window.confirm)
  function requestDeleteItem(id) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  const pendingItem = useMemo(() => {
    if (!pendingDeleteId) return null;
    return (items || []).find((i) => i.id === pendingDeleteId) || null;
  }, [pendingDeleteId, items]);

  function confirmDeleteItem() {
    if (!pendingDeleteId) return;

    const name = pendingItem?.name ? `"${pendingItem.name}"` : "Item";

    setItems((prev) => (prev || []).filter((i) => i.id !== pendingDeleteId));
    closeConfirm();
    closeModal();
    showMessage(`${name} deleted successfully.`);
  }

  function validateCommon() {
    if (!activeListId) return "Select a list first.";

    const nm = fName.trim();
    if (!nm) return "Please enter item name.";

    const allowDec = unitAllowsDecimal(units, fUnitId);
    const qNum = Number(fQty);
    const pNum = Number(fPrice);

    if (!Number.isFinite(qNum) || qNum <= 0) return "Quantity must be greater than 0.";
    if (!allowDec && !Number.isInteger(qNum))
      return "This unit supports whole numbers only.";

    if (!fUnitId) return "Please add/select a unit.";
    if (!fCategoryId) return "Please add/select a category.";

    if (!Number.isFinite(pNum) || pNum < 0) return "Price must be 0 or more.";

    return "";
  }

  function saveAdd() {
    const err = validateCommon();
    if (err) return setFormError(err);

    const nm = fName.trim();
    const qNum = Number(fQty);
    const pNum = Number(fPrice);
    const keyName = nm.toLowerCase();

    const duplicate = (items || []).some(
      (it) =>
        it.listId === activeListId &&
        (it.name || "").trim().toLowerCase() === keyName &&
        it.unitId === fUnitId &&
        it.categoryId === fCategoryId
    );

    if (duplicate) return setFormError("This item already exists in this list.");

    setItems((prev) => [
      {
        id: uid(),
        listId: activeListId,
        name: nm,
        quantity: qNum,
        unitId: fUnitId,
        categoryId: fCategoryId,
        price: pNum,
        bought: !!fBought,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      ...(prev || []),
    ]);

    closeModal();
    showMessage(`"${nm}" created successfully.`);
  }

  function saveEdit() {
    const err = validateCommon();
    if (err) return setFormError(err);

    const nm = fName.trim();

    updateItem(editingId, {
      name: nm,
      quantity: Number(fQty),
      unitId: fUnitId,
      categoryId: fCategoryId,
      price: Number(fPrice),
      bought: !!fBought,
    });

    closeModal();
    showMessage(`"${nm}" updated successfully.`);
  }

  if (!activeListId) {
    return (
      <div className="productsCard">
        <h2 className="productsTitle">No active list selected</h2>
        <p className="productsMuted">
          Go to <b>Lists</b> and select a list first.
        </p>
      </div>
    );
  }

  const TotalsContent = (
    <>
      <div className="totalsRow">
        <span>Planned</span>
        <b>₹{formatMoney(plannedTotal)}</b>
      </div>
      <div className="totalsRow">
        <span>Remaining</span>
        <b>₹{formatMoney(remainingTotal)}</b>
      </div>
      <div className="totalsRow">
        <span>Purchased</span>
        <b>₹{formatMoney(purchasedTotal)}</b>
      </div>
    </>
  );

  return (
    <div className="productsPage">
      {/* ✅ NEW LAYOUT WRAPPER */}
      <div className="productsLayout">
        {/* ✅ LEFT SIDE */}
        <div className="leftCol">
          <div className="productsTop">
            <h2 className="productsTitle">Products</h2>
            <div className="productsMuted">
              Active List: <b>{activeListName}</b>
            </div>
          </div>

          {/* ✅ MESSAGE BAR (like UnitsPage) */}
          {message && (
            <div className={`unitMessage ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* ✅ scroll list is ONLY under Products heading */}
          <div className="productsScroll">
            {grouped.length === 0 ? (
              <div className="productsCard">
                <div className="productsMuted">No items yet. Tap “Add Item” to begin.</div>
              </div>
            ) : (
              grouped.map(([cid, arr]) => {
                const cname =
                  categories.find((c) => c.id === cid)?.name || "Uncategorized";

                const categoryPurchased = arr
                  .filter((x) => !!x.bought)
                  .reduce((s, x) => s + Number(x.quantity) * Number(x.price), 0);

                const categoryRemaining = arr
                  .filter((x) => !x.bought)
                  .reduce((s, x) => s + Number(x.quantity) * Number(x.price), 0);

                return (
                  <div className="productsCard" key={cid}>
                    <div className="categoryHeaderRow">
                      <div className="categoryHeader">{cname}</div>

                      <div className="categoryTotals">
                        <span className="chip chipWarn">
                          Remaining: ₹{formatMoney(categoryRemaining)}
                        </span>
                        <span className="chip chipOk">
                          Purchased: ₹{formatMoney(categoryPurchased)}
                        </span>
                      </div>
                    </div>

                    <div className="itemsList">
                      {arr.map((it) => {
                        const unitName =
                          units.find((u) => u.id === it.unitId)?.name || "";
                        const lineTotal = Number(it.quantity) * Number(it.price);

                        return (
                          <div
                            key={it.id}
                            className={`itemRow ${it.bought ? "itemRowBought" : ""}`}
                          >
                            <div className="itemInfo">
                              <div className="itemName">{it.name}</div>
                              <div className="itemMeta">
                                {it.quantity} {unitName} • ₹{formatMoney(it.price)} • Total ₹
                                {formatMoney(lineTotal)}
                              </div>
                            </div>

                            <div className="itemActions">
                              <button
                                className="btnEdit"
                                type="button"
                                onClick={() => openEditModal(it)}
                              >
                                Edit
                              </button>

                              <label className="miniCheck">
                                <input
                                  className="checkbox"
                                  type="checkbox"
                                  checked={!!it.bought}
                                  onChange={() =>
                                    updateItem(it.id, { bought: !it.bought })
                                  }
                                />
                                <span className="miniCheckText">Purchased</span>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ✅ RIGHT SIDE (Summary) */}
        <div className="rightCol">
          <div className="rightPanelStack">
            <div className="budgetBox">
              <div className="budgetRow">
                <span className="budgetLabel">Budget</span>
                <span className="budgetValue">
                  {budget ? `₹${formatMoney(budget)}` : "Not set"}
                </span>
              </div>

              <div className={`budgetRow ${budget && remainingBudget < 0 ? "budgetNegative" : ""}`}>
                <span className="budgetLabel">Remaining</span>
                <span className="budgetValue">
                  {budget ? `₹${formatMoney(remainingBudget)}` : "—"}
                </span>
              </div>

              {budgetWarnText && (
                <div className={`budgetAlert ${isOverBudget ? "budgetAlertDanger" : "budgetAlertWarn"}`}>
                  {budgetWarnText}
                </div>
              )}
            </div>

            {!isMobile && <div className="totalsRight">{TotalsContent}</div>}
          </div>
        </div>
      </div>

      {/* ✅ Floating Add Button */}
      <button
        className="fabAdd"
        type="button"
        onClick={openAddModal}
        aria-label="Add item"
      >
        <span className="fabIcon">+</span>
        <span className="fabText">Add Item</span>
      </button>

      {/* ✅ Modal */}
      {isModalOpen && (
        <div className="modalBackdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <button className="iconBtn" type="button" onClick={closeModal}>
                ←
              </button>

              <div className="modalTitle">{mode === "add" ? "Add Item" : "Edit Item"}</div>

              <button
                className="iconBtn"
                type="button"
                onClick={mode === "add" ? saveAdd : saveEdit}
                title={mode === "add" ? "Add" : "Save"}
              >
                ✓
              </button>
            </div>

            <label className="label">Name</label>
            <input className="inputLight" value={fName} onChange={(e) => setFName(e.target.value)} />

            <div className="twoCol">
              <div>
                <label className="label">Quantity</label>
                <input
                  className="inputLight"
                  type="number"
                  min={unitAllowsDecimal(units, fUnitId) ? "0.01" : "1"}
                  step={unitAllowsDecimal(units, fUnitId) ? "0.01" : "1"}
                  value={fQty}
                  onChange={(e) => setFQty(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Unit</label>
                <select className="inputLight" value={fUnitId} onChange={(e) => setFUnitId(e.target.value)}>
                  {(units || []).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="label">Price (₹)</label>
            <input
              className="inputLight"
              type="number"
              min="0"
              step="0.01"
              value={fPrice}
              onChange={(e) => setFPrice(e.target.value)}
            />

            <label className="label">Category</label>
            <select className="inputLight" value={fCategoryId} onChange={(e) => setFCategoryId(e.target.value)}>
              {(categories || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="checkboxRow">
              <input type="checkbox" checked={!!fBought} onChange={() => setFBought(!fBought)} />
              <span>Mark as Purchased</span>
            </div>

            {formError && <div className="formError">{formError}</div>}

            {mode === "edit" && (
              <div className="modalActions">
                <button
                  className="btnDanger"
                  type="button"
                  onClick={() => requestDeleteItem(editingId)}
                >
                  Delete
                </button>
                <button className="btnSecondary" type="button" onClick={saveEdit}>
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ Custom Confirm Modal for item delete */}
      <ConfirmModel
        isOpen={confirmOpen}
        title="Delete item?"
        message={
          pendingItem?.name
            ? `Delete "${pendingItem.name}"?`
            : "Delete this item?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={confirmDeleteItem}
        onCancel={closeConfirm}
      />

      {/* ✅ Mobile totals bar stays bottom */}
      {isMobile && <div className="totalsBar">{TotalsContent}</div>}
    </div>
  );
}
