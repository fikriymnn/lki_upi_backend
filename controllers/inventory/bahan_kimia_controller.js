const BahanKimia = require('../../model/inventory/bahan_kimia_model')
const Penyimpanan = require('../../model/inventory/penyimpanan_model')

const bahan_kimia_controller = {

   // ======================
   // GET ALL + GET BY ID
   // ======================
   get_bahan_kimia: async (req, res) => {
      try {
         const { id } = req.params

         if (id) {
            const data = await BahanKimia.findById(id).populate('id_penyimpanan')
            if (!data) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Data bahan kimia tidak ditemukan'
               })
            }
            return res.status(200).json({
               success: true,
               data
            })
         }

         const {
            page = 1,
            limit = 10,
            search = '',
            id_penyimpanan,
            jenis_bahan,
            kadaluarsa
         } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            $or: [
               { nama_bahan: { $regex: search, $options: 'i' } },
               { rumus_kimia: { $regex: search, $options: 'i' } },
               { spesifikasi: { $regex: search, $options: 'i' } },
               { merk: { $regex: search, $options: 'i' } },
               { 'suppliers.nama_supplier': { $regex: search, $options: 'i' } }
            ]
         }

         if (id_penyimpanan) {
            filter.id_penyimpanan = id_penyimpanan
         }

         if (jenis_bahan) {
            filter.jenis_bahan = jenis_bahan
         }

         // ======================
         // FILTER KADALUARSA
         // expired = sudah kadaluarsa
         // expiring_soon = kadaluarsa dalam 30 hari
         // ======================
         if (kadaluarsa === 'expired') {
            filter.tanggal_kadaluarsa = { $lt: new Date() }
         } else if (kadaluarsa === 'expiring_soon') {
            const now = new Date()
            const thirty_days = new Date()
            thirty_days.setDate(thirty_days.getDate() + 30)
            filter.tanggal_kadaluarsa = { $gte: now, $lte: thirty_days }
         }

         const total_data = await BahanKimia.countDocuments(filter)
         const data = await BahanKimia.find(filter)
            .populate('id_penyimpanan')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(per_page)

         // ======================
         // STATS UNTUK STAT CARDS
         // ======================
         const total_larutan = await BahanKimia.countDocuments({ jenis_bahan: 'larutan' })
         const total_padatan = await BahanKimia.countDocuments({ jenis_bahan: 'padatan' })
         const stok_menipis = await BahanKimia.countDocuments({ jumlah: { $lt: 500 } })
         const now = new Date()
         const thirty_days = new Date()
         thirty_days.setDate(thirty_days.getDate() + 30)
         const exp_alert = await BahanKimia.countDocuments({
            tanggal_kadaluarsa: {
               $ne: null,
               $lte: thirty_days
            }
         })

         return res.status(200).json({
            success: true,
            data,
            stats: {
               total_larutan,
               total_padatan,
               stok_menipis,
               exp_alert
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

   // ======================
   // ADD
   // ======================
   add_bahan_kimia: async (req, res) => {
      try {
         const body = req.body

         if (
            !body.nama_bahan ||
            !body.rumus_kimia ||
            !body.jenis_bahan ||
            body.jumlah === undefined ||
            !body.satuan ||
            !body.id_penyimpanan
         ) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Field wajib belum lengkap'
            })
         }

         const penyimpanan = await Penyimpanan.findById(body.id_penyimpanan)
         if (!penyimpanan) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Lokasi penyimpanan tidak ditemukan'
            })
         }

         if (body.suppliers && body.suppliers.length === 0) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Mohon tambahkan minimal satu supplier'
            })
         }

         const data = new BahanKimia({
            nama_bahan: body.nama_bahan,
            rumus_kimia: body.rumus_kimia,
            spesifikasi: body.spesifikasi,
            jenis_bahan: body.jenis_bahan,
            jumlah: body.jumlah,
            satuan: body.satuan,
            merk: body.merk,
            suppliers: body.suppliers || [],
            id_penyimpanan: body.id_penyimpanan,
            tanggal_kadaluarsa: body.tanggal_kadaluarsa || null
         })

         await data.save()

         return res.status(200).json({
            success: true,
            message: 'Bahan kimia berhasil ditambahkan',
            data
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

   // ======================
   // UPDATE
   // ======================
   update_bahan_kimia: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body

         const data = await BahanKimia.findById(id)
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data bahan kimia tidak ditemukan'
            })
         }

         if (body.id_penyimpanan) {
            const penyimpanan = await Penyimpanan.findById(body.id_penyimpanan)
            if (!penyimpanan) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Lokasi penyimpanan tidak ditemukan'
               })
            }
         }

         if (body.suppliers && body.suppliers.length === 0) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Mohon tambahkan minimal satu supplier'
            })
         }

         await BahanKimia.updateOne({ _id: id }, body)

         return res.status(200).json({
            success: true,
            message: 'Bahan kimia berhasil diperbarui'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   },

   // ======================
   // DELETE
   // ======================
   delete_bahan_kimia: async (req, res) => {
      try {
         const { id } = req.params

         const data = await BahanKimia.findById(id)
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data bahan kimia tidak ditemukan'
            })
         }

         await BahanKimia.deleteOne({ _id: id })

         return res.status(200).json({
            success: true,
            message: 'Bahan kimia berhasil dihapus'
         })
      } catch (err) {
         return res.status(500).json({
            success: false,
            message: err.message
         })
      }
   }
}

module.exports = bahan_kimia_controller