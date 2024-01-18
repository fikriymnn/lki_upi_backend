const router = require("express").Router()
const file_controller = require("../controllers/file_controller")

router.get("/generate_invoice",file_controller.get_invoice)
router.get("/generate_kuitansi/:no_invoice",file_controller.get_kuitansi)
router.post("/download",file_controller.get_file)

module.exports = router