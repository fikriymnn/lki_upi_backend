const mongoose = require('mongoose')
const objId = mongoose.Schema.Types.ObjectId
const month_bahasa = require("../utils/month_bahasa")
function timeNow() {
    var d = new Date(),
      h = (d.getHours()<10?'0':'') + d.getHours(),
      m = (d.getMinutes()<10?'0':'') + d.getMinutes();
   return h + ':' + m;
  }

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
        type: String,
        default: `${new Date().getDate()} ${month_bahasa(new Date().getMonth())} ${new Date().getFullYear()}`
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
    uuid: {
        type: String
    },
    jenis_pengujian: {
            type:String
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
        type: Boolean,
        default: false
    },
    target_senyawa : {
        type: String
    },
    metode_parameter : {
        type : String
    },
    jurnal_pendukung : {
        type:String
    },
    deskripsi_sample: {
        type: String,
        
    },
    foto_sample: {
       type: String
    },
    hasil_analisis: {
        type: String
    },
    sample_dikembalikan: {
        type: String
    },
    riwayat_pengujian: {
        type: String
    },
})

// jurnal_pendukung : {
//     data : Buffer,
//     contentType:String,
//     originalName:String
// }

module.exports = mongoose.model("Order",order_schema)

