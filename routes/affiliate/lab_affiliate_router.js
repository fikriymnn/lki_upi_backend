const router = require("express").Router()
const lab_affiliate_controller = require('../../controllers/affiliate/lab_affiliate_controller')
const { auth } = require('../../middlewares/auth')

router.get("/lab_affiliate/public", lab_affiliate_controller.get_lab_affiliate_public)
router.get("/lab_affiliate/:id?", lab_affiliate_controller.get_lab_affiliate)
router.post("/lab_affiliate/:id?", auth, lab_affiliate_controller.add_lab_affiliate)
router.put("/lab_affiliate/:id", auth, lab_affiliate_controller.update_lab_affiliate)
router.delete("/lab_affiliate/:id", auth, lab_affiliate_controller.delete_lab_affiliate)

module.exports = router