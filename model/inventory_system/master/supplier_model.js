const mongoose = require('mongoose')

const supplier_schema = new mongoose.Schema(
  {
    nama_supplier: {
      type: String,
      required: true,
      trim: true
    },
    alamat: {
      type: String,
      required: true
    },
    no_wa: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Supplier', supplier_schema)
