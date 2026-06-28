const Supplier = require('../../model/inventory_system/master/supplier_model')

const supplier_controller = {

   // ==============================
   // GET ALL + GET BY ID
   // ==============================
   get_supplier: async (req, res) => {
      try {
         const { id } = req.params

         // GET BY ID
         if (id) {
            const data = await Supplier.findOne({ _id: id })
            if (!data) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Data supplier tidak ditemukan'
               })
            }

            return res.status(200).json({
               success: true,
               data
            })
         }

         // GET ALL + SEARCH + FILTER + PAGINATION
         const { page = 1, limit = 10, search = '', alamat = '' } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            nama_supplier: { $regex: search, $options: 'i' },
            ...(alamat && { alamat: { $regex: alamat, $options: 'i' } })
         }

         const total_data = await Supplier.countDocuments(filter)
         const data = await Supplier.find(filter)
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
   add_supplier: async (req, res) => {
      try {
         const body = req.body

         if (!body.nama_supplier) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Nama supplier wajib diisi'
            })
         }

         if (!body.alamat) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Alamat wajib diisi'
            })
         }

         if (!body.no_wa) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'No WhatsApp wajib diisi'
            })
         }

         const data = new Supplier({
            nama_supplier: body.nama_supplier,
            alamat: body.alamat,
            no_wa: body.no_wa
         })

         await data.save()

         return res.status(200).json({
            success: true,
            message: 'Supplier berhasil ditambahkan',
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
   update_supplier: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body

         const data = await Supplier.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data supplier tidak ditemukan'
            })
         }

         await Supplier.updateOne({ _id: id }, body)

         return res.status(200).json({
            success: true,
            message: 'Supplier berhasil diperbarui'
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
   delete_supplier: async (req, res) => {
      try {
         const { id } = req.params

         const data = await Supplier.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data supplier tidak ditemukan'
            })
         }

         await Supplier.deleteOne({ _id: id })

         return res.status(200).json({
            success: true,
            message: 'Supplier berhasil dihapus'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }
}

module.exports = supplier_controller