const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
    {
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

        type: {
            type: String,
            required: true,
            enum: ["IN", "OUT", "ADJUSTMENT"]
        },

        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        previousStock: {
            type: Number,
            required: true
        },

        newStock: {
            type: Number,
            required: true
        },
        note: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

stockMovementSchema.index({ item: 1, createdAt: -1 });

module.exports = mongoose.model("StockMovement", stockMovementSchema);