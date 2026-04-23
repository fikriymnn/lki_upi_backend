const mongoose = require("mongoose");

const stockOpnameItemSchema = new mongoose.Schema(
  {
    opname: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockOpname",
      required: true
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemModel"
    },

    itemModel: {
      type: String,
      required: true,
      enum: ["AlatLab", "BahanKimia"]
    },

    systemStock: {
      type: Number,
      required: true
    },

    physicalStock: {
      type: Number,
      default: 0
    },

    selisih: {
      type: Number,
      default: 0
    },

    note: String
  },
  { timestamps: true }
);

stockOpnameItemSchema.index({ opname: 1 });
stockOpnameItemSchema.index({ item: 1 });

module.exports = mongoose.model("StockOpnameItem", stockOpnameItemSchema);