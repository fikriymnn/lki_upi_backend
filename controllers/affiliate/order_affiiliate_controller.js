const OrderAffiliate = require('../../model/affiliate/order_affiliate_model')
const LabAffiliate = require('../../model/affiliate/lab_affiliate_model')

const STATUS_OPTIONS = [
   'Menunggu Order Dikonfirmasi',
   'Order Dikonfirmasi',
   'Order Ditolak',
   'Order Diproses',
   'Menunggu Diverifikasi',
   'Selesai Diverifikasi',
   'Menunggu Pembayaran',
   'Menunggu Verifikasi Pembayaran',
   'Selesai',
]

const EDITABLE_FIELDS = [
   'nama_lengkap', 'email', 'no_telp', 'no_whatsapp',
   'jenis_institusi', 'nama_institusi', 'program_studi', 'fakultas',
   'nama_pembimbing', 'catatan',
   'layanan_analisis', 'sewa_lab', 'sewa_alat', 'pembelian_bahan',
]

const STATUS_TRANSITIONS = {
   'Menunggu Order Dikonfirmasi': { targets: ['Order Dikonfirmasi', 'Order Ditolak'], roles: ['laboran'] },
   'Order Dikonfirmasi': { targets: ['Order Diproses'], roles: ['laboran'] },
   'Menunggu Diverifikasi': { targets: ['Selesai Diverifikasi', 'Order Diproses'], roles: ['ketua_lab'] },
   'Menunggu Verifikasi Pembayaran': { targets: ['Selesai'], roles: ['admin', 'superadmin'] },
}

// Kota tempat kuitansi diterbitkan — fixed, bukan dari data lab
const KWITANSI_KOTA = 'Bandung'

// ==============================
// GENERATE NO. INVOICE
// ==============================
const generate_no_invoice = async (id_affiliate) => {
   const lab = await LabAffiliate.findOne({ _id: id_affiliate })
   if (!lab) {
      throw new Error('Lab affiliate tidak ditemukan, tidak bisa membuat no invoice')
   }

   const tahun = new Date().getFullYear()

   const total_order_tahun_ini = await OrderAffiliate.countDocuments({
      id_affiliate,
      year: tahun.toString(),
   })

   const urutan = total_order_tahun_ini + 1
   return `${urutan}/afiliasi/${lab.kode_laboratorium}/${tahun}`
}

// ==============================
// GENERATE NO. KWITANSI — dihitung on-the-fly saat kuitansi di-download, TIDAK disimpan ke DB
// Urutan dihitung dari posisi order ini di antara order berstatus "Selesai" milik lab yang sama,
// di tahun yang sama, sampai waktu order ini selesai (updatedAt) — supaya nomornya stabil
// walau di-download ulang berkali-kali.
// ==============================
const generate_no_kwitansi = async (order) => {
   const lab = order.id_affiliate?.kode_laboratorium
      ? order.id_affiliate
      : await LabAffiliate.findOne({ _id: order.id_affiliate })

   if (!lab) {
      throw new Error('Lab affiliate tidak ditemukan, tidak bisa membuat no kwitansi')
   }

   const tahun = new Date(order.updatedAt).getFullYear()

   const urutan = await OrderAffiliate.countDocuments({
      id_affiliate: lab._id,
      year: tahun.toString(),
      status_pengujian: 'Selesai',
      updatedAt: { $lte: order.updatedAt },
   })

   return `${urutan}/${lab.kode_laboratorium}/UPI/${tahun}`
}

// ==============================
// ANGKA KE TERBILANG (Rupiah) — dipakai untuk "Uang sejumlah" di kwitansi
// ==============================
const SATUAN = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas']

