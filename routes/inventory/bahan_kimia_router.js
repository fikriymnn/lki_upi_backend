const router = require("express").Router()
const bahan_kimia_controller = require('../../controllers/inventory/bahan_kimia_controller')

router.get("/bahan-kimia/:id?", bahan_kimia_controller.get_bahan_kimia)
router.post("/bahan-kimia", bahan_kimia_controller.add_bahan_kimia)
router.put("/bahan-kimia/:id", bahan_kimia_controller.update_bahan_kimia)
router.delete("/bahan-kimia/:id", bahan_kimia_controller.delete_bahan_kimia)

module.exports = router
