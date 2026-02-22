const Supplier = require('../../model/inventory/supplier_model')

const supplier_controller = {
   create_supplier: async (req, res) => {
      try {
         const body = req.body

         if (!body.nama_supplier || !body.alamat || !body.no_wa) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Semua field wajib diisi'
            })
         }

         const supplier = new Supplier({
            nama_supplier: body.nama_supplier,
            alamat: body.alamat,
            no_wa: body.no_wa
         })

         await supplier.save()

         return res.status(200).json({
            success: true,
            message: 'Supplier berhasil ditambahkan',
            data: supplier
         })
      } catch (err) {
         console.log(err.message)
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

get_all_supplier: async (req, res) => {
      try {
         const { page = 1, limit = 10, search = '' } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            $or: [
               { nama_supplier: { $regex: search, $options: 'i' } },
               { alamat: { $regex: search, $options: 'i' } },
               { no_wa: { $regex: search, $options: 'i' } }
            ]
         }

         const total_data = await Supplier.countDocuments(filter)
         const suppliers = await Supplier.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(per_page)

         return res.status(200).json({
            success: true,
            data: suppliers,
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

   get_supplier_by_id: async (req, res) => {
      try {
         const { id } = req.params

         const supplier = await Supplier.findOne({ _id: id })
         if (!supplier) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Supplier tidak ditemukan'
            })
         }

         return res.status(200).json({
            success: true,
            data: supplier
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: 'ID tidak valid'
         })
      }
   },

   update_supplier: async (req, res) => {
      try {
         const body = req.body
         const { id } = req.params

         const supplier = await Supplier.findOne({ _id: id })
         if (!supplier) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Supplier tidak ditemukan'
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

   delete_supplier: async (req, res) => {
      try {
         const { id } = req.params

         const supplier = await Supplier.findOne({ _id: id })
         if (!supplier) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Supplier tidak ditemukan'
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
