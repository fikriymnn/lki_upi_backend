const router = require("express").Router()
const file_controller = require("../controllers/file_controller")
const multer = require("multer")

router.get("/generate_invoice",file_controller.get_invoice)
router.get("/generate_kuitansi/:no_invoice",file_controller.get_kuitansi)
router.post("/download",file_controller.get_file)
router.post("/foto_sample/:id",multer().single('foto_sample'),file_controller.foto_sample)

module.exports = router