const Order = require("../model/order_model")
const Invoice = require("../model/invoice_model")
const month_bahasa = require("../utils/month_bahasa")

const order_controller = {
    get_order: async (req) => {
        try {
            const { id } = req.params
            const { skip, limit, status_pengujian, kode_pengujian, jenis_pengujian, id_user, from, to, month, year } = req.query

            if (id) {
                const data = await Invoice.findOne({ _id: id }).populate("id_user")
                res.status(200).json({
                    success: true,
                    data
                })

            } else if (skip && limit) {
                const data = await Invoice.aggregate([{
                    $lookup: {
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "id_user"
                    }
                }]).skip(skip).limit(limit)
                const length_data = await Invoice.find()
                res.status(200).json({
                    success: true,
                    length_total: length_data.length,
                    data
                })
            } else if (skip && limit && (status_pengujian || kode_pengujian || jenis_pengujian || id_user || from || to || month || year)) {
                let obj = {}
                if (status_pengujian) {
                    obj.$match.status_pengujian = status_pengujian
                }
                if (kode_pengujian) {
                    obj.$match.kode_pengujian = kode_pengujian
                }
                if (jenis_pengujian) {
                    obj.$match.jenis_pengujian = jenis_pengujian
                } if (id_user) {
                    obj.$match.id_user = id_user
                } if (from && to) {
                    obj.$match.date = { $lt: to, $gt: from }
                } if (year) {
                    obj.$match.year = year
                } if (month) {
                    obj.$match.month = month
                }

                const data = await Invoice.aggregate([
                    obj,
                    {
                        $lookup: {
                            from: "users",
                            localField: "id_user",
                            foreignField: "_id",
                            as: "id_user"
                        }
                    }
                ]).skip(skip).limit(limit)
                const length_data = await Invoice.find(obj)
                res.status(200).json({
                    success: true,
                    length_total: length_data.length,
                    data
                })
            } else {
                const data = await Invoice.aggregate([{
                    $lookup: {
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "id_user"
                    }
                }])
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
            const current_year = new Date().getFullYear()
            const month = new Date().getMonth()
            const current_month = month_bahasa(new Date().getMonth())
            let no_urut = 0

            const data_order = await Invoice.find({ year: current_year })

            if (data_order.length >= 1) {
                no_urut = data_order.length
            }

            let invoice = `${no_urut + 1}/LKI/UPI/${current_year}`

            let arr = []
            body.forEach(async(parent, i) => {
                parent.jenis_pengujian.forEach(async (child) => {
                    try {
                        // console.log(child)

                        // console.log(data)

                        async function jenis_pengujian() {
                            const data = await Order.find({ jenis_pengujian: child.jenis_pengujian })
    
                            console.log(data.length)
                            let obj = {}
                            let kode = `${child.kode_pengujian}-${current_month}/${current_year}/${data.length + 1}`
                            obj.year = current_year,
                            obj.month = month,
                            obj.id_user = req.user._id
                            obj.no_invoice = invoice;
                            obj.jenis_pengujian = child.jenis_pengujian
                            obj.kode_pengujian = kode
                            obj.nama_sample = parent.nama_sample
                            obj.jumlah_sample = parent.jumlah_sample
                            obj.wujud_sample = parent.wujud_sample
                            obj.pelarut = parent.pelarut
                            obj.preparasi_khusus = parent.preparasi_khusus
                            obj.target_senyawa = parent.target_senyawa
                            obj.metode_parameter = parent.metode_parameter
                            obj.jurnal_pendukung = parent.jurnal_pendukung
                            obj.deskripsi_sample = parent.deskripsi_sample
                            obj.foto_sample = parent.foto_sample
                            obj.hasil_analisis = parent.hasil_analisis
                           
                            arr.push(obj)
                        }
                        jenis_pengujian()

                    } catch (err) {
                        console.log(err)
                    }

                })

                if (body.length == i+1) {
                    console.log(`body lenght ${body.length}`)
                    async function post() {
                       

                }
                post()

                }
            })
            setTimeout(()=>{
                async function postdata(){
                    await Order.insertMany(arr)
                    const new_invoice = new Invoice({ no_invoice: invoice, total_harga: 0, estimasi_harga: 0, id_user: req.user._id, status: "menunggu verifikasi", items: arr })
                    await new_invoice.save()
                    return res.status(200).json({
                        success: true,
                        data: arr
                    })
                }
                postdata()
            }, 4000)

            






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