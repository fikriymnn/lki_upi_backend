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
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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
    s1_date: {
        type: Date
    },
    s2_date: {
        type: Date
    },
    s3_date: {
        type: Date
    },
    s4_date: {
        type: Date
    },
    s5_date: {
        type: Date
    },
    s6_date: {
        type: Date
    },
    s7_date: {
        type: Date
    },
    s8_date: {
        type: Date
    },
    items: {
        type: Array
    }

})

module.exports = mongoose.model("Invoice",invoice_schema)