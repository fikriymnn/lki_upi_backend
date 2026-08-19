const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;

const lab_affiliate_schema = new mongoose.Schema(
  {
    nama_laboratorium: {
      type: String,
      required: true,
    },
    kode_laboratorium: {
      type: String, // dipakai untuk pola no_invoice, contoh: "LKOB"
      uppercase: true,
      trim: true,
    },
    no_whatsapp: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    alamat: {
      type: String,
    },
    status: {
      type: String,
      default: "aktif",
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LabAffiliate", lab_affiliate_schema);