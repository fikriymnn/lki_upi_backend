const mongoose = require('mongoose')
const objId = mongoose.Schema.Types.ObjectId
const month_bahasa = require("../utils/month_bahasa")

const order_schema = new mongoose.Schema({
    id_user: {
        type: objId,
        ref: "User"
    },
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
    no_invoice: {
        type: String
    },
    jenis_pengujian: {
        jenis_pengujian: {
            type:String
        },
        kode_pegujian:{
            type:String
        }
    },
    kode_pengujian: {
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
    preparasi_khusus : {
        type: String
    },
    target_senyawa : {
        type: String
    },
    metode_parameter : {
        type : String
    },
    jurnal_pendukung : {
        type : Buffer,
        contentType:String,
        originalName:String
    },
    deskripsi_sample: {
        type: String,
        
    },
    foto_sample: {
       type:Buffer,
       contentType:String,
       originalName:String
    },
    hasil_analisis: {
        type: Buffer,
        contentType:String,
        originalName:String
    },
})

module.exports = mongoose.model("Order",order_schema)

