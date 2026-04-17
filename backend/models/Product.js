const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    quantity: {
      type: Number,
      required: true
    },

    price: {
      type: Number,
      default: 0
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true
    },

    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true
    },

    bought: {
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

module.exports = mongoose.model("Product", productSchema);