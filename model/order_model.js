const mongoose = require('mongoose')
const objId = mongoose.Schema.Types.ObjectId
const month_bahasa = require("../utils/month_bahasa")

const order_schema = new mongoose.Schema({
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
        default: month_bahasa(new Date().getMonth())
    },
    no_invoice: {
        type: String
    },
    harga: {
        type: Number,
    },
    jenis_pengujian: {
        type : String,
    },
    kode_pengujian: {
        type: String
    },
    status_pengujian: {
        type: String
    },
    nama_sample: {
        type: String
    },
    jumlah_sample: {
        type: Number
    },
    wujud_sample: {
        type: String
    },
    pelarut: {
        type: String
    },
    preparasi_sample : {
        type: Boolean
    },
    target_senyawa : {
        type: String
    },
    metode_parameter : {
        type : String
    },
    jurnal_pendukung : {
        type : Buffer
    },
    keterangan: {
        type: String
    },
    hasil_analisis: {
        type: Buffer
    }
    
})

module.exports = mongoose.model("Order",order_schema)

