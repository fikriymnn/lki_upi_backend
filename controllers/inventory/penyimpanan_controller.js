const Penyimpanan = require('../../model/inventory/penyimpanan_model')

const penyimpanan_controller = {
   get_penyimpanan: async (req, res) => {
      try {
         const { id } = req.params

         // ======================
         // GET BY ID
         // ======================
         if (id) {
            const data = await Penyimpanan.findOne({ _id: id })
            if (!data) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Data penyimpanan tidak ditemukan'
               })
            }

            return res.status(200).json({
               success: true,
               data
            })
         }

         // ======================
         // GET ALL + SEARCH + PAGINATION
         // ======================
         const { page = 1, limit = 10, search = '' } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            penyimpanan: { $regex: search, $options: 'i' }
         }

         const total_data = await Penyimpanan.countDocuments(filter)
         const data = await Penyimpanan.find(filter)
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

   add_penyimpanan: async (req, res) => {
      try {
         const body = req.body

         if (!body.penyimpanan) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Nama penyimpanan wajib diisi'
            })
         }

         const exist = await Penyimpanan.findOne({ penyimpanan: body.penyimpanan })
         if (exist) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Penyimpanan sudah ada'
            })
         }

         const data = new Penyimpanan({
            penyimpanan: body.penyimpanan
         })

         await data.save()

         return res.status(200).json({
            success: true,
            message: 'Penyimpanan berhasil ditambahkan',
            data
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

   update_penyimpanan: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body

         const data = await Penyimpanan.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data penyimpanan tidak ditemukan'
            })
         }

         // Cegah duplikasi unique
         if (body.penyimpanan) {
            const exist = await Penyimpanan.findOne({
               penyimpanan: body.penyimpanan,
               _id: { $ne: id }
            })
            if (exist) {
               return res.status(200).json({
                  success: false,
                  status: 400,
                  message: 'Nama penyimpanan sudah digunakan'
               })
            }
         }

         await Penyimpanan.updateOne({ _id: id }, body)

         return res.status(200).json({
            success: true,
            message: 'Penyimpanan berhasil diperbarui'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

   delete_penyimpanan: async (req, res) => {
      try {
         const { id } = req.params

         const data = await Penyimpanan.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data penyimpanan tidak ditemukan'
            })
         }

         await Penyimpanan.deleteOne({ _id: id })

         return res.status(200).json({
            success: true,
            message: 'Penyimpanan berhasil dihapus'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }
}

module.exports = penyimpanan_controller
