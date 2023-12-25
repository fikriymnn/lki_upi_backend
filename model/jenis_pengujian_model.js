const mongoose = require("mongoose")

const jenis_pengujian_schema = new mongoose.Schema({
     nama_pengujian: {
        type: String
     },
     kode_pengujian: {
        type: String
    },
    jenis_institusi: {
        type: String
    },
    harga: {
        type: Number
    }
})

module.exports = mongoose.model("Jenis_pengujian",jenis_pengujian_schema)