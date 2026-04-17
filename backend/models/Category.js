const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// 🔥 prevent duplicate per user
categorySchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);