const angka_ke_kata = (n) => {
   n = Math.floor(Math.abs(n))
   if (n < 12) return SATUAN[n]
   if (n < 20) return `${angka_ke_kata(n - 10)} Belas`
   if (n < 100) return `${angka_ke_kata(Math.floor(n / 10))} Puluh${n % 10 !== 0 ? ' ' + angka_ke_kata(n % 10) : ''}`
   if (n < 200) return `Seratus${n - 100 !== 0 ? ' ' + angka_ke_kata(n - 100) : ''}`
   if (n < 1000) return `${angka_ke_kata(Math.floor(n / 100))} Ratus${n % 100 !== 0 ? ' ' + angka_ke_kata(n % 100) : ''}`
   if (n < 2000) return `Seribu${n - 1000 !== 0 ? ' ' + angka_ke_kata(n - 1000) : ''}`
   if (n < 1000000) return `${angka_ke_kata(Math.floor(n / 1000))} Ribu${n % 1000 !== 0 ? ' ' + angka_ke_kata(n % 1000) : ''}`
   if (n < 1000000000) return `${angka_ke_kata(Math.floor(n / 1000000))} Juta${n % 1000000 !== 0 ? ' ' + angka_ke_kata(n % 1000000) : ''}`
   if (n < 1000000000000) return `${angka_ke_kata(Math.floor(n / 1000000000))} Miliar${n % 1000000000 !== 0 ? ' ' + angka_ke_kata(n % 1000000000) : ''}`
   return 'Angka terlalu besar'
}

const terbilang_rupiah = (n) => {
   if (!n || n <= 0) return 'Nol Rupiah'
   return `${angka_ke_kata(n)} Rupiah`.replace(/\s+/g, ' ').trim()
}

// ==============================
// Cek apakah laboran/ketua_lab boleh akses order ini (harus dari lab affiliate yang sama)
// ==============================
const check_affiliate_access = (req, order) => {
   const role = req.user?.role
   if (['laboran', 'ketua_lab'].includes(role)) {
      const own_affiliate = req.user?.id_affiliate?.toString()
      const order_affiliate = (order.id_affiliate?._id || order.id_affiliate)?.toString()
      if (!own_affiliate || own_affiliate !== order_affiliate) {
         return false
      }
   }
   return true
}

