const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
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
  {
    timestamps: true
  }
);

// 🔥 duplicate prevent (user-wise)
unitSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Unit", unitSchema);