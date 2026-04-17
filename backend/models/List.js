const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    budget: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: false
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

// 🔥 prevent duplicate per user
listSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("List", listSchema);