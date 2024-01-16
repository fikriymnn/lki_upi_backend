const  mongoose = require("mongoose")
const month_bahasa = require("../utils/month_bahasa")

const invoice_schema = new mongoose.Schema({
    date: {
        type: Date,
        default: new Date().toISOString()
    },
    date_format: {
        type: String,
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
        type: String
    },
    s2_date: {
        type: String
    },
    s3_date: {
        type: String
    },
    s4_date: {
        type: String
    },
    s5_date: {
        type: String
    },
    s6_date: {
        type: String
    },
    s7_date: {
        type: String
    },
    s8_date: {
        type: String
    },
    items: {
        type: Array
    }

})

module.exports = mongoose.model("Invoice",invoice_schema)