const router = require("express").Router()
const stock_movement_controller = require('../../controllers/inventory/stock_movement_controller')
const auth_middleware = require('../../middleware/auth_middleware')

// GET ALL + GET BY ID
router.get("/stock-movement/:id?", auth_middleware, stock_movement_controller.get_stock_movement)

// GET riwayat movement milik 1 item tertentu
router.get("/stock-movement/item/:item_id", auth_middleware, stock_movement_controller.get_movement_by_item)

// DELETE
router.delete("/stock-movement/:id", auth_middleware, stock_movement_controller.delete_stock_movement)

module.exports = router