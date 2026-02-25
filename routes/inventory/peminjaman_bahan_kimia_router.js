const router = require("express").Router()
const peminjaman_bahan_controller = require('../../controllers/inventory/peminjaman_bahan_controller')

router.get("/peminjaman-bahan/:id?", peminjaman_bahan_controller.get_peminjaman)
router.post("/peminjaman-bahan", peminjaman_bahan_controller.add_peminjaman)
router.put("/peminjaman-bahan/:id/kembalikan", peminjaman_bahan_controller.return_peminjaman)
router.delete("/peminjaman-bahan/:id", peminjaman_bahan_controller.delete_peminjaman)

module.exports = router