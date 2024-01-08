const router = require("express").Router()
const file_controller = require("../controllers/invoice_controller")

router.get("/generate_invoice/?",file_controller.get_invoice)
router.get("/generate_kuitansi/:id?",file_controller.get_invoice)
// router.get("/generate_kuitansi/:id?",file_controller.get_invoice)
// router.delete("/file/:id",file_controller.delete_file)

module.exports = router