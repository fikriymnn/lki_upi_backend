const LabAffiliate = require('../../model/affiliate/lab_affiliate_model')
const Catalog = require('../../model/affiliate/catalog_model')
const lab_affiliate_controller = {

   // ==============================
   // GET ALL + GET BY ID
   // ==============================
   get_lab_affiliate: async (req, res) => {
      try {
         const { id } = req.params

         if (id) {
            const data = await LabAffiliate.findOne({ _id: id })
            if (!data) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Data lab affiliate tidak ditemukan'
               })
            }
            return res.status(200).json({ success: true, data })
         }

         const { page = 1, limit = 10, search = '' } = req.query

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {
            nama_laboratorium: { $regex: search, $options: 'i' }
         }

         const total_data = await LabAffiliate.countDocuments(filter)
         const data = await LabAffiliate.find(filter)
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
         return res.status(500).json({ success: false, message: err.message })
      }
   },
     // ==============================
   // GET PUBLIC (untuk halaman /affiliate) — hanya lab berstatus aktif,
   // dilengkapi jenis_layanan_aktif hasil distinct dari Catalog milik lab tsb
   // ==============================
   get_lab_affiliate_public: async (req, res) => {
      try {
         const labs = await LabAffiliate.find({ status: 'aktif' }).sort({ createdAt: -1 })

         const ids = labs.map((l) => l._id)
         const catalogs = await Catalog.find({ id_affiliate: { $in: ids } }).select('id_affiliate tipe_layanan')

         const jenisByAffiliate = {}
         catalogs.forEach((c) => {
            const key = String(c.id_affiliate)
            if (!jenisByAffiliate[key]) jenisByAffiliate[key] = new Set()
            jenisByAffiliate[key].add(c.tipe_layanan)
         })

         const data = labs.map((l) => ({
            ...l.toObject(),
            jenis_layanan_aktif: Array.from(jenisByAffiliate[String(l._id)] || [])
         }))

         return res.status(200).json({ success: true, data })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   // ==============================
   // ADD
   // ==============================
   add_lab_affiliate: async (req, res) => {
      try {
         const body = req.body

         if (!body.nama_laboratorium || !body.nama_laboratorium.trim()) {
            return res.status(200).json({ success: false, status: 400, message: 'Nama laboratorium wajib diisi' })
         }
         if (!body.kode_laboratorium || !body.kode_laboratorium.trim()) {
            return res.status(200).json({ success: false, status: 400, message: 'Kode laboratorium wajib diisi (dipakai untuk penomoran invoice, contoh: LKOB)' })
         }
         if (!body.no_whatsapp || !body.no_whatsapp.trim()) {
            return res.status(200).json({ success: false, status: 400, message: 'No WhatsApp wajib diisi' })
         }
         if (!body.email || !body.email.trim()) {
            return res.status(200).json({ success: false, status: 400, message: 'Email wajib diisi' })
         }

         const kode_exists = await LabAffiliate.findOne({ kode_laboratorium: body.kode_laboratorium.trim().toUpperCase() })
         if (kode_exists) {
            return res.status(200).json({ success: false, status: 400, message: 'Kode laboratorium sudah digunakan lab lain' })
         }

         const data = new LabAffiliate({
            nama_laboratorium: body.nama_laboratorium,
            kode_laboratorium: body.kode_laboratorium.trim().toUpperCase(),
            no_whatsapp: body.no_whatsapp,
            email: body.email,
            alamat: body.alamat
         })

         await data.save()

         return res.status(200).json({
            success: true,
            message: 'Lab affiliate berhasil ditambahkan',
            data
         })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   // ==============================
   // UPDATE
   // ==============================
   update_lab_affiliate: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body

         const data = await LabAffiliate.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({ success: false, status: 404, message: 'Data lab affiliate tidak ditemukan' })
         }

         if (body.nama_laboratorium !== undefined && !body.nama_laboratorium.trim()) {
            return res.status(200).json({ success: false, status: 400, message: 'Nama laboratorium tidak boleh kosong' })
         }

         if (body.kode_laboratorium !== undefined) {
            if (!body.kode_laboratorium.trim()) {
               return res.status(200).json({ success: false, status: 400, message: 'Kode laboratorium tidak boleh kosong' })
            }
            const kode_upper = body.kode_laboratorium.trim().toUpperCase()
            const kode_exists = await LabAffiliate.findOne({ kode_laboratorium: kode_upper, _id: { $ne: id } })
            if (kode_exists) {
               return res.status(200).json({ success: false, status: 400, message: 'Kode laboratorium sudah digunakan lab lain' })
            }
            body.kode_laboratorium = kode_upper
         }

         await LabAffiliate.updateOne({ _id: id }, body)

         return res.status(200).json({ success: true, message: 'Lab affiliate berhasil diperbarui' })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   // ==============================
   // DELETE
   // ==============================
   delete_lab_affiliate: async (req, res) => {
      try {
         const { id } = req.params

         const data = await LabAffiliate.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({ success: false, status: 404, message: 'Data lab affiliate tidak ditemukan' })
         }

         await LabAffiliate.deleteOne({ _id: id })

         return res.status(200).json({ success: true, message: 'Lab affiliate berhasil dihapus' })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   }
}

module.exports = lab_affiliate_controller