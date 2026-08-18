const router = require("express").Router()
const order_affiliate_controller = require('../../controllers/affiliate/order_affiiliate_controller')
const { auth } = require('../../middlewares/auth')

router.get("/order_affiliate_export", auth, order_affiliate_controller.export_order_affiliate)
router.get("/order_affiliate/:id/kwitansi", auth, order_affiliate_controller.get_kwitansi_order_affiliate)

router.get("/order_affiliate/:id?", auth, order_affiliate_controller.get_order_affiliate)
router.post("/order_affiliate", auth, order_affiliate_controller.add_order_affiliate)
router.put("/order_affiliate/:id/status", auth, order_affiliate_controller.update_status_order_affiliate)
router.put("/order_affiliate/:id/data", auth, order_affiliate_controller.update_data_order_affiliate)
router.put("/order_affiliate/:id/laporan", auth, order_affiliate_controller.upload_laporan_order_affiliate)
router.put("/order_affiliate/:id/invoice", auth, order_affiliate_controller.update_invoice_order_affiliate)
router.put("/order_affiliate/:id/bukti_pembayaran", auth, order_affiliate_controller.upload_bukti_pembayaran_order_affiliate)

module.exports = router