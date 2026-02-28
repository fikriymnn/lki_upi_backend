const StockOpname = require('../../model/inventory/stock_opname_model')
const StockOpnameItem = require('../../model/inventory/stock_opname_item_model')
const StockMovement = require('../../model/inventory/stock_movement_model')
const AlatLab = require('../../model/inventory/alat_lab_model')
const BahanKimia = require('../../model/inventory/bahan_kimia_model')

const stock_opname_controller = {

   // =========================================
   // GET OPNAME (LIST / DETAIL)
   // =========================================
   get_opname: async (req, res) => {
      try {

         const { id } = req.params

         if (id) {

            const header = await StockOpname.findById(id)
               .populate("dibuatOleh")
               .populate("disesuaikanOleh")

            if (!header) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: "Stock opname tidak ditemukan"
               })
            }

            const items = await StockOpnameItem.find({ opname: id })
               .populate("item")

            return res.status(200).json({
               success: true,
               header,
               items
            })
         }

         const { page = 1, limit = 10, status } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            ...(status && { status })
         }

         const total_data = await StockOpname.countDocuments(filter)

         const data = await StockOpname.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(per_page)

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


   // =========================================
   // CREATE OPNAME + AUTO GENERATE ITEM
   // =========================================
   add_opname: async (req, res) => {
      try {

         const { tanggal, dibuatOleh } = req.body

         const header = new StockOpname({
            tanggal,
            dibuatOleh,
            status: "DRAFT"
         })

         await header.save()

         const alat = await AlatLab.find()
         const bahan = await BahanKimia.find()

         const items = []

         alat.forEach(a => {
            items.push({
               opname: header._id,
               item: a._id,
               itemModel: "AlatLab",
               systemStock: a.jumlah
            })
         })

         bahan.forEach(b => {
            items.push({
               opname: header._id,
               item: b._id,
               itemModel: "BahanKimia",
               systemStock: b.jumlah
            })
         })

         await StockOpnameItem.insertMany(items)

         return res.status(200).json({
            success: true,
            message: "Stock opname berhasil dibuat",
            data: header
         })

      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },


   // =========================================
   // UPDATE PHYSICAL STOCK
   // =========================================
   update_opname_item: async (req, res) => {
      try {

         const { id } = req.params
         const { items } = req.body

         const header = await StockOpname.findById(id)

         if (!header) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: "Stock opname tidak ditemukan"
            })
         }

         if (header.status === "FINAL") {
            return res.status(200).json({
               success: false,
               status: 400,
               message: "Opname sudah FINAL"
            })
         }

         for (let data of items) {

            const item = await StockOpnameItem.findById(data._id)

            const selisih = data.physicalStock - item.systemStock

            await StockOpnameItem.updateOne(
               { _id: data._id },
               {
                  physicalStock: data.physicalStock,
                  selisih,
                  note: data.note
               }
            )
         }

         return res.status(200).json({
            success: true,
            message: "Opname berhasil diperbarui"
         })

      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },


   // =========================================
   // FINAL (ADJUST STOCK + GENERATE MOVEMENT)
   // =========================================
   final_opname: async (req, res) => {
      try {

         const { id } = req.params
         const { userId } = req.body

         const header = await StockOpname.findById(id)

         if (!header) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: "Stock opname tidak ditemukan"
            })
         }

         const items = await StockOpnameItem.find({ opname: id })

         for (let item of items) {

            if (item.selisih !== 0) {

               const Model = item.itemModel === "AlatLab"
                  ? AlatLab
                  : BahanKimia

               const dataItem = await Model.findById(item.item)

               const previousStock = dataItem.jumlah
               const newStock = previousStock + item.selisih

               dataItem.jumlah = newStock
               await dataItem.save()

               await StockMovement.create({
                  item: item.item,
                  itemModel: item.itemModel,
                  type: "ADJUSTMENT",
                  quantity: Math.abs(item.selisih),
                  previousStock,
                  newStock,
                  note: item.note,
                  createdBy: userId
               })
            }
         }

         header.status = "FINAL"
         header.disesuaikanOleh = userId
         header.disesuaikanPada = new Date()

         await header.save()

         return res.status(200).json({
            success: true,
            message: "Stock berhasil disesuaikan"
         })

      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }

}

module.exports = stock_opname_controller