const StockMovement = require('../../model/inventory/stock_movement_model')
const AlatLab = require('../../model/inventory/alat_lab_model')
const BahanKimia = require('../../model/inventory/bahan_kimia_model')
const mongoose = require('mongoose')

const stock_transaction_controller = {

   // ==================================================
   // GET STOCK IN / OUT (LIST + SEARCH + DATE RANGE)
   // ==================================================
   get_transaction: async (req, res) => {
      try {

         const { 
            page = 1, 
            limit = 10, 
            type, 
            itemModel, 
            search = "", 
            fromDate, 
            toDate 
         } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         let filter = {}

         if (type) filter.type = type
         if (itemModel) filter.itemModel = itemModel

         // Filter tanggal
         if (fromDate && toDate) {
            filter.createdAt = {
               $gte: new Date(fromDate),
               $lte: new Date(toDate)
            }
         }

         let query = StockMovement.find(filter)
            .populate("item")
            .populate("createdBy")

         const data_all = await query

         // SEARCH by nama alat/bahan
         const filtered = data_all.filter(d => {
            const name = d.item?.nama_alat || d.item?.nama_bahan || ""
            return name.toLowerCase().includes(search.toLowerCase())
         })

         const total_data = filtered.length

         const data = filtered
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(skip, skip + per_page)

         return res.status(200).json({
            success: true,
            data,
            pagination: {
               total_data,
               total_page: Math.ceil(total_data / per_page),
               current_page,
               per_page
            }
         })

      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },


   // ==================================================
   // ADD STOCK IN / OUT
   // ==================================================
   add_transaction: async (req, res) => {
      try {

         const { itemId, itemModel, quantity, note, userId, type } = req.body

         if (!itemId || !itemModel || !quantity || !type) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: "Data tidak lengkap"
            })
         }

         const Model = itemModel === "AlatLab" ? AlatLab : BahanKimia
         const item = await Model.findById(itemId)

         if (!item) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: "Item tidak ditemukan"
            })
         }

         const previousStock = item.jumlah
         let newStock = previousStock

         if (type === "IN") {
            newStock += quantity
         } else {
            if (previousStock < quantity) {
               return res.status(200).json({
                  success: false,
                  status: 400,
                  message: "Stock tidak mencukupi"
               })
            }
            newStock -= quantity
         }

         item.jumlah = newStock
         await item.save()

         await StockMovement.create({
            item: itemId,
            itemModel,
            type,
            quantity,
            previousStock,
            newStock,
            note,
            createdBy: userId
         })

         return res.status(200).json({
            success: true,
            message: "Transaksi berhasil dibuat"
         })

      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },


   // ==================================================
   // EDIT TRANSACTION (AUTO RECALCULATE STOCK)
   // ==================================================
   update_transaction: async (req, res) => {
      try {

         const { id } = req.params
         const { quantity, note } = req.body

         const trx = await StockMovement.findById(id)

         if (!trx) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: "Transaksi tidak ditemukan"
            })
         }

         const Model = trx.itemModel === "AlatLab" ? AlatLab : BahanKimia
         const item = await Model.findById(trx.item)

         // Rollback stock lama
         item.jumlah = trx.previousStock

         const previousStock = item.jumlah
         let newStock = previousStock

         if (trx.type === "IN") {
            newStock += quantity
         } else {
            if (previousStock < quantity) {
               return res.status(200).json({
                  success: false,
                  status: 400,
                  message: "Stock tidak mencukupi"
               })
            }
            newStock -= quantity
         }

         item.jumlah = newStock
         await item.save()

         await StockMovement.updateOne(
            { _id: id },
            {
               quantity,
               previousStock,
               newStock,
               note
            }
         )

         return res.status(200).json({
            success: true,
            message: "Transaksi berhasil diperbarui"
         })

      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },


   // ==================================================
   // DELETE TRANSACTION (ROLLBACK STOCK)
   // ==================================================
   delete_transaction: async (req, res) => {
      try {

         const { id } = req.params

         const trx = await StockMovement.findById(id)

         if (!trx) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: "Transaksi tidak ditemukan"
            })
         }

         const Model = trx.itemModel === "AlatLab" ? AlatLab : BahanKimia
         const item = await Model.findById(trx.item)

         // rollback stock
         item.jumlah = trx.previousStock
         await item.save()

         await StockMovement.deleteOne({ _id: id })

         return res.status(200).json({
            success: true,
            message: "Transaksi berhasil dihapus"
         })

      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }

}

module.exports = stock_transaction_controller