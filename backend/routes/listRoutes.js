const router = require("express").Router();
const List = require("../models/List");
const Product = require("../models/Product");
const auth = require("../middleware/auth");


// ✅ GET all lists
router.get("/", auth, async (req, res) => {
  try {
    const lists = await List.find({ userId: req.userId });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ CREATE list
router.post("/", auth, async (req, res) => {
  try {
    let { name, budget } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    name = name.trim().toLowerCase();

    const existing = await List.findOne({
      name,
      userId: req.userId
    });

    if (existing) {
      return res.status(400).json({
        message: "List already exists"
      });
    }

    const existingLists = await List.find({ userId: req.userId });

    const list = new List({
      name,
      budget,
      userId: req.userId,
      isActive: existingLists.length === 0
    });

    const saved = await list.save();
    res.status(201).json(saved);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ SET ACTIVE LIST
router.put("/set-active/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    await List.updateMany(
      { userId: req.userId },
      { isActive: false }
    );

    const updated = await List.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isActive: true },
      { returnDocument: "after" } // ✅ FIX
    );

    if (!updated) {
      return res.status(404).json({ message: "List not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ UPDATE list
router.put("/:id", auth, async (req, res) => {
  try {
    let { name, budget } = req.body;

    if (name) {
      name = name.trim().toLowerCase();

      const existing = await List.findOne({
        name,
        userId: req.userId,
        _id: { $ne: req.params.id }
      });

      if (existing) {
        return res.status(400).json({
          message: "List name already exists"
        });
      }
    }

    const updated = await List.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        ...(name && { name }),
        ...(budget !== undefined && { budget })
      },
      { returnDocument: "after" } // ✅ FIX
    );

    if (!updated) {
      return res.status(404).json({ message: "List not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ DELETE list (FINAL SAFE)
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    const list = await List.findOne({
      _id: id,
      userId: req.userId
    });

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // ❌ last list block
    const totalLists = await List.countDocuments({
      userId: req.userId
    });

    if (totalLists === 1) {
      return res.status(400).json({
        message: "At least one list required ❌"
      });
    }

    // ❌ active list block
    if (list.isActive) {
      return res.status(400).json({
        message: "Active list cannot be deleted ❌"
      });
    }

    // ❌ usage check
    const used = await Product.findOne({
      listId: id,
      userId: req.userId
    });

    if (used) {
      return res.status(400).json({
        message: "List is used in items ❌"
      });
    }

    await List.deleteOne({ _id: id });

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;