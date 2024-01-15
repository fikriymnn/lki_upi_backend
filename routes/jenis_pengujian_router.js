const router = require("express").Router()
const jenis_pengujian_controller = require("../controllers/jenis_pengujian_controller")

router.get("/jenis_pengujian",jenis_pengujian_controller.get_jenis_pengujian)
router.post("/jenis_pengujian",jenis_pengujian_controller.add_jenis_pengujian)
router.put("/jenis_pengujian/:id",jenis_pengujian_controller.update_jenis_pengujian)
router.delete("/jenis_pengujian/:id",jenis_pengujian_controller.delete_jenis_pengujian)

module.exports = router