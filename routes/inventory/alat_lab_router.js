const router = require("express").Router()
const alat_lab_controller = require('../../controllers/inventory/alat_lab_controller')

router.get("/alat-lab/:id?", alat_lab_controller.get_alat_lab)
router.post("/alat-lab", alat_lab_controller.add_alat_lab)
router.put("/alat-lab/:id", alat_lab_controller.update_alat_lab)
router.delete("/alat-lab/:id", alat_lab_controller.delete_alat_lab)

module.exports = router
