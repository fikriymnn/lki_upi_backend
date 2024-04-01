const router = require("express").Router()
const file_controller = require("../controllers/file_controller")
const multer = require("multer")

router.get("/generate_invoice",file_controller.get_invoice)
router.get("/generate_kuitansi",file_controller.get_kuitansi)
router.get("/download_foto_sample/:id",file_controller.download_foto_sample)
router.post("/foto_sample/:id?",multer().single('foto_sample'),file_controller.foto_sample)
router.get("/download_jurnal_pendukung/:id",file_controller.download_jurnal_pendukung)
router.post("/jurnal_pendukung/:id?",multer().single('jurnal_pendukung'),file_controller.jurnal_pendukung)
router.get("/download_hasil_analisis/:id",file_controller.download_hasil_analisis)
router.post("/hasil_analisis/:id",file_controller.hasil_analisis)
router.get("/download_bukti_pembayaran/:id",file_controller.download_bukti_pembayaran)
router.post("/bukti_pembayaran/:id",multer().single('bukti_pembayaran'),file_controller.bukti_pembayaran)

module.exports = router