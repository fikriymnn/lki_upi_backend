const Peminjam = require('../../model/inventory/peminjam_model')

const peminjam_controller = {
   get_peminjam: async (req, res) => {
      try {
         const { id } = req.params

         // ======================
         // GET BY ID
         // ======================
         if (id) {
            const data = await Peminjam.findOne({ _id: id })
            if (!data) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Data peminjam tidak ditemukan'
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
            $or: [
               { name: { $regex: search, $options: 'i' } },
               { nik: { $regex: search, $options: 'i' } },
               { institusi: { $regex: search, $options: 'i' } },
               { fakultas: { $regex: search, $options: 'i' } },
               { jurusan: { $regex: search, $options: 'i' } },
               { phone: { $regex: search, $options: 'i' } },
               { email: { $regex: search, $options: 'i' } }
            ]
         }

         const total_data = await Peminjam.countDocuments(filter)
         const data = await Peminjam.find(filter)
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

   add_peminjam: async (req, res) => {
      try {
         const body = req.body

         if (!body.name || !body.nik || !body.status || !body.institusi || !body.phone || !body.email) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Field wajib belum lengkap'
            })
         }

         const exist = await Peminjam.findOne({ nik: body.nik })
         if (exist) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'NIK sudah terdaftar'
            })
         }

         const data = new Peminjam({
            name: body.name,
            nik: body.nik,
            status: body.status,
            institusi: body.institusi,
            fakultas: body.fakultas,
            jurusan: body.jurusan,
            phone: body.phone,
            alamat: body.alamat,
            email: body.email
         })

         await data.save()

         return res.status(200).json({
            success: true,
            message: 'Peminjam berhasil ditambahkan',
            data
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

   update_peminjam: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body

         const data = await Peminjam.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data peminjam tidak ditemukan'
            })
         }

         // Cegah duplikasi NIK
         if (body.nik) {
            const exist = await Peminjam.findOne({
               nik: body.nik,
               _id: { $ne: id }
            })
            if (exist) {
               return res.status(200).json({
                  success: false,
                  status: 400,
                  message: 'NIK sudah digunakan'
               })
            }
         }

         await Peminjam.updateOne({ _id: id }, body)

         return res.status(200).json({
            success: true,
            message: 'Peminjam berhasil diperbarui'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

   delete_peminjam: async (req, res) => {
      try {
         const { id } = req.params

         const data = await Peminjam.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data peminjam tidak ditemukan'
            })
         }

         await Peminjam.deleteOne({ _id: id })

         return res.status(200).json({
            success: true,
            message: 'Peminjam berhasil dihapus'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }
}

module.exports = peminjam_controller
