const Order = require("../model/order_model")
const month_bahasa = require("../utils/month_bahasa")

const order_controller = {
    get_order: async (req) => {
        try {
            const { id } = req.params
            const { skip, limit, status_pengujian, kode_pengujian, jenis_pengujian } = req.query

            if (id) {
                const data = await Order.findOne({ _id: id })
                res.status(200).json({
                    success: true,
                    data
                })

            } else if (skip && limit) {
                const data = await Order.find().skip(skip).limit(limit)
                const length_data = await Order.find()
                res.status(200).json({
                    success: true,
                    length_total: length_data.length,
                    data
                })
            } else if (skip && limit && (status_pengujian || kode_pengujian || jenis_pengujian)) {
                let obj = {}
                if (status_pengujian) {
                    obj.status_pengujian = status_pengujian
                }
                if (kode_pengujian) {
                    obj.kode_pengujian = kode_pengujian
                }
                if (jenis_pengujian) {
                    obj.jenis_pengujian = jenis_pengujian
                }

                const data = await Order.find(obj).skip(skip).limit(limit)
                const length_data = await Order.find(obj)
                res.status(200).json({
                    success: true,
                    length_total: length_data.length,
                    data
                })
            } else {
                const data = await Order.find()
                res.status(200).json({
                    success: true,
                    data
                })
            }

        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }

    },

    add_order: async (req, res) => {
        try {
            const body = req.body
            let arr = []
            const current_year = new Date().getFullYear()
            const current_month = month_bahasa(new Date().getMonth())
            let no_urut = 0
            const data_order = await Order.find({ year: current_year })
            if (data_order) {
                no_urut = data_order.length
            }

            const order_jenis_pengujian = async (kode) => {
                const data_year = await Order.find({ kode_pengujian: kode, year: current_year })
                const data_month = await Order.find({ kode_pengujian: kode, year: current_year, month: current_month })
                let no = `${data_month.length + 1}-${data_year.length + 1}`
                return no
            }

            body.forEach((parent) => {
                parent.jenis_pengujian.forEach((child) => {
                    async function jenis_pengujian() {
                        let obj = {}
                        no_urut++
                        let invoice = `${no_urut}/LKI/UPI/${current_year}`
                        let no_urut_kp = await order_jenis_pengujian(child.kode_pengujian)
                        let kode = `${child.kode_pengujian}-${current_month}/${current_year}/${++no_urut_kp}`

                        obj.no_invoice = invoice;
                        obj.harga = child.harga
                        obj.jenis_pengujian = child.jenis_pengujian
                        obj.kode_pengujian = kode
                        obj.status_pengujian = parent.status_pengujian
                        obj.nama_sample = parent.nama_sample
                        obj.jumlah_sample = parent.jumlah_sample
                        obj.wujud_sample = parent.wujud_sample
                        obj.pelarut = parent.pelarut
                        obj.preparasi_sample = parent.preparasi_sample
                        obj.target_senyawa = parent.target_senyawa
                        obj.metode_parameter = parent.metode_parameter
                        obj.jurnal_pendukung = parent.jurnal_pendukung
                        obj.keterangan = parent.keterangan
                        obj.hasil_analisis = parent.hasil_analisis
                        arr.push(obj)
                    }
                    jenis_pengujian()

                })



            })

            await Order.insertMany(arr)
            res.status(200).json({
                success:true,
                data: "Add order successfully!"
            })

        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }

    },
    update_order: async (req, res) => {
        try {
            const { id } = req.params
            const body = req.body
            await Order.updateOne({ _id: id }, body)
            const data = await Order.findOne({ _id: id })
            res.status(200).json({
                success: true,
                message: "Update successfully!",
                data
            })

        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    }, delete_order: async (req, res) => {
        try {
            const { id } = req.params
            await Order.deleteOne({ _id: id })
            res.status(200).json({
                success: true,
                message: "Delete successfully!",

            })

        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    }
}

module.exports = order_controller