const order_affiliate_controller = {

   get_order_affiliate: async (req, res) => {
      try {
         const { id } = req.params
         const role = req.user?.role

         if (id) {
            const data = await OrderAffiliate.findOne({ _id: id })
               .populate('id_affiliate', 'nama_laboratorium kode_laboratorium email no_whatsapp alamat')
               .populate('id_user', 'nama_lengkap email')
            if (!data) {
               return res.status(200).json({ success: false, status: 404, message: 'Data order tidak ditemukan' })
            }

            if (!check_affiliate_access(req, data)) {
               return res.status(200).json({ success: false, status: 403, message: 'Anda tidak memiliki akses ke order lab affiliate lain' })
            }
            if (role === 'user' && data.id_user?._id?.toString() !== req.user._id?.toString()) {
               return res.status(200).json({ success: false, status: 403, message: 'Anda tidak memiliki akses ke order ini' })
            }

            return res.status(200).json({ success: true, data })
         }

         const { id_user, page = 1, limit = 10, search = '', status = '', year = '', month = '' } = req.query
         let { id_affiliate } = req.query

         if (['laboran', 'ketua_lab'].includes(role)) {
            id_affiliate = req.user.id_affiliate
         }

         const current_page = parseInt(page)
         const per_page = parseInt(limit)
         const skip = (current_page - 1) * per_page

         const filter = {}
         if (id_affiliate) filter.id_affiliate = id_affiliate

         if (role === 'user') {
            filter.id_user = req.user._id
         } else if (id_user) {
            filter.id_user = id_user
         }

         if (!id_affiliate && !filter.id_user) {
            return res.status(200).json({ success: false, status: 400, message: 'id_affiliate atau id_user wajib diisi' })
         }
         if (status) filter.status_pengujian = status
         if (search) {
            filter.$or = [
               { no_invoice: { $regex: search, $options: 'i' } },
               { nama_lengkap: { $regex: search, $options: 'i' } },
            ]
         }

         if (year) filter.year = year.toString()
         if (month) filter.month = (parseInt(month) - 1).toString()

         const total_data = await OrderAffiliate.countDocuments(filter)
         const data = await OrderAffiliate.find(filter)
            .populate('id_affiliate', 'nama_laboratorium kode_laboratorium')
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
               per_page,
            },
         })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   add_order_affiliate: async (req, res) => {
      try {
         const body = req.body

         if (!body.id_affiliate) {
            return res.status(200).json({ success: false, status: 400, message: 'id_affiliate wajib diisi' })
         }
         if (!req.user?._id && !body.id_user) {
            return res.status(200).json({ success: false, status: 400, message: 'User tidak terautentikasi' })
         }

         const no_invoice = await generate_no_invoice(body.id_affiliate)
         const now = new Date()

         const data = new OrderAffiliate({
            ...body,
            id_user: req.user?._id || body.id_user,
            no_invoice,
            date: now,
            year: now.getFullYear().toString(),
            month: now.getMonth().toString(),
            status_pengujian: 'Menunggu Order Dikonfirmasi',
         })

         await data.save()

         return res.status(200).json({ success: true, message: 'Order berhasil dibuat', data })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   update_status_order_affiliate: async (req, res) => {
      try {
         const { id } = req.params
         const { status_pengujian } = req.body
         const role = req.user?.role

         if (!status_pengujian || !STATUS_OPTIONS.includes(status_pengujian)) {
            return res.status(200).json({ success: false, status: 400, message: 'Status pengujian tidak valid' })
         }

         const data = await OrderAffiliate.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({ success: false, status: 404, message: 'Data order tidak ditemukan' })
         }

         if (!check_affiliate_access(req, data)) {
            return res.status(200).json({ success: false, status: 403, message: 'Anda tidak memiliki akses ke order lab affiliate lain' })
         }

         const rule = STATUS_TRANSITIONS[data.status_pengujian]
         if (!rule || !rule.targets.includes(status_pengujian)) {
            return res.status(200).json({
               success: false,
               status: 400,
               message: `Status tidak bisa diubah dari "${data.status_pengujian}" ke "${status_pengujian}" lewat endpoint ini`
            })
         }
         if (!rule.roles.includes(role)) {
            return res.status(200).json({ success: false, status: 403, message: 'Anda tidak memiliki akses untuk mengubah status pada tahap ini' })
         }

         if (status_pengujian === 'Menunggu Pembayaran' && (!data.rincian_harga_invoice || data.rincian_harga_invoice.length === 0)) {
            return res.status(200).json({ success: false, status: 400, message: 'Rincian invoice belum diisi. Gunakan menu Input Invoice terlebih dahulu' })
         }

         data.status_pengujian = status_pengujian
         await data.save()

         return res.status(200).json({ success: true, message: 'Status order berhasil diperbarui', data })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   update_data_order_affiliate: async (req, res) => {
      try {
         const { id } = req.params
         const body = req.body
         const role = req.user?.role

         if (!['laboran', 'ketua_lab', 'admin', 'superadmin'].includes(role)) {
            return res.status(200).json({ success: false, status: 403, message: 'Anda tidak memiliki akses untuk mengedit data order' })
         }

         const data = await OrderAffiliate.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({ success: false, status: 404, message: 'Data order tidak ditemukan' })
         }

         if (!check_affiliate_access(req, data)) {
            return res.status(200).json({ success: false, status: 403, message: 'Anda tidak memiliki akses ke order lab affiliate lain' })
         }

         EDITABLE_FIELDS.forEach((key) => {
            if (body[key] !== undefined) data[key] = body[key]
         })

         await data.save()

         return res.status(200).json({ success: true, message: 'Data order berhasil diperbarui', data })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   upload_laporan_order_affiliate: async (req, res) => {
      try {
         const { id } = req.params
         const { laporan, rincian_biaya } = req.body
         const role = req.user?.role

         if (role !== 'laboran') {
            return res.status(200).json({ success: false, status: 403, message: 'Hanya laboran yang bisa mengupload laporan & rincian biaya' })
         }

         const data = await OrderAffiliate.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({ success: false, status: 404, message: 'Data order tidak ditemukan' })
         }

         if (!check_affiliate_access(req, data)) {
            return res.status(200).json({ success: false, status: 403, message: 'Anda tidak memiliki akses ke order lab affiliate lain' })
         }

         if (!['Order Diproses', 'Menunggu Diverifikasi'].includes(data.status_pengujian)) {
            return res.status(200).json({ success: false, status: 400, message: 'Laporan hanya bisa diupload saat status "Order Diproses"' })
         }

         if (laporan !== undefined) data.laporan = laporan
         if (rincian_biaya !== undefined) data.rincian_biaya = rincian_biaya

         if (data.laporan && data.rincian_biaya) {
            data.status_pengujian = 'Menunggu Diverifikasi'
         }

         await data.save()

         return res.status(200).json({ success: true, message: 'Laporan berhasil disimpan', data })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   // ==============================
   // INPUT / KOREKSI RINCIAN INVOICE — HANYA admin/superadmin
   // FIX: sebelumnya cuma bisa diinput sekali saat "Selesai Diverifikasi" — begitu status
   // pindah ke "Menunggu Pembayaran", admin tidak bisa lagi koreksi. Sekarang boleh dikoreksi
   // selama status "Selesai Diverifikasi" ATAU "Menunggu Pembayaran" (sebelum user bayar).
   // FIX: total per baris dihitung ulang di BE (jumlah x harga_satuan) sebagai fallback kalau
   // FE tidak mengirim total, biar tidak pernah NaN/kosong.
   // ==============================
   update_invoice_order_affiliate: async (req, res) => {
      try {
         const { id } = req.params
         const { rincian_harga_invoice } = req.body
         const role = req.user?.role

         if (!['admin', 'superadmin'].includes(role)) {
            return res.status(200).json({ success: false, status: 403, message: 'Hanya admin yang bisa menginput invoice' })
         }

         if (!Array.isArray(rincian_harga_invoice) || rincian_harga_invoice.length === 0) {
            return res.status(200).json({ success: false, status: 400, message: 'Rincian invoice tidak boleh kosong' })
         }

         const data = await OrderAffiliate.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({ success: false, status: 404, message: 'Data order tidak ditemukan' })
         }

         if (!['Selesai Diverifikasi', 'Menunggu Pembayaran'].includes(data.status_pengujian)) {
            return res.status(200).json({ success: false, status: 400, message: 'Invoice hanya bisa diinput/dikoreksi saat status "Selesai Diverifikasi" atau "Menunggu Pembayaran"' })
         }

         const rincian_normalized = rincian_harga_invoice.map((r) => {
            const jumlah = Number(r.jumlah) || 0
            const harga_satuan = Number(r.harga_satuan) || 0
            const total = r.total !== undefined && r.total !== null && r.total !== ''
               ? Number(r.total)
               : jumlah * harga_satuan
            return {
               tanggal: r.tanggal || null,
               deskripsi: r.deskripsi || '',
               keterangan: r.keterangan || '',
               jumlah,
               satuan: r.satuan || '',
               harga_satuan,
               total,
            }
         })

         const total_keseluruhan = rincian_normalized.reduce((acc, r) => acc + (r.total || 0), 0)

         data.rincian_harga_invoice = rincian_normalized
         data.total_keseluruhan = total_keseluruhan
         data.status_pengujian = 'Menunggu Pembayaran'

         await data.save()

         return res.status(200).json({ success: true, message: 'Invoice berhasil disimpan', data })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   upload_bukti_pembayaran_order_affiliate: async (req, res) => {
      try {
         const { id } = req.params
         const { bukti_pembayaran } = req.body
         const role = req.user?.role

         if (!bukti_pembayaran) {
            return res.status(200).json({ success: false, status: 400, message: 'File bukti pembayaran wajib diisi' })
         }

         const data = await OrderAffiliate.findOne({ _id: id })
         if (!data) {
            return res.status(200).json({ success: false, status: 404, message: 'Data order tidak ditemukan' })
         }

         if (role === 'user' && data.id_user?.toString() !== req.user._id?.toString()) {
            return res.status(200).json({ success: false, status: 403, message: 'Anda tidak memiliki akses ke order ini' })
         }

         if (data.status_pengujian !== 'Menunggu Pembayaran') {
            return res.status(200).json({ success: false, status: 400, message: 'Bukti pembayaran hanya bisa diupload saat status "Menunggu Pembayaran"' })
         }

         data.bukti_pembayaran = bukti_pembayaran
         data.status_pengujian = 'Menunggu Verifikasi Pembayaran'
         await data.save()

         return res.status(200).json({ success: true, message: 'Bukti pembayaran berhasil diupload', data })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   export_order_affiliate: async (req, res) => {
      try {
         const { search = '', status = '', year = '', month = '' } = req.query
         const role = req.user?.role
         let { id_affiliate } = req.query

         if (['laboran', 'ketua_lab'].includes(role)) {
            id_affiliate = req.user.id_affiliate
         }

         const filter = {}
         if (id_affiliate) filter.id_affiliate = id_affiliate
         if (role === 'user') filter.id_user = req.user._id

         if (!id_affiliate && !filter.id_user && !['admin', 'superadmin'].includes(role)) {
            return res.status(200).json({ success: false, status: 400, message: 'id_affiliate wajib diisi' })
         }

         if (status) filter.status_pengujian = status
         if (search) {
            filter.$or = [
               { no_invoice: { $regex: search, $options: 'i' } },
               { nama_lengkap: { $regex: search, $options: 'i' } },
            ]
         }

         if (year) filter.year = year.toString()
         if (month) filter.month = (parseInt(month) - 1).toString()

         const data = await OrderAffiliate.find(filter)
            .populate('id_affiliate', 'nama_laboratorium kode_laboratorium')
            .sort({ createdAt: -1 })
            .lean()

         const rows = data.map((order, idx) => {
            const jenis_layanan = []
            if (order.layanan_analisis?.length) jenis_layanan.push(`Layanan Analisis (${order.layanan_analisis.length})`)
            if (order.sewa_lab?.length) jenis_layanan.push(`Sewa Lab (${order.sewa_lab.length})`)
            if (order.sewa_alat?.length) jenis_layanan.push(`Sewa Alat (${order.sewa_alat.length})`)
            if (order.pembelian_bahan?.length) jenis_layanan.push(`Pembelian Bahan (${order.pembelian_bahan.length})`)

            return {
               no: idx + 1,
               no_invoice: order.no_invoice || '-',
               tanggal: order.date ? new Date(order.date).toLocaleDateString('id-ID') : '-',
               nama_pemohon: order.nama_lengkap || '-',
               email: order.email || '-',
               no_whatsapp: order.no_whatsapp || '-',
               nama_institusi: order.nama_institusi || '-',
               program_studi: order.program_studi || '-',
               nama_laboratorium: order.id_affiliate?.nama_laboratorium || '-',
               jenis_layanan: jenis_layanan.join(', ') || '-',
               status: order.status_pengujian || '-',
               total_keseluruhan: order.total_keseluruhan || 0,
            }
         })

         return res.status(200).json({ success: true, data: rows })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },

   // ==============================
   // GET DATA KWITANSI — untuk generate file kwitansi di FE
   // Hanya tersedia saat status_pengujian sudah "Selesai"
   // no_kwitansi & kota dihitung/di-set on-the-fly, tidak disimpan ke DB
   // ==============================
   get_kwitansi_order_affiliate: async (req, res) => {
      try {
         const { id } = req.params
         const role = req.user?.role

         const data = await OrderAffiliate.findOne({ _id: id })
            .populate('id_affiliate', 'nama_laboratorium kode_laboratorium')
            .populate('id_user', 'nama_lengkap')

         if (!data) {
            return res.status(200).json({ success: false, status: 404, message: 'Data order tidak ditemukan' })
         }

         if (!check_affiliate_access(req, data)) {
            return res.status(200).json({ success: false, status: 403, message: 'Anda tidak memiliki akses ke order lab affiliate lain' })
         }
         if (role === 'user' && data.id_user?._id?.toString() !== req.user._id?.toString()) {
            return res.status(200).json({ success: false, status: 403, message: 'Anda tidak memiliki akses ke order ini' })
         }

         if (data.status_pengujian !== 'Selesai') {
            return res.status(200).json({ success: false, status: 400, message: 'Kwitansi hanya tersedia setelah order berstatus "Selesai"' })
         }

         const no_kwitansi = await generate_no_kwitansi(data)

         const untuk_pembayaran = (data.rincian_harga_invoice || [])
            .map((r) => r.deskripsi || r.keterangan)
            .filter(Boolean)
            .join(', ') || '-'

         const kwitansi = {
            no_kwitansi,
            telah_terima: data.nama_lengkap || data.id_user?.nama_lengkap || '-',
            uang_sejumlah_angka: data.total_keseluruhan || 0,
            uang_sejumlah_terbilang: terbilang_rupiah(data.total_keseluruhan || 0),
            untuk_pembayaran,
            kota: KWITANSI_KOTA,
            tanggal: new Date(data.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            nama_laboratorium: data.id_affiliate?.nama_laboratorium || '-',
         }

         return res.status(200).json({ success: true, data: kwitansi })
      } catch (err) {
         return res.status(500).json({ success: false, message: err.message })
      }
   },
}

module.exports = order_affiliate_controller