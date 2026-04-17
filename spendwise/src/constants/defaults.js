export const DEFAULTS = {
  lists: [{ id: "list_1", name: "My List", createdAt: Date.now() }],
  activeListId: "list_1",

  categories: [
    { id: "cat_1", name: "Groceries", createdAt: Date.now() },
    { id: "cat_2", name: "Bakery and Desserts", createdAt: Date.now() },
  ],

  units: [
    { id: "unit_1", name: "Piece", createdAt: Date.now() },
    { id: "unit_2", name: "Kg", createdAt: Date.now() },
    { id: "unit_3", name: "Litre", createdAt: Date.now() },
  ],
    items: [],
    budgets: {},
};
