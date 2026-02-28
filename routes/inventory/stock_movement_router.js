const router = require("express").Router()
const stock_transaction_controller = require('../../controllers/inventory/stock_movement_controller')

router.get("/stock-transaction/:id?", stock_transaction_controller.get_transaction)
router.post("/stock-transaction", stock_transaction_controller.add_transaction)
router.put("/stock-transaction/:id", stock_transaction_controller.update_transaction)
router.delete("/stock-transaction/:id", stock_transaction_controller.delete_transaction)

module.exports = router