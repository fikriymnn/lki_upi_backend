const Order = require("../model/order_model")
const Invoice = require("../model/invoice_model")
const month_bahasa = require("../utils/month_bahasa")

const order_controller = {
    get_order: async (req,res) => {
        try {
            const { id } = req.params
            let { skip, limit, status_pengujian, kode_pengujian, jenis_pengujian, id_user, from, to, month, year,no_invoice } = req.query
            skip = parseInt(skip)
            limit = parseInt(limit)

            if (id) {
                const data = await Order.findOne({ _id: id }).populate("id_user")
                res.status(200).json({
                    success: true,
                    data
                })

            }else if (skip && limit && ( status_pengujian || kode_pengujian || jenis_pengujian || id_user || from || to || month || year||no_invoice)) {
                let obj = {}
                if (status_pengujian) {
                    obj.status_pengujian = status_pengujian
                }
                if (kode_pengujian) {
                    obj.kode_pengujian = kode_pengujian
                }
                if (jenis_pengujian) {
                    obj.jenis_pengujian = jenis_pengujian
                } if (id_user) {
                    obj.id_user = id_user
                } if (from && to) {
                    obj.date = { $lt: to, $gt: from }
                } if (year) {
                    obj.year = year
                } if (month) {
                    obj.month = month
                }
                if(no_invoice){
                   obj.no_invoice = no_invoice
                }
                console.log(obj)

                const data = await Order.find(obj).skip(skip).limit(limit)
                const length_data = await Order.find(obj)
                res.status(200).json({
                    success: true,
                    length_total: length_data.length,
                    data
                })
            } else if (skip && limit) {
                const data = await Order.aggregate().skip(skip).limit(limit)
                const length_data = await Invoice.find()
                res.status(200).json({
                    success: true,
                    length_total: length_data.length,
                    data
                })
            } else {
                console.log(skip)
                console.log(limit)
                console.log(no_invoice)
                const data = await Order.aggregate([{
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
            const current_year = new Date().getFullYear().toString()
            const month = new Date().getMonth().toString()
            const current_month = month_bahasa(new Date().getMonth())
            let no_urut = 0

            const data_order = await Invoice.find({ year: new Date().getFullYear() })

            if (data_order.length >= 1) {
                no_urut = data_order.length
            }

            let invoice = `${no_urut + 1}/LKI/UPI/${current_year}`

            let arr = []
            async function jenis_pengujian() {
                let jp = []
                var no = 0;
                for (let i = 0; i < req.body.length; i++) {
                    
                    for (let a = 0; a < req.body[i].jenis_pengujian.length; a++) {
                        try {   
                            if(jp.includes(req.body[i].jenis_pengujian[a].jenis_pengujian)){
                                jp.forEach((v)=>{
                                    if(v==req.body[i].jenis_pengujian[a].jenis_pengujian){
                                        no++
                                    }
                                })
                            }
                            jp.push(req.body[i].jenis_pengujian[a].jenis_pengujian)
                            const data = await Order.find({ jenis_pengujian: req.body[i].jenis_pengujian[a].jenis_pengujian, year: current_year, month: month })
                            let obj = {}
                            let kode = `${req.body[i].jenis_pengujian[a].kode_pengujian}-${current_month}/${current_year}/${data.length + no + 1}`
                            obj.id_user = req.user._id
                            obj.no_invoice = invoice;
                            obj.jenis_pengujian = req.body[i].jenis_pengujian[a].jenis_pengujian
                            obj.kode_pengujian = kode
                            obj.nama_sample = req.body[i].nama_sample
                            obj.jumlah_sample = req.body[i].jumlah_sample
                            obj.wujud_sample = req.body[i].wujud_sample
                            obj.pelarut = req.body[i].pelarut
                            obj.preparasi_khusus = req.body[i].preparasi_khusus
                            obj.target_senyawa = req.body[i].target_senyawa
                            obj.metode_parameter = req.body[i].metode_parameter
                            obj.jurnal_pendukung = req.body[i].jurnal_pendukung
                            obj.deskripsi_sample = req.body[i].deskripsi_sample
                            obj.foto_sample = req.body[i].foto_sample
                            // obj.hasil_analisis = req.body[i].hasil_analisis
                            arr.push(obj)
                            no=0
                        } catch (err) {
                            console.log(err)
                        }
                    }
                }
                return true
            }
            const arry = await jenis_pengujian()
            if(arry==true){
                console.log(req.body[0].jenis_pengujian[0])
                await Order.insertMany(arr)
                const new_invoice = new Invoice({ no_invoice: invoice, total_harga: 0, estimasi_harga: 0, id_user: req.user._id, status: "menunggu verifikasi", items: arr })
                await new_invoice.save()
                return res.status(200).json({
                    success: true,
                    data: arr
                })
            }
           

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