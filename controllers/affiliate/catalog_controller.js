const Catalog = require('../../model/affiliate/catalog_model')

const TIPE_LAYANAN = ['sewa_alat', 'sewa_lab', 'layanan_analisis', 'pembelian_bahan']

const cleanTarif = (tarif) =>
   (Array.isArray(tarif) ? tarif : [])
      .filter((t) => t.golongan && t.harga !== '' && t.harga !== undefined && t.harga !== null)
      .map((t) => ({
         segmen: t.segmen,
         golongan: t.golongan,
         varian: t.varian,
         jenis_jasa: t.jenis_jasa,
         harga: Number(t.harga)
      }))

const catalog_controller = {

   // ==============================
   // GET ALL (per affiliate) + GET BY ID
   // ==============================
   get_catalog: async (req, res) => {
      try {
         const { id } = req.params

         if (id) {
            const data = await Catalog.findOne({ _id: id })
            if (!data) {
               return res.status(200).json({
                  success: false,
                  status: 404,
                  message: 'Data katalog tidak ditemukan'
               })
            }
            return res.status(200).json({ success: true, data })
         }

         const { id_affiliate = '' } = req.query

         if (!id_affiliate) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: 'id_affiliate wajib diisi'
            })
         }

         const data = await Catalog.find({ id_affiliate }).sort({ createdAt: -1 })

         return res.status(200).json({
            success: true,
            data
         })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   // ==============================
   // ADD
   // ==============================
   add_catalog: async (req, res) => {
      try {
         const body = req.body

         if (!body.id_affiliate) {
            return res.status(200).json({ success: false, status: 400, message: 'Lab affiliate wajib diisi' })
         }
         if (!TIPE_LAYANAN.includes(body.tipe_layanan)) {
            return res.status(200).json({ success: false, status: 400, message: 'Jenis layanan tidak valid' })
         }
         if (!body.nama_item || !body.nama_item.trim()) {
            return res.status(200).json({ success: false, status: 400, message: 'Nama item wajib diisi' })
         }

         const tarif = cleanTarif(body.tarif)
         if (tarif.length === 0) {
            return res.status(200).json({ success: false, status: 400, message: 'Minimal satu tarif wajib diisi' })
         }

         const data = new Catalog({
            id_affiliate: body.id_affiliate,
            tipe_layanan: body.tipe_layanan,
            sub_kategori: body.sub_kategori,
            nama_item: body.nama_item,
            deskripsi: body.deskripsi,
            metode_analisis: body.metode_analisis,
            satuan: body.satuan,
            jumlah_minimal_sampel: body.jumlah_minimal_sampel,
            keterangan: body.keterangan,
            tarif
         })

         await data.save()

         return res.status(200).json({
            success: true,
            message: 'Katalog berhasil ditambahkan',
            data
         })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   // ==============================
   // UPDATE
   // ==============================
   update_catalog: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body

         const existing = await Catalog.findOne({ _id: id })
         if (!existing) {
            return res.status(200).json({ success: false, status: 404, message: 'Data katalog tidak ditemukan' })
         }

         if (body.nama_item !== undefined && !body.nama_item.trim()) {
            return res.status(200).json({ success: false, status: 400, message: 'Nama item tidak boleh kosong' })
         }

         const update = { ...body }

         if (body.tarif !== undefined) {
            const tarif = cleanTarif(body.tarif)
            if (tarif.length === 0) {
               return res.status(200).json({ success: false, status: 400, message: 'Minimal satu tarif wajib diisi' })
            }
            update.tarif = tarif
         }

         await Catalog.updateOne({ _id: id }, update)

         return res.status(200).json({ success: true, message: 'Katalog berhasil diperbarui' })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   // ==============================
   // DELETE
   // ==============================
   delete_catalog: async (req, res) => {
      try {
         const { id } = req.params

         const data = await Catalog.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({ success: false, status: 404, message: 'Data katalog tidak ditemukan' })
         }

         await Catalog.deleteOne({ _id: id })

         return res.status(200).json({ success: true, message: 'Katalog berhasil dihapus' })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   }
}

module.exports = catalog_controller