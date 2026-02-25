const router = require("express").Router()
const peminjaman_alat_controller = require('../../controllers/inventory/peminjaman_alat_controller')

// Peminjaman Alat
router.get("/peminjaman-alat/:id?", peminjaman_alat_controller.get_peminjaman)
router.post("/peminjaman-alat", peminjaman_alat_controller.add_peminjaman)
router.put("/peminjaman-alat/:id/kembalikan", peminjaman_alat_controller.return_peminjaman)
router.delete("/peminjaman-alat/:id", peminjaman_alat_controller.delete_peminjaman)

// Alat Rusak
router.get("/alat-rusak/:id?", peminjaman_alat_controller.get_alat_rusak)
router.put("/alat-rusak/:id/ganti", peminjaman_alat_controller.ganti_alat_rusak)

module.exports = router