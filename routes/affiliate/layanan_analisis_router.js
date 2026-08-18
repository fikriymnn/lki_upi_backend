const router = require("express").Router()
const master_layanan_analisis_controller = require('../../controllers/affiliate/layanan_analisis_controller')
const { auth } = require('../../middlewares/auth')

router.get("/layanan_analisis/:id?", master_layanan_analisis_controller.get_layanan_analisis)
router.post("/layanan_analisis/:id?", auth, master_layanan_analisis_controller.add_layanan_analisis)
router.put("/layanan_analisis/:id", auth, master_layanan_analisis_controller.update_layanan_analisis)
router.delete("/layanan_analisis/:id", auth, master_layanan_analisis_controller.delete_layanan_analisis)

module.exports = router