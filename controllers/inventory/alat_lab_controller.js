const AlatLab = require('../../model/inventory_system/inventaris/alat_lab_model')
const Penyimpanan = require('../../model/inventory_system/master/penyimpanan_model')

const alat_lab_controller = {

   // ==============================
   // GET ALL + GET BY ID
   // ==============================
   get_alat_lab: async (req, res) => {
      try {
         const { id } = req.params

         // GET BY ID
         if (id) {
            const data = await AlatLab.findOne({ _id: id }).populate('id_penyimpanan', 'penyimpanan')
            if (!data) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Data alat lab tidak ditemukan'
               })
            }

            return res.status(200).json({
               success: true,
               data
            })
         }

         // GET ALL + SEARCH + FILTER + PAGINATION
         const { page = 1, limit = 10, search = '', id_penyimpanan = '' } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            ...(search && {
               $or: [
                  { nama_alat: { $regex: search, $options: 'i' } },
                  { spesifikasi: { $regex: search, $options: 'i' } },
                  { merk: { $regex: search, $options: 'i' } }
               ]
            }),
            ...(id_penyimpanan && { id_penyimpanan })
         }

         const total_data = await AlatLab.countDocuments(filter)
         const data = await AlatLab.find(filter)
            .populate('id_penyimpanan', 'penyimpanan')
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
   // ADD
   // ==============================
   add_alat_lab: async (req, res) => {
      try {
         const body = req.body

         if (!body.nama_alat) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Nama alat wajib diisi'
            })
         }

         if (body.quantity === undefined || body.quantity === null || body.quantity === '') {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Quantity wajib diisi'
            })
         }

         if (body.quantity < 0) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Quantity tidak boleh kurang dari 0'
            })
         }

         if (!body.id_penyimpanan) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Lokasi penyimpanan wajib diisi'
            })
         }

         // Validasi id_penyimpanan exists
         const penyimpanan = await Penyimpanan.findOne({ _id: body.id_penyimpanan })
         if (!penyimpanan) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Lokasi penyimpanan tidak ditemukan'
            })
         }

         const data = new AlatLab({
            nama_alat: body.nama_alat,
            spesifikasi: body.spesifikasi || '',
            quantity: body.quantity,
            merk: body.merk || '',
            suppliers: body.suppliers || [],
            id_penyimpanan: body.id_penyimpanan
         })

         await data.save()
         await data.populate('id_penyimpanan', 'penyimpanan')

         return res.status(200).json({
            success: true,
            message: 'Alat lab berhasil ditambahkan',
            data
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

   // ==============================
   // UPDATE
   // ==============================
   update_alat_lab: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body

         const data = await AlatLab.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data alat lab tidak ditemukan'
            })
         }

         if (body.quantity !== undefined && body.quantity < 0) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Quantity tidak boleh kurang dari 0'
            })
         }

         // Validasi id_penyimpanan exists jika dikirim
         if (body.id_penyimpanan) {
            const penyimpanan = await Penyimpanan.findOne({ _id: body.id_penyimpanan })
            if (!penyimpanan) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Lokasi penyimpanan tidak ditemukan'
               })
            }
         }

         await AlatLab.updateOne({ _id: id }, body)

         return res.status(200).json({
            success: true,
            message: 'Alat lab berhasil diperbarui'
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
   delete_alat_lab: async (req, res) => {
      try {
         const { id } = req.params

         const data = await AlatLab.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data alat lab tidak ditemukan'
            })
         }

         await AlatLab.deleteOne({ _id: id })

         return res.status(200).json({
            success: true,
            message: 'Alat lab berhasil dihapus'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }
}

module.exports = alat_lab_controller