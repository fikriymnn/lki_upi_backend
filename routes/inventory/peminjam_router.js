const router = require("express").Router()
const peminjam_controller = require('../../controllers/inventory/peminjam_controller')

router.get("/peminjam/:id?", peminjam_controller.get_peminjam)
router.post("/peminjam", peminjam_controller.add_peminjam)
router.put("/peminjam/:id", peminjam_controller.update_peminjam)
router.delete("/peminjam/:id", peminjam_controller.delete_peminjam)

module.exports = router
