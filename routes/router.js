const invoice_model = require('../model/invoice_model')

const router = require('express').Router()
router.use("/",require("./user_router"))
router.use("/",require("./order_router"))
router.use("/",require("./invoice_router"))
router.use("/",require("./file_router"))
router.use("/",require("./content_router"))
router.use("/",require("./forgot_router"))
router.use("/",require("./inventory/supplier_router"))
router.use("/",require("./inventory/penyimpanan_router"))
router.use("/",require("./inventory/peminjam_router"))
router.use("/",require("./inventory/alat_lab_router"))
router.use("/",require("./inventory/bahan_kimia_router"))
router.use("/",require("./inventory/peminjaman_alat_lab_router"))
router.use("/",require("./inventory/peminjaman_bahan_kimia_router"))
router.use("/",require("./inventory/stock_movement_router"))
router.use("/",require("./inventory/stock_opname_router"))
router.use("/update_direct",async (req,res)=>{
    try {
        await invoice_model.updateMany({year:"2024",status:"Selesai"},{$set:{status:"Sembunyikan"}})
        res.send("sukses")
    } catch (err) {
        res.send(err.message)
    }
})

module.exports = router