const PeminjamanAlat = require('../../model/inventory/peminjaman_alat_lab_model')
const AlatLab = require('../../model/inventory/alat_lab_model')
const AlatLabRusak = require('../../model/inventory/alat_lab_rusak_model')
const Peminjam = require('../../model/inventory/peminjam_model')
const mongoose = require('mongoose')

const peminjaman_alat_controller = {

    // ======================
    // GET ALL / GET BY ID
    // ======================
    get_peminjaman: async (req, res) => {
        try {
            const { id } = req.params

            // GET BY ID
            if (id) {
                const data = await PeminjamanAlat.findById(id)
                if (!data) {
                    return res.status(200).json({
                        success: false,
                        status: 404,
                        message: 'Data peminjaman tidak ditemukan'
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
                status,
                history,     // '1' -> hanya tampilkan Dikembalikan
                date_from,
                date_to
            } = req.query

            const current_page = parseInt(page)
            const per_page = parseInt(limit)
            const skip = (current_page - 1) * per_page

            let filter = {}

            // Filter history: jika history=1 paksa tampilkan Dikembalikan saja
            if (history === '1') {
                filter.status = 'Dikembalikan'
            } else if (status) {
                filter.status = status
            }

            // Filter pencarian
            if (search) {
                filter.$or = [
                    { user_name: { $regex: search, $options: 'i' } },
                    { user_nik: { $regex: search, $options: 'i' } },
                    { user_institusi: { $regex: search, $options: 'i' } },
                    { 'items.nama_alat': { $regex: search, $options: 'i' } }
                ]
            }

            // Filter rentang tanggal pinjam
            if (date_from || date_to) {
                filter.tanggal_pinjam = {}
                if (date_from) filter.tanggal_pinjam.$gte = new Date(date_from)
                if (date_to) {
                    const end_of_day = new Date(date_to)
                    end_of_day.setHours(23, 59, 59, 999)
                    filter.tanggal_pinjam.$lte = end_of_day
                }
            }

            const total_data = await PeminjamanAlat.countDocuments(filter)
            const data = await PeminjamanAlat.find(filter)
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

    // ======================
    // TAMBAH PEMINJAMAN
    // Mengurangi stok alat lab
    // ======================
    add_peminjaman: async (req, res) => {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const body = req.body

            // Validasi field wajib
            if (
                !body.user_name ||
                !body.user_status ||
                !body.user_institusi ||
                !body.user_phone ||
                !body.user_email ||
                !body.tanggal_pinjam ||
                !body.tanggal_kembali ||
                !body.keperluan ||
                !body.items ||
                !Array.isArray(body.items) ||
                body.items.length === 0
            ) {
                await session.abortTransaction()
                return res.status(200).json({
                    success: false,
                    status: 400,
                    message: 'Field wajib belum lengkap'
                })
            }

            // Validasi dan kurangi stok setiap alat
            for (const item of body.items) {
                if (!item.alat_id || !item.jumlah_pinjam || item.jumlah_pinjam <= 0) {
                    await session.abortTransaction()
                    return res.status(200).json({
                        success: false,
                        status: 400,
                        message: 'Data item alat tidak valid'
                    })
                }

                const alat = await AlatLab.findById(item.alat_id).session(session)
                if (!alat) {
                    await session.abortTransaction()
                    return res.status(200).json({
                        success: false,
                        status: 404,
                        message: `Alat lab dengan ID ${item.alat_id} tidak ditemukan`
                    })
                }

                // Cek stok mencukupi
                if (alat.jumlah < item.jumlah_pinjam) {
                    await session.abortTransaction()
                    return res.status(200).json({
                        success: false,
                        status: 400,
                        message: `Stok alat "${alat.nama_alat} (${alat.spesifikasi})" tidak mencukupi. Stok tersedia: ${alat.jumlah} unit`
                    })
                }

                // Kurangi stok
                await AlatLab.updateOne(
                    { _id: item.alat_id },
                    { $inc: { jumlah: -item.jumlah_pinjam } },
                    { session }
                )
            }

            // Simpan data peminjaman
            const new_peminjaman = new PeminjamanAlat({
                user_id: body.user_id || null,
                user_name: body.user_name,
                user_nik: body.user_nik || '',
                user_status: body.user_status,
                user_institusi: body.user_institusi,
                user_fakultas: body.user_fakultas || '',
                user_jurusan: body.user_jurusan || '',
                user_phone: body.user_phone,
                user_email: body.user_email,
                user_alamat: body.user_alamat || '',
                items: body.items.map(item => ({
                    alat_id: item.alat_id,
                    nama_alat: item.nama_alat,
                    spesifikasi: item.spesifikasi || '',
                    jumlah_pinjam: item.jumlah_pinjam,
                    jumlah_kembali: 0
                })),
                tanggal_pinjam: new Date(body.tanggal_pinjam),
                tanggal_kembali: new Date(body.tanggal_kembali),
                keperluan: body.keperluan,
                status: 'Dipinjam',
                catatan_pengembalian: ''
            })

            await new_peminjaman.save({ session })
            await session.commitTransaction()

            return res.status(200).json({
                success: true,
                message: 'Peminjaman alat lab berhasil ditambahkan',
                data: new_peminjaman
            })
        } catch (err) {
            await session.abortTransaction()
            return res.status(500).json({
                success: false,
                message: err.message
            })
        } finally {
            session.endSession()
        }
    },

    // ======================
    // PENGEMBALIAN ALAT
    // - Alat baik -> stok bertambah + jumlah_kembali terupdate
    // - Alat rusak/hilang -> generate AlatLabRusak, TIDAK menambah stok
    // - Status: semua kembali (baik+rusak) -> Dikembalikan, sebagian -> Sebagian Dikembalikan
    // - Update jumlah_transaksi & jumlah_terlambat di master Peminjam
    // ======================
    return_peminjaman: async (req, res) => {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const { id } = req.params
            const body = req.body

            // Validasi body
            if (!body.return_items || !Array.isArray(body.return_items)) {
                await session.abortTransaction()
                return res.status(200).json({
                    success: false,
                    status: 400,
                    message: 'Data pengembalian tidak valid'
                })
            }

            const peminjaman = await PeminjamanAlat.findById(id).session(session)
            if (!peminjaman) {
                await session.abortTransaction()
                return res.status(200).json({
                    success: false,
                    status: 404,
                    message: 'Data peminjaman tidak ditemukan'
                })
            }

            if (peminjaman.status === 'Dikembalikan') {
                await session.abortTransaction()
                return res.status(200).json({
                    success: false,
                    status: 400,
                    message: 'Peminjaman ini sudah dikembalikan sebelumnya'
                })
            }

            // Cek keterlambatan
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tanggal_kembali = new Date(peminjaman.tanggal_kembali)
            tanggal_kembali.setHours(0, 0, 0, 0)
            const is_late = today > tanggal_kembali
            const late_days = is_late
                ? Math.ceil((today - tanggal_kembali) / (1000 * 60 * 60 * 24))
                : 0

            // ======================
            // PROSES SETIAP ITEM
            // ======================
            const updated_items = []
            const rusak_to_create = []

            for (const item of peminjaman.items) {
                const return_item = body.return_items.find(
                    r => r.alat_id.toString() === item.alat_id.toString()
                )

                const sisa_belum_kembali = item.jumlah_pinjam - item.jumlah_kembali

                // Default 0 jika tidak ada di payload
                const jumlah_dikembalikan_baik = return_item
                    ? Math.max(0, Math.min(parseInt(return_item.jumlah_dikembalikan) || 0, sisa_belum_kembali))
                    : 0

                const jumlah_rusak = return_item
                    ? Math.max(0, Math.min(parseInt(return_item.jumlah_rusak) || 0, sisa_belum_kembali - jumlah_dikembalikan_baik))
                    : 0

                // Validasi: total tidak boleh melebihi sisa
                if (jumlah_dikembalikan_baik + jumlah_rusak > sisa_belum_kembali) {
                    await session.abortTransaction()
                    return res.status(200).json({
                        success: false,
                        status: 400,
                        message: `Total pengembalian untuk "${item.nama_alat}" melebihi sisa pinjaman`
                    })
                }

                // Update jumlah_kembali — hanya yang kondisi baik
                updated_items.push({
                    ...item.toObject(),
                    jumlah_kembali: item.jumlah_kembali + jumlah_dikembalikan_baik,
                    // field sementara untuk proses di bawah
                    _jumlah_dikembalikan_baik: jumlah_dikembalikan_baik,
                    _jumlah_rusak: jumlah_rusak,
                    _keterangan_rusak: return_item?.keterangan_rusak || '',
                    _alat_id: item.alat_id
                })

                // Catat alat rusak jika ada
                if (jumlah_rusak > 0) {
                    // Ambil snapshot data alat dari DB
                    const alat = await AlatLab.findById(item.alat_id).session(session)

                    rusak_to_create.push({
                        id_peminjaman: peminjaman._id,
                        nama_alat: item.nama_alat,
                        spesifikasi: item.spesifikasi || '',
                        merk_brand: alat?.merk_brand || '',
                        penyimpanan: alat?.penyimpanan || '',
                        suppliers: alat?.suppliers || [],
                        user_name: peminjaman.user_name,
                        user_nik: peminjaman.user_nik || '',
                        user_status: peminjaman.user_status,
                        user_institusi: peminjaman.user_institusi,
                        user_fakultas: peminjaman.user_fakultas || '',
                        user_jurusan: peminjaman.user_jurusan || '',
                        user_phone: peminjaman.user_phone,
                        user_alamat: peminjaman.user_alamat || '',
                        user_email: peminjaman.user_email || '',
                        jumlah_rusak,
                        deskripsi_kerusakan: return_item?.keterangan_rusak || 'Tidak ada keterangan',
                        status_penggantian: 'Belum Diganti'
                    })
                }
            }

            // Update stok alat — HANYA yang kondisi baik
            for (const item of updated_items) {
                if (item._jumlah_dikembalikan_baik > 0) {
                    await AlatLab.updateOne(
                        { _id: item._alat_id },
                        { $inc: { jumlah: item._jumlah_dikembalikan_baik } },
                        { session }
                    )
                }
            }

            // Insert semua alat rusak sekaligus
            if (rusak_to_create.length > 0) {
                await AlatLabRusak.insertMany(rusak_to_create, { session })
            }

            // Bersihkan field sementara sebelum disimpan
            const final_items = updated_items.map(({
                _jumlah_dikembalikan_baik,
                _jumlah_rusak,
                _keterangan_rusak,
                _alat_id,
                ...rest
            }) => rest)

            // ======================
            // TENTUKAN STATUS PEMINJAMAN
            // Dikembalikan: semua item sudah terpenuhi (baik + rusak >= jumlah_pinjam)
            // Sebagian Dikembalikan: masih ada sisa yang belum ditangani
            // ======================
            const semua_selesai = final_items.every(item => {
                const rusak_item = rusak_to_create.find(
                    r => r.id_peminjaman.toString() === peminjaman._id.toString() &&
                         r.nama_alat === item.nama_alat
                )
                const jumlah_rusak_item = rusak_item ? rusak_item.jumlah_rusak : 0
                return (item.jumlah_kembali + jumlah_rusak_item) >= item.jumlah_pinjam
            })

            const new_status = semua_selesai ? 'Dikembalikan' : 'Sebagian Dikembalikan'

            // Susun catatan pengembalian
            let catatan = body.catatan_pengembalian || ''
            if (is_late) {
                const late_note = `Pengembalian terlambat ${late_days} hari.`
                catatan = catatan ? `${late_note} ${catatan}` : late_note
            }
            if (rusak_to_create.length > 0) {
                const rusak_summary = rusak_to_create
                    .map(r => `${r.nama_alat} (${r.spesifikasi}): ${r.jumlah_rusak} unit rusak/hilang`)
                    .join(', ')
                catatan = catatan ? `${catatan} ${rusak_summary}.` : `${rusak_summary}.`
            }

            // Update data peminjaman
            await PeminjamanAlat.updateOne(
                { _id: id },
                {
                    items: final_items,
                    status: new_status,
                    tanggal_dikembalikan: new Date(),
                    catatan_pengembalian: catatan
                },
                { session }
            )

            // ======================
            // UPDATE MASTER PEMINJAM
            // jumlah_transaksi selalu +1, jumlah_terlambat +1 hanya jika terlambat
            // ======================
            const peminjam_filter = peminjaman.user_id
                ? { _id: peminjaman.user_id }
                : { nik: peminjaman.user_nik }

            const peminjam = await Peminjam.findOne(peminjam_filter).session(session)
            if (peminjam) {
                await Peminjam.updateOne(
                    peminjam_filter,
                    {
                        $inc: {
                            jumlah_transaksi: 1,
                            ...(is_late && { jumlah_terlambat: 1 })
                        }
                    },
                    { session }
                )
            }

            await session.commitTransaction()

            return res.status(200).json({
                success: true,
                message: new_status === 'Dikembalikan'
                    ? 'Semua alat berhasil dikembalikan'
                    : 'Pengembalian sebagian berhasil dicatat',
                status: new_status,
                is_late,
                late_days,
                total_rusak: rusak_to_create.reduce((sum, r) => sum + r.jumlah_rusak, 0)
            })
        } catch (err) {
            await session.abortTransaction()
            return res.status(500).json({
                success: false,
                message: err.message
            })
        } finally {
            session.endSession()
        }
    },

    // ======================
    // DELETE PEMINJAMAN
    // Jika masih Dipinjam -> rollback stok (hanya sisa yang belum kembali)
    // ======================
    delete_peminjaman: async (req, res) => {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const { id } = req.params

            const peminjaman = await PeminjamanAlat.findById(id).session(session)
            if (!peminjaman) {
                await session.abortTransaction()
                return res.status(200).json({
                    success: false,
                    status: 404,
                    message: 'Data peminjaman tidak ditemukan'
                })
            }

            // Jika masih Dipinjam atau Sebagian Dikembalikan -> rollback stok sisa
            if (peminjaman.status === 'Dipinjam' || peminjaman.status === 'Sebagian Dikembalikan') {
                for (const item of peminjaman.items) {
                    const sisa_belum_kembali = item.jumlah_pinjam - item.jumlah_kembali

                    if (sisa_belum_kembali > 0) {
                        const alat = await AlatLab.findById(item.alat_id).session(session)
                        if (!alat) {
                            await session.abortTransaction()
                            return res.status(200).json({
                                success: false,
                                status: 404,
                                message: `Alat "${item.nama_alat}" tidak ditemukan, rollback dibatalkan`
                            })
                        }

                        await AlatLab.updateOne(
                            { _id: item.alat_id },
                            { $inc: { jumlah: sisa_belum_kembali } },
                            { session }
                        )
                    }
                }
            }

            // Jika status Dikembalikan -> hapus langsung, stok sudah beres saat return

            await PeminjamanAlat.deleteOne({ _id: id }, { session })
            await session.commitTransaction()

            const status_lama = peminjaman.status
            return res.status(200).json({
                success: true,
                message: (status_lama === 'Dipinjam' || status_lama === 'Sebagian Dikembalikan')
                    ? 'Data peminjaman dihapus dan stok alat berhasil dikembalikan'
                    : 'Data peminjaman berhasil dihapus'
            })
        } catch (err) {
            await session.abortTransaction()
            return res.status(500).json({
                success: false,
                message: err.message
            })
        } finally {
            session.endSession()
        }
    },

    // ======================
    // UPDATE STATUS ALAT RUSAK -> SUDAH DIGANTI
    // Stok alat bertambah sesuai jumlah yang diganti
    // ======================
    ganti_alat_rusak: async (req, res) => {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const { id } = req.params // id AlatLabRusak
            const body = req.body

            const alat_rusak = await AlatLabRusak.findById(id).session(session)
            if (!alat_rusak) {
                await session.abortTransaction()
                return res.status(200).json({
                    success: false,
                    status: 404,
                    message: 'Data alat rusak tidak ditemukan'
                })
            }

            if (alat_rusak.status_penggantian === 'Sudah Diganti') {
                await session.abortTransaction()
                return res.status(200).json({
                    success: false,
                    status: 400,
                    message: 'Alat ini sudah diganti sebelumnya'
                })
            }

            // Cari data alat di master berdasarkan nama + spesifikasi
            // (karena alat_rusak hanya menyimpan snapshot, bukan ref ObjectId ke AlatLab)
            const alat = await AlatLab.findOne({
                nama_alat: alat_rusak.nama_alat,
                spesifikasi: alat_rusak.spesifikasi
            }).session(session)

            if (!alat) {
                await session.abortTransaction()
                return res.status(200).json({
                    success: false,
                    status: 404,
                    message: `Alat "${alat_rusak.nama_alat} (${alat_rusak.spesifikasi})" tidak ditemukan di master alat lab`
                })
            }

            // Tambah stok alat sebesar jumlah yang diganti
            await AlatLab.updateOne(
                { _id: alat._id },
                { $inc: { jumlah: alat_rusak.jumlah_rusak } },
                { session }
            )

            // Update status alat rusak
            await AlatLabRusak.updateOne(
                { _id: id },
                {
                    status_penggantian: 'Sudah Diganti',
                    tanggal_diganti: new Date(),
                    catatan_penggantian: body.catatan_penggantian || ''
                },
                { session }
            )

            await session.commitTransaction()

            return res.status(200).json({
                success: true,
                message: `Alat "${alat_rusak.nama_alat}" berhasil diganti dan stok bertambah ${alat_rusak.jumlah_rusak} unit`
            })
        } catch (err) {
            await session.abortTransaction()
            return res.status(500).json({
                success: false,
                message: err.message
            })
        } finally {
            session.endSession()
        }
    },

    // ======================
    // GET ALAT RUSAK
    // Support filter status_penggantian, search, pagination
    // ======================
    get_alat_rusak: async (req, res) => {
        try {
            const { id } = req.params

            // GET BY ID
            if (id) {
                const data = await AlatLabRusak.findById(id)
                if (!data) {
                    return res.status(200).json({
                        success: false,
                        status: 404,
                        message: 'Data alat rusak tidak ditemukan'
                    })
                }
                return res.status(200).json({ success: true, data })
            }

            // GET ALL + SEARCH + FILTER + PAGINATION
            const {
                page = 1,
                limit = 10,
                search = '',
                status_penggantian,  // 'Belum Diganti' | 'Sudah Diganti'
                id_peminjaman
            } = req.query

            const current_page = parseInt(page)
            const per_page = parseInt(limit)
            const skip = (current_page - 1) * per_page

            let filter = {}

            if (status_penggantian) {
                filter.status_penggantian = status_penggantian
            }

            if (id_peminjaman) {
                filter.id_peminjaman = id_peminjaman
            }

            if (search) {
                filter.$or = [
                    { nama_alat: { $regex: search, $options: 'i' } },
                    { spesifikasi: { $regex: search, $options: 'i' } },
                    { user_name: { $regex: search, $options: 'i' } },
                    { user_nik: { $regex: search, $options: 'i' } }
                ]
            }

            const total_data = await AlatLabRusak.countDocuments(filter)
            const data = await AlatLabRusak.find(filter)
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
    }
}

module.exports = peminjaman_alat_controller