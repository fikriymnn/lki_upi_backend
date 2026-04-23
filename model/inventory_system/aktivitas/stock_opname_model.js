const mongoose = require("mongoose");

const stockOpnameSchema = new mongoose.Schema(
  {
    tanggal: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["DRAFT", "FINAL"],
      default: "DRAFT"
    },

    dibuatOleh: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    disesuaikanOleh: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    disesuaikanPada: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockOpname", stockOpnameSchema);