import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadJson, saveJson } from "../services/storage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { DEFAULTS } from "../constants/defaults";

const AppStoreContext = createContext(null);

export function AppStoreProvider({ children }) {
  const [lists, setLists] = useState(() => loadJson(STORAGE_KEYS.LISTS, DEFAULTS.lists));
  const [activeListId, setActiveListId] = useState(() =>
    loadJson(STORAGE_KEYS.ACTIVE_LIST_ID, DEFAULTS.activeListId)
  );
  const [categories, setCategories] = useState(() =>
    loadJson(STORAGE_KEYS.CATEGORIES, DEFAULTS.categories)
  );
  const [units, setUnits] = useState(() => loadJson(STORAGE_KEYS.UNITS, DEFAULTS.units));
  const [items, setItems] = useState(() => loadJson(STORAGE_KEYS.ITEMS, DEFAULTS.items));

  // ✅ Budgets map: { [listId]: number }
  const [budgets, setBudgets] = useState(() =>
    loadJson(STORAGE_KEYS.BUDGETS, DEFAULTS.budgets)
  );

  // ✅ Persist
  useEffect(() => saveJson(STORAGE_KEYS.LISTS, lists), [lists]);
  useEffect(() => saveJson(STORAGE_KEYS.ACTIVE_LIST_ID, activeListId), [activeListId]);
  useEffect(() => saveJson(STORAGE_KEYS.CATEGORIES, categories), [categories]);
  useEffect(() => saveJson(STORAGE_KEYS.UNITS, units), [units]);
  useEffect(() => saveJson(STORAGE_KEYS.ITEMS, items), [items]);
  useEffect(() => saveJson(STORAGE_KEYS.BUDGETS, budgets), [budgets]); // ✅ IMPORTANT

  // ✅ Ensure active list exists
  useEffect(() => {
    if (!lists?.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveListId(null);
      return;
    }
    if (!activeListId || !lists.some((l) => l.id === activeListId)) {
      setActiveListId(lists[0].id);
    }
  }, [lists, activeListId]);

  // ✅ Cleanup budgets for deleted lists
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBudgets((prev) => {
      const safe = { ...(prev || {}) };
      const ids = new Set((lists || []).map((l) => l.id));
      let changed = false;

      Object.keys(safe).forEach((id) => {
        if (!ids.has(id)) {
          delete safe[id];
          changed = true;
        }
      });

      return changed ? safe : prev;
    });
  }, [lists]);

  const value = useMemo(
    () => ({
      lists,
      setLists,
      activeListId,
      setActiveListId,
      categories,
      setCategories,
      units,
      setUnits,
      items,
      setItems,

      budgets,
      setBudgets,
    }),
    [lists, activeListId, categories, units, items, budgets]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export default function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside <AppStoreProvider>");
  return ctx;
}
