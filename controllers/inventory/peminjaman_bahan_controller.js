const PeminjamanBahan = require('../../model/inventory/peminjaman_bahan_kimia_model')
const BahanKimia = require('../../model/inventory/bahan_kimia_model')
const mongoose = require('mongoose')

const peminjaman_bahan_controller = {

    // ======================
    // GET ALL / GET BY ID
    // ======================
    get_peminjaman: async (req, res) => {
        try {
            const { id } = req.params

            // GET BY ID
            if (id) {
                const data = await PeminjamanBahan.findById(id)
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
                date_from,
                date_to
            } = req.query

            const current_page = parseInt(page)
            const per_page = parseInt(limit)
            const skip = (current_page - 1) * per_page

            let filter = {}

            // Filter pencarian
            if (search) {
                filter.$or = [
                    { user_name: { $regex: search, $options: 'i' } },
                    { user_nik: { $regex: search, $options: 'i' } },
                    { 'items.nama_bahan': { $regex: search, $options: 'i' } },
                    { user_institusi: { $regex: search, $options: 'i' } }
                ]
            }

            // Filter status (Dipinjam / Dikembalikan)
            if (status) {
                filter.status = status
            }

            // Filter tanggal pinjam
            if (date_from && date_to) {
                filter.tanggal_pinjam = {
                    $gte: new Date(date_from),
                    $lte: new Date(date_to)
                }
            }

            const total_data = await PeminjamanBahan.countDocuments(filter)
            const data = await PeminjamanBahan.find(filter)
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
    // Mengurangi stok bahan kimia
    // ======================
    add_peminjaman: async (req, res) => {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const body = req.body

            // Validasi field wajib
            if (
                !body.user_name ||
                !body.user_nik ||
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

            // Validasi dan kurangi stok setiap bahan
            for (const item of body.items) {
                if (!item.bahan_id || !item.jumlah_pinjam || item.jumlah_pinjam <= 0) {
                    await session.abortTransaction()
                    return res.status(200).json({
                        success: false,
                        status: 400,
                        message: 'Data item bahan tidak valid'
                    })
                }

                const bahan = await BahanKimia.findById(item.bahan_id).session(session)
                if (!bahan) {
                    await session.abortTransaction()
                    return res.status(200).json({
                        success: false,
                        status: 404,
                        message: `Bahan kimia dengan ID ${item.bahan_id} tidak ditemukan`
                    })
                }

                // Cek stok mencukupi
                if (bahan.jumlah < item.jumlah_pinjam) {
                    await session.abortTransaction()
                    return res.status(200).json({
                        success: false,
                        status: 400,
                        message: `Stok bahan "${bahan.nama_bahan}" tidak mencukupi. Stok tersedia: ${bahan.jumlah} ${bahan.satuan}`
                    })
                }

                // Kurangi stok
                await BahanKimia.updateOne(
                    { _id: item.bahan_id },
                    { $inc: { jumlah: -item.jumlah_pinjam } },
                    { session }
                )
            }

            // Simpan data peminjaman
            const new_peminjaman = new PeminjamanBahan({
                user_id: body.user_id || null,
                user_name: body.user_name,
                user_nik: body.user_nik,
                user_status: body.user_status,
                user_institusi: body.user_institusi,
                user_fakultas: body.user_fakultas || '',
                user_jurusan: body.user_jurusan || '',
                user_phone: body.user_phone,
                user_email: body.user_email,
                user_alamat: body.user_alamat || '',
                items: body.items.map(item => ({
                    bahan_id: item.bahan_id,
                    nama_bahan: item.nama_bahan,
                    rumus_kimia: item.rumus_kimia || '',
                    jumlah_pinjam: item.jumlah_pinjam,
                    jumlah_kembali: 0,
                    satuan: item.satuan
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
                message: 'Peminjaman bahan kimia berhasil ditambahkan',
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
    // PENGEMBALIAN BAHAN
    // - Bisa kembali 0, sebagian, atau semua
    // - Menambah stok bahan kimia sesuai jumlah yang dikembalikan
    // - Status langsung jadi Dikembalikan
    // ======================
    return_peminjaman: async (req, res) => {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const { id } = req.params
            const body = req.body

            if (!body.return_items || !Array.isArray(body.return_items)) {
                await session.abortTransaction()
                return res.status(200).json({
                    success: false,
                    status: 400,
                    message: 'Data pengembalian tidak valid'
                })
            }

            const peminjaman = await PeminjamanBahan.findById(id).session(session)
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

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const tanggal_kembali = new Date(peminjaman.tanggal_kembali)
            tanggal_kembali.setHours(0, 0, 0, 0)
            const is_late = today > tanggal_kembali
            const late_days = is_late
                ? Math.ceil((today - tanggal_kembali) / (1000 * 60 * 60 * 24))
                : 0

            // Proses setiap item yang dikembalikan
            const updated_items = peminjaman.items.map(item => {
                const return_item = body.return_items.find(
                    r => r.bahan_id.toString() === item.bahan_id.toString()
                )

                const jumlah_dikembalikan = return_item ? parseInt(return_item.jumlah_dikembalikan) || 0 : 0
                const sisa_belum_kembali = item.jumlah_pinjam - item.jumlah_kembali
                const jumlah_valid = Math.max(0, Math.min(jumlah_dikembalikan, sisa_belum_kembali))

                return {
                    ...item.toObject(),
                    jumlah_kembali: item.jumlah_kembali + jumlah_valid,
                    _jumlah_dikembalikan_sekarang: jumlah_valid
                }
            })

            // Update stok bahan kimia
            for (const item of updated_items) {
                if (item._jumlah_dikembalikan_sekarang > 0) {
                    const bahan = await BahanKimia.findById(item.bahan_id).session(session)
                    if (!bahan) {
                        await session.abortTransaction()
                        return res.status(200).json({
                            success: false,
                            status: 404,
                            message: `Bahan kimia "${item.nama_bahan}" tidak ditemukan`
                        })
                    }

                    await BahanKimia.updateOne(
                        { _id: item.bahan_id },
                        { $inc: { jumlah: item._jumlah_dikembalikan_sekarang } },
                        { session }
                    )
                }
            }

            const final_items = updated_items.map(({ _jumlah_dikembalikan_sekarang, ...rest }) => rest)

            let catatan = body.catatan_pengembalian || ''
            if (is_late) {
                const late_note = `Pengembalian terlambat ${late_days} hari.`
                catatan = catatan ? `${late_note} ${catatan}` : late_note
            }

            await PeminjamanBahan.updateOne(
                { _id: id },
                {
                    items: final_items,
                    status: 'Dikembalikan',
                    tanggal_dikembalikan: new Date(),
                    catatan_pengembalian: catatan
                },
                { session }
            )

            // ======================
            // UPDATE MASTER PEMINJAM
            // Cari berdasarkan user_id jika ada, fallback ke nik
            // ======================
            const peminjam_filter = peminjaman.user_id
                ? { _id: peminjaman.user_id }
                : { nik: peminjaman.user_nik }

            const peminjam = await Peminjam.findOne(peminjam_filter).session(session)

            if (peminjam) {
                const update_peminjam = {
                    $inc: {
                        jumlah_transaksi: 1,
                        // Hanya increment jumlah_terlambat jika memang terlambat
                        ...(is_late && { jumlah_terlambat: 1 })
                    }
                }

                await Peminjam.updateOne(peminjam_filter, update_peminjam, { session })
            }

            await session.commitTransaction()

            return res.status(200).json({
                success: true,
                message: 'Pengembalian bahan kimia berhasil dikonfirmasi',
                is_late,
                late_days
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
    // Hanya bisa hapus jika masih Dipinjam (rollback stok)
    // ======================
    delete_peminjaman: async (req, res) => {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const { id } = req.params

            const peminjaman = await PeminjamanBahan.findById(id).session(session)
            if (!peminjaman) {
                await session.abortTransaction()
                return res.status(200).json({
                    success: false,
                    status: 404,
                    message: 'Data peminjaman tidak ditemukan'
                })
            }

            // Jika masih Dipinjam, kembalikan stok dulu
            if (peminjaman.status === 'Dipinjam') {
                for (const item of peminjaman.items) {
                    const sisa_belum_kembali = item.jumlah_pinjam - item.jumlah_kembali
                    if (sisa_belum_kembali > 0) {
                        await BahanKimia.updateOne(
                            { _id: item.bahan_id },
                            { $inc: { jumlah: sisa_belum_kembali } },
                            { session }
                        )
                    }
                }
            }

            await PeminjamanBahan.deleteOne({ _id: id }, { session })
            await session.commitTransaction()

            return res.status(200).json({
                success: true,
                message: 'Data peminjaman berhasil dihapus'
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
    }
}

module.exports = peminjaman_bahan_controller