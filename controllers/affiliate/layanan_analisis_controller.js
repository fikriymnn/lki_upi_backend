const MasterLayananAnalisis = require('../../model/affiliate/layanan_analisis_model')

const master_layanan_analisis_controller = {

   // ==============================
   // GET ALL (per affiliate) + GET BY ID
   // ==============================
   get_layanan_analisis: async (req, res) => {
      try {
         const { id } = req.params

         // GET BY ID
         if (id) {
            const data = await MasterLayananAnalisis.findOne({ _id: id }).populate('id_affiliate', 'nama_laboratorium')
            if (!data) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Data layanan analisis tidak ditemukan'
               })
            }

            return res.status(200).json({
               success: true,
               data
            })
         }

         // GET ALL (wajib scoped per affiliate) + SEARCH + FILTER STATUS + PAGINATION
         const { page = 1, limit = 10, search = '', id_affiliate = '', is_active = '' } = req.query

         if (!id_affiliate) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'id_affiliate wajib diisi'
            })
         }

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            id_affiliate,
            nama_layanan: { $regex: search, $options: 'i' },
            ...(is_active !== '' && { is_active: is_active === 'true' })
         }

         const total_data = await MasterLayananAnalisis.countDocuments(filter)
         const data = await MasterLayananAnalisis.find(filter)
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
   add_layanan_analisis: async (req, res) => {
      try {
         const body = req.body

         if (!body.id_affiliate) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Lab affiliate wajib diisi'
            })
         }

         if (!body.nama_layanan || !body.nama_layanan.trim()) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Nama layanan wajib diisi'
            })
         }

         const data = new MasterLayananAnalisis({
            id_affiliate: body.id_affiliate,
            nama_layanan: body.nama_layanan,
            is_active: body.is_active ?? true
         })

         await data.save()

         return res.status(200).json({
            success: true,
            message: 'Layanan analisis berhasil ditambahkan',
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
   // UPDATE (termasuk toggle is_active dari FE)
   // ==============================
   update_layanan_analisis: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body

         const data = await MasterLayananAnalisis.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data layanan analisis tidak ditemukan'
            })
         }

         if (body.nama_layanan !== undefined && !body.nama_layanan.trim()) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Nama layanan tidak boleh kosong'
            })
         }

         await MasterLayananAnalisis.updateOne({ _id: id }, body)

         return res.status(200).json({
            success: true,
            message: 'Layanan analisis berhasil diperbarui'
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
   delete_layanan_analisis: async (req, res) => {
      try {
         const { id } = req.params

         const data = await MasterLayananAnalisis.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data layanan analisis tidak ditemukan'
            })
         }

         await MasterLayananAnalisis.deleteOne({ _id: id })

         return res.status(200).json({
            success: true,
            message: 'Layanan analisis berhasil dihapus'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }
}

module.exports = master_layanan_analisis_controller