const BahanKimia = require('../../model/inventory/bahan_kimia_model')

const bahan_kimia_controller = {
    get_bahan_kimia: async (req, res) => {
        try {
            const { id } = req.params

            // ======================
            // GET BY ID
            // ======================
            if (id) {
                const data = await BahanKimia.findOne({ _id: id })
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
                    { nama_bahan: { $regex: search, $options: 'i' } },
                    { rumus_kimia: { $regex: search, $options: 'i' } },
                    { spesifikasi: { $regex: search, $options: 'i' } },
                    { jenis_bahan: { $regex: search, $options: 'i' } },
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

            const total_data = await BahanKimia.countDocuments(filter)
            const data = await BahanKimia.find(filter)
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

    add_bahan_kimia: async (req, res) => {
        try {
            const body = req.body

            if (
                !body.nama_bahan ||
                !body.jenis_bahan ||
                body.jumlah_input === undefined ||
                !body.satuan_input ||
                body.jumlah === undefined ||
                !body.satuan ||
                !body.penyimpanan ||
                !body.tanggal_kadaluarsa
            ) {
                return res.status(200).json({
                    success: false,
                    status: 400,
                    message: 'Field wajib belum lengkap'
                })
            }

            const data = new BahanKimia({
                nama_bahan: body.nama_bahan,
                rumus_kimia: body.rumus_kimia,
                spesifikasi: body.spesifikasi,
                jenis_bahan: body.jenis_bahan,
                jumlah_input: body.jumlah_input,
                satuan_input: body.satuan_input,
                jumlah: body.jumlah,
                satuan: body.satuan,
                merk_brand: body.merk_brand,
                suppliers: body.suppliers || [],
                penyimpanan: body.penyimpanan,
                tanggal_kadaluarsa: body.tanggal_kadaluarsa
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
