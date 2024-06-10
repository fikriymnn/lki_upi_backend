const router = require("express").Router()
const order_controller = require('../controllers/order_controller')
const {auth} = require('../middlewares/auth')
const multer = require("multer")

router.get("/order/:id?",order_controller.get_order)
router.post("/order/:id?",auth,multer().any(),order_controller.add_order)
router.put("/order/:id",order_controller.update_order)
router.delete("/order/:id",order_controller.delete_order)

module.exports = router