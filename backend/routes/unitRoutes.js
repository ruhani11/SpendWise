const router = require("express").Router();
const Unit = require("../models/Unit");
const Product = require("../models/Product");
const auth = require("../middleware/auth");


// ✅ GET all units
router.get("/", auth, async (req, res) => {
  try {
    const units = await Unit.find({ userId: req.userId });
    res.json(units);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ CREATE unit
router.post("/", auth, async (req, res) => {
  try {
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    name = name.trim().toLowerCase();

    // 🔥 duplicate check
    const existing = await Unit.findOne({
      name,
      userId: req.userId
    });

    if (existing) {
      return res.status(400).json({
        message: "Unit already exists ❌"
      });
    }

    const unit = new Unit({
      name,
      userId: req.userId
    });

    const saved = await unit.save();
    res.status(201).json(saved);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ UPDATE (rename unit)
router.put("/:id", auth, async (req, res) => {
  try {
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    name = name.trim().toLowerCase();

    // 🔥 duplicate check (exclude current)
    const existing = await Unit.findOne({
      name,
      userId: req.userId,
      _id: { $ne: req.params.id }
    });

    if (existing) {
      return res.status(400).json({
        message: "Unit already exists ❌"
      });
    }

    const updated = await Unit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name },
      { returnDocument: "after" }
    );

    if (!updated) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ DELETE unit (SAFE)
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    // ❌ usage check (frontend jaisa)
    const used = await Product.findOne({
      unitId: id,
      userId: req.userId
    });

    if (used) {
      return res.status(400).json({
        message: "Already used in items ❌"
      });
    }

    const deleted = await Unit.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!deleted) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;