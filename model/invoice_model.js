const  mongoose = require("mongoose")

const invoice_schema = new mongoose.Schema({
    date: {
        type: Date,
        default: new Date().toISOString()
    },
    year: {
        type: Date,
        default: new Date().getFullYear()
    },
    month: {
        type: Date,
        default: new Date().getMonth()
    },
    no_invoice : {
        type: String
    },
    total_harga: {
        type: Number
    },
    estimasi_harga: {
        type: Number
    },
    status: {
        type : String
    },
    items: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Order"
        }
    ]

})

module.exports = mongoose.model("Invoice",invoice_schema)