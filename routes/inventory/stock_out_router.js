const router = require("express").Router()
const stock_out_controller = require('../../controllers/inventory/stock_out_controller')
const auth_middleware = require('../../middleware/auth_middleware')

router.get("/stock-out/:id?", auth_middleware, stock_out_controller.get_stock_out)
router.post("/stock-out", auth_middleware, stock_out_controller.add_stock_out)
router.delete("/stock-out/:id", auth_middleware, stock_out_controller.delete_stock_out)

module.exports = router