const  mongoose = require("mongoose")
const month_bahasa = require("../utils/month_bahasa")

const invoice_schema = new mongoose.Schema({
    date: {
        type: Date,
        default: new Date().toISOString()
    },
    date_format: {
        type: Date,
        default: `${new Date().getDay()} ${month_bahasa(new Date().getMonth())} ${new Date().getFullYear()}`
    },
    year: {
        type: String,
        default: new Date().getFullYear().toString()
    },
    month: {
        type: String,
        default: new Date().getMonth().toString()
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