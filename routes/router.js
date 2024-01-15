const router = require('express').Router()
router.use("/",require("./user_router"))
router.use("/",require("./order_router"))
router.use("/",require("./invoice_router"))
router.use("/",require("./jenis_pengujian_router"))
router.use("/",require("./file_router"))

module.exports = router