const BahanKimia = require('../../model/inventory/bahan_kimia_model')
const Penyimpanan = require('../../model/inventory_system/master/')

const bahan_kimia_controller = {

   // ==============================
   // GET ALL + GET BY ID
   // ==============================
   get_bahan_kimia: async (req, res) => {
      try {
         const { id } = req.params

         // GET BY ID
         if (id) {
            const data = await BahanKimia.findOne({ _id: id }).populate('id_penyimpanan', 'penyimpanan')
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

         // GET ALL + SEARCH + FILTER + PAGINATION
         const {
            page = 1,
            limit = 10,
            search = '',
            jenis_bahan = '',
            satuan = '',
            id_penyimpanan = ''
         } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            ...(search && {
               $or: [
                  { nama_bahan: { $regex: search, $options: 'i' } },
                  { rumus_kimia: { $regex: search, $options: 'i' } },
                  { spesifikasi: { $regex: search, $options: 'i' } },
                  { merk: { $regex: search, $options: 'i' } }
               ]
            }),
            ...(jenis_bahan && { jenis_bahan }),
            ...(satuan && { satuan }),
            ...(id_penyimpanan && { id_penyimpanan })
         }

         const total_data = await BahanKimia.countDocuments(filter)
         const data = await BahanKimia.find(filter)
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
   add_bahan_kimia: async (req, res) => {
      try {
         const body = req.body

         if (!body.nama_bahan) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Nama bahan wajib diisi'
            })
         }

         if (!body.rumus_kimia) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Rumus kimia wajib diisi'
            })
         }

         if (!body.jenis_bahan) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Jenis bahan wajib diisi'
            })
         }

         if (!['larutan', 'padatan'].includes(body.jenis_bahan)) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Jenis bahan harus larutan atau padatan'
            })
         }

         if (body.jumlah === undefined || body.jumlah === null || body.jumlah === '') {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Jumlah wajib diisi'
            })
         }

         if (body.jumlah < 0) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Jumlah tidak boleh kurang dari 0'
            })
         }

         if (!body.satuan) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Satuan wajib diisi'
            })
         }

         if (!['mL', 'g'].includes(body.satuan)) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Satuan harus mL atau g'
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

         const data = new BahanKimia({
            nama_bahan: body.nama_bahan,
            rumus_kimia: body.rumus_kimia,
            spesifikasi: body.spesifikasi || '',
            jenis_bahan: body.jenis_bahan,
            jumlah: body.jumlah,
            satuan: body.satuan,
            merk: body.merk || '',
            suppliers: body.suppliers || [],
            id_penyimpanan: body.id_penyimpanan,
            tanggal_kadaluarsa: body.tanggal_kadaluarsa || null
         })

         await data.save()
         await data.populate('id_penyimpanan', 'penyimpanan')

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

   // ==============================
   // UPDATE
   // ==============================
   update_bahan_kimia: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body

         const data = await BahanKimia.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({
               success: false,
               status: 404,
               message: 'Data bahan kimia tidak ditemukan'
            })
         }

         if (body.jenis_bahan && !['larutan', 'padatan'].includes(body.jenis_bahan)) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Jenis bahan harus larutan atau padatan'
            })
         }

         if (body.satuan && !['mL', 'g'].includes(body.satuan)) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Satuan harus mL atau g'
            })
         }

         if (body.jumlah !== undefined && body.jumlah < 0) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'Jumlah tidak boleh kurang dari 0'
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

   // ==============================
   // DELETE
   // ==============================
   delete_bahan_kimia: async (req, res) => {
      try {
         const { id } = req.params

         const data = await BahanKimia.findOne({ _id: id })
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