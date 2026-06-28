const StockIn = require('../../model/inventory/stock_in_model')
const StockMovement = require('../../model/inventory/stock_movement_model')
const AlatLab = require('../../model/inventory/alat_lab_model')
const BahanKimia = require('../../model/inventory/bahan_kimia_model')
const Penyimpanan = require('../../model/inventory/penyimpanan_model')

const stock_in_controller = {

   // ==============================
   // GET ALL + GET BY ID
   // ==============================
   get_stock_in: async (req, res) => {
      try {
         const { id } = req.params

         // GET BY ID
         if (id) {
            const data = await StockIn.findOne({ _id: id })
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
                  message: 'Data stock in tidak ditemukan'
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
            id_penyimpanan = '',
            date_from = '',
            date_to = ''
         } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            ...(item_model && { item_model }),
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

         const total_data = await StockIn.countDocuments(filter)
         const data = await StockIn.find(filter)
            .populate({
               path: 'item_id',
               populate: { path: 'id_penyimpanan', select: 'penyimpanan' }
            })
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
   // ADD — otomatis buat StockMovement
   // ==============================
   add_stock_in: async (req, res) => {
      try {
         const body = req.body
         const created_by = req.user._id

         if (!body.item_id) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Item wajib dipilih'
            })
         }

         if (!body.item_model) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Item model wajib diisi'
            })
         }

         if (!['AlatLab', 'BahanKimia'].includes(body.item_model)) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Item model harus AlatLab atau BahanKimia'
            })
         }

         if (!body.quantity || body.quantity < 1) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Quantity wajib diisi dan minimal 1'
            })
         }

         if (!body.id_penyimpanan) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Lokasi penyimpanan wajib diisi'
            })
         }

         // Validasi penyimpanan exists
         const penyimpanan = await Penyimpanan.findOne({ _id: body.id_penyimpanan })
         if (!penyimpanan) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Lokasi penyimpanan tidak ditemukan'
            })
         }

         // Ambil item & validasi exists
         const Model = body.item_model === 'AlatLab' ? AlatLab : BahanKimia
         const item = await Model.findOne({ _id: body.item_id })
         if (!item) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Item tidak ditemukan'
            })
         }

         // Hitung stok
         const field_stok = body.item_model === 'AlatLab' ? 'quantity' : 'jumlah'
         const previous_stock = item[field_stok]
         const new_stock = previous_stock + parseInt(body.quantity)

         // 1. Simpan StockIn
         const stock_in = new StockIn({
            item_id: body.item_id,
            item_model: body.item_model,
            quantity: body.quantity,
            spesifikasi: body.spesifikasi || '',
            deskripsi: body.deskripsi || '',
            id_penyimpanan: body.id_penyimpanan,
            created_by
         })
         await stock_in.save()

         // 2. Update stok item
         await Model.updateOne({ _id: body.item_id }, { [field_stok]: new_stock })

         // 3. Buat StockMovement
         const movement = new StockMovement({
            item_id: body.item_id,
            item_model: body.item_model,
            id_penyimpanan: body.id_penyimpanan,
            type: 'IN',
            quantity: body.quantity,
            previous_stock,
            new_stock,
            deskripsi: body.deskripsi || '',
            created_by
         })
         await movement.save()

         // Populate response
         await stock_in.populate([
            {
               path: 'item_id',
               populate: { path: 'id_penyimpanan', select: 'penyimpanan' }
            },
            { path: 'id_penyimpanan', select: 'penyimpanan' },
            { path: 'created_by', select: 'nama_lengkap email' }
         ])

         return res.status(200).json({
            success: true,
            message: 'Stock in berhasil ditambahkan',
            data: stock_in,
            stock_movement: movement
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

   // ==============================
   // DELETE + ROLLBACK
   // ==============================
   delete_stock_in: async (req, res) => {
      try {
         const { id } = req.params

         const data = await StockIn.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data stock in tidak ditemukan'
            })
         }

         // Rollback stok item
         const Model = data.item_model === 'AlatLab' ? AlatLab : BahanKimia
         const field_stok = data.item_model === 'AlatLab' ? 'quantity' : 'jumlah'
         const item = await Model.findOne({ _id: data.item_id })

         if (item) {
            const rolled_back = Math.max(0, item[field_stok] - data.quantity)
            await Model.updateOne({ _id: data.item_id }, { [field_stok]: rolled_back })
         }

         // Hapus StockMovement terkait
         await StockMovement.deleteOne({
            item_id: data.item_id,
            item_model: data.item_model,
            type: 'IN',
            quantity: data.quantity,
            createdAt: data.createdAt
         })

         await StockIn.deleteOne({ _id: id })

         return res.status(200).json({
            success: true,
            message: 'Stock in berhasil dihapus dan stok telah di-rollback'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }
}

module.exports = stock_in_controller