const router = require("express").Router()
const stock_opname_controller = require('../../controllers/inventory/stock_opname_controller')

// =======================================
// GET LIST / DETAIL
// =======================================
router.get("/stock-opname/:id?", stock_opname_controller.get_opname)

// =======================================
// CREATE HEADER + AUTO GENERATE ITEM
// =======================================
router.post("/stock-opname", stock_opname_controller.add_opname)

// =======================================
// UPDATE PHYSICAL STOCK (SAVE DRAFT)
// =======================================
router.put("/stock-opname/:id", stock_opname_controller.update_opname_item)

// =======================================
// FINAL / SESUAIKAN STOCK
// =======================================
router.put("/stock-opname/:id/final", stock_opname_controller.final_opname)

module.exports = router