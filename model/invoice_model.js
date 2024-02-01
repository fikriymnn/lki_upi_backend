const  mongoose = require("mongoose")
const month_bahasa = require("../utils/month_bahasa")
function timeNow() {
    var d = new Date(),
      h = (d.getHours()<10?'0':'') + d.getHours(),
      m = (d.getMinutes()<10?'0':'') + d.getMinutes();
   return h + ':' + m;
  }
const dateFormat = `${timeNow()} ${new Date().getDate()} ${month_bahasa(new Date().getMonth())} ${new Date().getFullYear()}`


const invoice_schema = new mongoose.Schema({
    date: {
        type: Date,
        default: new Date().toISOString()
    },
    date_format: {
        type: String,
        default: dateFormat
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
    estimasi_date: {
        type: String
    },
    status: {
        type : String
    },
    bukti_pembayaran: {
        data : Buffer,
        originalName: String,
        contentType: String
    },
    s1_date: {
        type: String,
        default: `${timeNow()} ${new Date().getDate()} ${month_bahasa(new Date().getMonth())} ${new Date().getFullYear()}`
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
    success: {
        type: Boolean,
        default : false
    }
})

module.exports = mongoose.model("Invoice",invoice_schema)