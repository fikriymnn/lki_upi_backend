const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;

const master_layanan_analisis_schema = new mongoose.Schema(
  {
    id_affiliate: {
      type: objId,
      ref: "LabAffiliate",
      required: true,
    },
    nama_layanan: {
      type: String,
      required: true, // "Autoklaf", "Shaker", "TPC (Total Plate Count)", "Evaporator", dst
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MasterLayananAnalisis", master_layanan_analisis_schema);