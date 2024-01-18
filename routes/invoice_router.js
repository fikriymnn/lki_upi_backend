const router = require("express").Router()
const invoice_controller = require("../controllers/invoice_controller")

router.get("/invoice/:id?",invoice_controller.get_invoice)
router.put("/invoice/:id",invoice_controller.update_invoice)
router.delete("/invoice/:id",invoice_controller.delete_invoice)

module.exports = router