const StockMovement = require('../../model/inventory/stock_movement_model')
const AlatLab = require('../../model/inventory/alat_lab_model')
const BahanKimia = require('../../model/inventory/bahan_kimia_model')

const stock_movement_controller = {

   // ==============================
   // GET ALL + GET BY ID
   // ==============================
   get_stock_movement: async (req, res) => {
      try {
         const { id } = req.params

         // GET BY ID
         if (id) {
            const data = await StockMovement.findOne({ _id: id })
               .populate({
                  path: 'item_id',
                  populate: { path: 'id_penyimpanan', select: 'penyimpanan' }
               })
               .populate('id_penyimpanan', 'penyimpanan')
               .populate('created_by', 'nama_lengkap email')

            if (!data) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Data stock movement tidak ditemukan'
               })
            }

            return res.status(200).json({
               success: true,
               data
            })
         }

         // GET ALL + SEARCH + FILTER + PAGINATION
         const {
            page = 1,
            limit = 10,
            search = '',
            item_model = '',
            type = '',
            id_penyimpanan = '',
            date_from = '',
            date_to = ''
         } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            ...(item_model && { item_model }),
            ...(type && { type }),
            ...(id_penyimpanan && { id_penyimpanan }),
            ...((date_from || date_to) && {
               createdAt: {
                  ...(date_from && { $gte: new Date(date_from) }),
                  ...(date_to && { $lte: new Date(new Date(date_to).setHours(23, 59, 59, 999)) })
               }
            })
         }

         // Search by nama item
         if (search) {
            const [alat_ids, bahan_ids] = await Promise.all([
               AlatLab.find({
                  $or: [
                     { nama_alat: { $regex: search, $options: 'i' } },
                     { spesifikasi: { $regex: search, $options: 'i' } }
                  ]
               }).distinct('_id'),
               BahanKimia.find({
                  $or: [
                     { nama_bahan: { $regex: search, $options: 'i' } },
                     { rumus_kimia: { $regex: search, $options: 'i' } },
                     { spesifikasi: { $regex: search, $options: 'i' } }
                  ]
               }).distinct('_id')
            ])

            filter.$or = [
               { item_id: { $in: alat_ids } },
               { item_id: { $in: bahan_ids } },
               { deskripsi: { $regex: search, $options: 'i' } }
            ]
         }

         const total_data = await StockMovement.countDocuments(filter)
         const data = await StockMovement.find(filter)
            .populate({
               path: 'item_id',
               populate: { path: 'id_penyimpanan', select: 'penyimpanan' }
            })
            .populate('id_penyimpanan', 'penyimpanan')
            .populate('created_by', 'nama_lengkap email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(per_page)

         // Summary count per type untuk keperluan stat card di frontend
         const [total_in, total_out, total_adjustment] = await Promise.all([
            StockMovement.countDocuments({ ...filter, type: 'IN' }),
            StockMovement.countDocuments({ ...filter, type: 'OUT' }),
            StockMovement.countDocuments({ ...filter, type: 'ADJUSTMENT' }),
         ])

         return res.status(200).json({
            success: true,
            data,
            summary: {
               total_in,
               total_out,
               total_adjustment
            },
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

   // ==============================
   // GET BY ITEM — riwayat movement 1 item
   // ==============================
   get_movement_by_item: async (req, res) => {
      try {
         const { item_id } = req.params
         const {
            page = 1,
            limit = 10,
            type = '',
            date_from = '',
            date_to = ''
         } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            item_id,
            ...(type && { type }),
            ...((date_from || date_to) && {
               createdAt: {
                  ...(date_from && { $gte: new Date(date_from) }),
                  ...(date_to && { $lte: new Date(new Date(date_to).setHours(23, 59, 59, 999)) })
               }
            })
         }

         const total_data = await StockMovement.countDocuments(filter)
         const data = await StockMovement.find(filter)
            .populate('id_penyimpanan', 'penyimpanan')
            .populate('created_by', 'nama_lengkap email')
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

   // ==============================
   // DELETE
   // ==============================
   delete_stock_movement: async (req, res) => {
      try {
         const { id } = req.params

         const data = await StockMovement.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data stock movement tidak ditemukan'
            })
         }

         await StockMovement.deleteOne({ _id: id })

         return res.status(200).json({
            success: true,
            message: 'Stock movement berhasil dihapus'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }
}

module.exports = stock_movement_controller