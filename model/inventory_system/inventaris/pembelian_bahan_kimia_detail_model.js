const mongoose = require('mongoose')

const detail_pembelian_bahan_kimia_schema = new mongoose.Schema(
  {
    id_pembelian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PembelianBahanKimia',
      required: true
    },
    id_bahan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BahanKimia',
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

detail_pembelian_bahan_kimia_schema.index({ id_pembelian: 1 })
detail_pembelian_bahan_kimia_schema.index({ id_bahan: 1 })
detail_pembelian_bahan_kimia_schema.index({ id_supplier: 1 })

module.exports = mongoose.model('DetailPembelianBahanKimia', detail_pembelian_bahan_kimia_schema)