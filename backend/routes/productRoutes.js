const router = require("express").Router();
const Product = require("../models/Product");
const List = require("../models/List");
const auth = require("../middleware/auth");


// ✅ GET products (user-wise)
router.get("/", auth, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.userId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ CREATE product (🔥 ACTIVE LIST + DUPLICATE CHECK)
router.post("/", auth, async (req, res) => {
  try {
    let { name, quantity, price, categoryId, unitId } = req.body;

    if (!name || !categoryId || !unitId) {
      return res.status(400).json({
        message: "Name, category, unit required"
      });
    }

    name = name.trim().toLowerCase();

    // 🔥 get active list
    const activeList = await List.findOne({
      userId: req.userId,
      isActive: true
    });

    if (!activeList) {
      return res.status(400).json({
        message: "No active list found ❌"
      });
    }

    // 🔥 duplicate check (same logic as frontend)
    const existing = await Product.findOne({
      name,
      listId: activeList._id,
      categoryId,
      unitId,
      userId: req.userId
    });

    if (existing) {
      return res.status(400).json({
        message: "Item already exists in this list ❌"
      });
    }

    const product = new Product({
      name,
      quantity,
      price,
      categoryId,
      unitId,
      listId: activeList._id,
      userId: req.userId
    });

    const saved = await product.save();
    res.status(201).json(saved);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ UPDATE product (edit + bought toggle)
router.put("/:id", auth, async (req, res) => {
  try {
    let { name, quantity, price, categoryId, unitId, bought } = req.body;

    if (name) {
      name = name.trim().toLowerCase();
    }

    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        ...(name && { name }),
        ...(quantity !== undefined && { quantity }),
        ...(price !== undefined && { price }),
        ...(categoryId && { categoryId }),
        ...(unitId && { unitId }),
        ...(bought !== undefined && { bought })
      },
      { returnDocument: "after" }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ DELETE product
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;