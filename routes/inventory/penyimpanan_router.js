const router = require("express").Router()
const penyimpanan_controller = require('../../controllers/inventory/penyimpanan_controller')

router.get("/penyimpanan/:id?", penyimpanan_controller.get_penyimpanan)
router.post("/penyimpanan", penyimpanan_controller.add_penyimpanan)
router.put("/penyimpanan/:id", penyimpanan_controller.update_penyimpanan)
router.delete("/penyimpanan/:id", penyimpanan_controller.delete_penyimpanan)

module.exports = router
