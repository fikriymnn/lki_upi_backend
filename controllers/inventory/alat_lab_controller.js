const AlatLab = require('../../model/inventory/alat_lab_model')

const alat_lab_controller = {
   get_alat_lab: async (req, res) => {
      try {
         const { id } = req.params

         // ======================
         // GET BY ID
         // ======================
         if (id) {
            const data = await AlatLab.findOne({ _id: id })
            if (!data) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Data alat laboratorium tidak ditemukan'
               })
            }

            return res.status(200).json({
               success: true,
               data
            })
         }

         // ======================
         // GET ALL + SEARCH + FILTER + PAGINATION
         // ======================
         const {
            page = 1,
            limit = 10,
            search = '',
            penyimpanan
         } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         let filter = {
            $or: [
               { nama_alat: { $regex: search, $options: 'i' } },
               { spesifikasi: { $regex: search, $options: 'i' } },
               { merk_brand: { $regex: search, $options: 'i' } },
               { 'suppliers.nama_supplier': { $regex: search, $options: 'i' } }
            ]
         }

         // ======================
         // FILTER PENYIMPANAN
         // ======================
         if (penyimpanan) {
            filter.penyimpanan = penyimpanan
         }

         const total_data = await AlatLab.countDocuments(filter)
         const data = await AlatLab.find(filter)
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

   add_alat_lab: async (req, res) => {
      try {
         const body = req.body

         if (!body.nama_alat || body.jumlah === undefined || !body.penyimpanan) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Field wajib belum lengkap'
            })
         }

         const data = new AlatLab({
            nama_alat: body.nama_alat,
            spesifikasi: body.spesifikasi,
            jumlah: body.jumlah,
            merk_brand: body.merk_brand,
            suppliers: body.suppliers || [],
            penyimpanan: body.penyimpanan
         })

         await data.save()

         return res.status(200).json({
            success: true,
            message: 'Alat laboratorium berhasil ditambahkan',
            data
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

   update_alat_lab: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body

         const data = await AlatLab.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data alat laboratorium tidak ditemukan'
            })
         }

         await AlatLab.updateOne({ _id: id }, body)

         return res.status(200).json({
            success: true,
            message: 'Alat laboratorium berhasil diperbarui'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

   delete_alat_lab: async (req, res) => {
      try {
         const { id } = req.params

         const data = await AlatLab.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data alat laboratorium tidak ditemukan'
            })
         }

         await AlatLab.deleteOne({ _id: id })

         return res.status(200).json({
            success: true,
            message: 'Alat laboratorium berhasil dihapus'
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
