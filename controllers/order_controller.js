const Order = require("../model/order_model")
const Invoice = require("../model/invoice_model")
const month_bahasa = require("../utils/month_bahasa")

const order_controller = {
    get_order: async (req,res) => {
        try {
            const { id } = req.params
            const { report,skip, limit, status_pengujian, kode_pengujian, jenis_pengujian, id_user, from, to, month, year,no_invoice } = req.query
            // skip = parseInt(skip)
            // limit = parseInt(limit)

            if (id) {
                const data = await Order.findOne({ _id: id }).populate("id_user")
                res.status(200).json({
                    success: true,
                    data
                })

            }else if(report && skip && limit && ( status_pengujian || kode_pengujian || jenis_pengujian || id_user || from || to || month || year||no_invoice)) {
                console.log(`selection`)
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

                const data = await Order.aggregate([
                    {$match: obj},
                    {$sort: {_id:-1}}
                    ,
                    {$lookup:{foreignField:'_id',localField:'id_user',from:'users',as:"id_user"}},
                    {$project:{
                        jurnal_pendukung: 0,
                        foto_sample:0,
                        hasil_analisis:0
                    }}
                ]).skip( parseInt(skip)).limit( parseInt(limit))
                const length_data = await Order.aggregate([{$match:obj}])
                res.status(200).json({
                    success: true,
                    length_total: length_data.length,
                    data
                })
            }else if(skip && limit && ( status_pengujian || kode_pengujian || jenis_pengujian || id_user || from || to || month || year||no_invoice)) {
                console.log(`selection`)
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

                const data = await Order.aggregate([
                    {$match: obj},
                    {$sort: {_id:-1}}
                    ,
                    {$lookup:{foreignField:'_id',localField:'id_user',from:'users',as:"id_user"}}
                ]).skip( parseInt(skip)).limit( parseInt(limit))
                const length_data = await Order.aggregate([{$match:obj}])
                res.status(200).json({
                    success: true,
                    length_total: length_data.length,
                    data
                })
            } else if (skip && limit) {
                console.log('1')
                const data = await Order.aggregate([
                    {$sort: {_id:-1}},
                    {$lookup:{foreignField:'_id',localField:'id_user',from:'users',as:"id_user"}}
                ]).skip( parseInt(skip)).limit( parseInt(limit))

                const length_data = await Invoice.find()
                return res.status(200).json({
                    success: true,
                    length_total: length_data.length,
                    data
                })
            } else {

                const data = await Order.aggregate([
                    {$sort: {_id:-1}},
                    {$lookup:{foreignField:'_id',localField:'id_user',from:'users',as:"id_user"}}
                ])
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
            console.log(req.body)
            // console.log(req.files)
            // console.log(req.file.jurnal_pendukung)
            // console.log(req.file)
            
            const current_year = new Date().getFullYear().toString()
            const month = new Date().getMonth().toString()
            const current_month = month_bahasa(new Date().getMonth())
            let no_urut = 0
            console.log('1')
            const data_order = await Invoice.find({ year: new Date().getFullYear() })
            function timeNow() {
                var d = new Date(),
                  h = (d.getHours()<10?'0':'') + d.getHours(),
                  m = (d.getMinutes()<10?'0':'') + d.getMinutes();
               return h + ':' + m;
              }
            const dateFormat = `${new Date().getDate()} ${month_bahasa(new Date().getMonth())} ${new Date().getFullYear()}`
            const dateFormatTgl = `${timeNow()} ${new Date().getDate()} ${month_bahasa(new Date().getMonth())} ${new Date().getFullYear()}`
            if (data_order.length >= 1) {
                no_urut = data_order.length
            }

            let invoice = `${no_urut + 1}/LKI/UPI/${current_year}`
        
            let arr = []
            async function jenis_pengujian() {
                let jp = []
                var no = 0;
                for (let i = 0; i < req.body.length; i++) {
                    
                    for (let a = 0; a < req.body[i]?.jenis_pengujian?.length; a++) {
                        try {   
                            if(jp.includes(req.body[i].jenis_pengujian[a])){
                                jp.forEach((v)=>{
                                    if(v==req.body[i].jenis_pengujian[a]){
                                        no++
                                    }
                                })
                            }
                            console.log('looping')
                            console.log(req.body[i].jenis_pengujian[a])
                            jp.push(req.body[i].jenis_pengujian[a])
                            const data = await Order.find({ jenis_pengujian: req.body[i].jenis_pengujian[a], year: current_year, month: month })
                            
                            let obj = {}
                    
                            let kode = `${req.body[i].kode_pengujian[a]}-${current_month}/${current_year}/${data.length + no + 1}`
                            obj.id_user = req.user._id
                            obj.no_invoice = invoice;
                            obj.jenis_pengujian = req.body[i].jenis_pengujian[a]
                            obj.kode_pengujian = kode
                            obj.nama_sample = req.body[i].nama_sample
                            obj.jumlah_sample = req.body[i].jumlah_sample
                            obj.wujud_sample = req.body[i].wujud_sample
                            obj.pelarut = req.body[i].pelarut
                            obj.preparasi_khusus = req.body[i].preparasi_khusus
                            obj.target_senyawa = req.body[i].target_senyawa
                            obj.metode_parameter = req.body[i].metode_parameter   
                            obj.deskripsi_sample = req.body[i].deskripsi_sample
                            obj.riwayat_pengujian = req.body[i].riwayat_pengujian
                            obj.sample_diambil = req.body[i].sample_diambil
                            obj.uuid = req.body[i].uuid
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
                console.log(arr)
                console.log(req.body[0].jenis_pengujian[0])
                
                await Order.insertMany(arr)
                const new_invoice = new Invoice({ no_invoice: invoice, total_harga: 0, estimasi_harga: 0, id_user: req.user._id, status: "menunggu form dikonfirmasi",s1_date:dateFormatTgl,date_format:`${new Date().getDate()} ${month_bahasa(new Date().getMonth())} ${new Date().getFullYear()}`})
                await new_invoice.save()
                return res.status(200).json({
                    success: true,
                    data: new_invoice
                })


                
            }
        } catch (err) {
            console.log(err.message)
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
            // if(req.files.jurnal_pendukung){
            //     body.jurnal_pendukung= req.files.jurnal_pendukung
            // }
            // if(req.files.foto_sample){
            //     body.foto_sample= req.files.foto_sample
            // }
            // if(req.files.hasil_analisis){
            //     body.hasil_analisis= req.files.hasil_analisis
            // }
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