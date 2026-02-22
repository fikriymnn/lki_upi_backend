const router = require("express").Router()
const supplier_controller = require('../../controllers/inventory/supplier_controller')

// GET all supplier + pagination + search
router.get("/supplier/:id?", supplier_controller.get_all_supplier)

// CREATE supplier
router.post("/supplier", supplier_controller.create_supplier)

// UPDATE supplier
router.put("/supplier/:id", supplier_controller.update_supplier)

// DELETE supplier
router.delete("/supplier/:id", supplier_controller.delete_supplier)

module.exports = router


module.exports = router
