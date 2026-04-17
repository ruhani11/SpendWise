const router = require("express").Router();
const Category = require("../models/Category");
const Product = require("../models/Product");
const auth = require("../middleware/auth");


// ✅ GET
router.get("/", auth, async (req, res) => {
  try {
    const data = await Category.find({ userId: req.userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ CREATE
router.post("/", auth, async (req, res) => {
  try {
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    name = name.trim().toLowerCase();

    const existing = await Category.findOne({
      name,
      userId: req.userId
    });

    if (existing) {
      return res.status(400).json({
        message: "Category already exists ❌"
      });
    }

    const category = new Category({
      name,
      userId: req.userId
    });

    const saved = await category.save();
    res.status(201).json(saved);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ UPDATE (RENAME)
router.put("/:id", auth, async (req, res) => {
  try {
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    name = name.trim().toLowerCase();

    const existing = await Category.findOne({
      name,
      userId: req.userId,
      _id: { $ne: req.params.id }
    });

    if (existing) {
      return res.status(400).json({
        message: "Category already exists ❌"
      });
    }

    const updated = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ DELETE (SAFE)
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    const used = await Product.findOne({
      categoryId: id,
      userId: req.userId
    });

    if (used) {
      return res.status(400).json({
        message: "Category used in products ❌"
      });
    }

    await Category.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;