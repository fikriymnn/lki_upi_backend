const mongoose = require('mongoose')

const detail_pembelian_alat_schema = new mongoose.Schema(
  {
    id_pembelian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PembelianAlat',
      required: true
    },
    id_alat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlatLab',
      required: true
    },
    id_supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    jumlah: {
      type: Number,
      required: true,
      min: 1
    },
    harga_satuan: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
)

detail_pembelian_alat_schema.index({ id_pembelian: 1 })
detail_pembelian_alat_schema.index({ id_alat: 1 })
detail_pembelian_alat_schema.index({ id_supplier: 1 })

module.exports = mongoose.model('DetailPembelianAlat', detail_pembelian_alat_schema)