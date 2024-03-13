const router = require("express").Router()
const invoice_controller = require("../controllers/invoice_controller")
const {auth} = require('../middlewares/auth')

router.get("/invoice/:id?",invoice_controller.get_invoice)
router.put("/invoice/:id",auth,invoice_controller.update_invoice)
router.delete("/invoice",auth,invoice_controller.delete_invoice)

module.exports = router