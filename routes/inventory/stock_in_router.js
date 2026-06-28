const router = require("express").Router()
const stock_in_controller = require('../../controllers/inventory/stock_in_controller')
const auth_middleware = require('../../middleware/auth_middleware')

router.get("/stock-in/:id?", auth_middleware, stock_in_controller.get_stock_in)
router.post("/stock-in", auth_middleware, stock_in_controller.add_stock_in)
router.delete("/stock-in/:id", auth_middleware, stock_in_controller.delete_stock_in)

module.exports = router