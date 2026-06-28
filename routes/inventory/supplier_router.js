const router = require("express").Router()
const supplier_controller = require('../../controllers/inventory/supplier_controller')

router.get("/supplier/:id?", supplier_controller.get_supplier)
router.post("/supplier", supplier_controller.add_supplier)
router.put("/supplier/:id", supplier_controller.update_supplier)
router.delete("/supplier/:id", supplier_controller.delete_supplier)

module.exports = router