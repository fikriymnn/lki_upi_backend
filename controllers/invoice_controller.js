const Invoice = require("../model/invoice_model")
const month_bahasa = require("../utils/month_bahasa")
const Order = require("../model/order_model")
const mongoose = require("mongoose")

const invoice_controller = {
    get_invoice: async (req, res) => {
        try {
            const { id } = req.params
            const {skip,limit,status, id_user, from, to, no_invoice, month, year,success,jenis_pengujian } = req.query

            if (id) {
                const data = await Invoice.findOne({_id:id}).populate('id_user').select({id_user:{_id: 0}});
                console.log(data)
                res.status(200).json({
                    success: true,
                    data: data
                })

            } else if (skip && limit && (status || no_invoice || id_user || from || to || month || year||success||jenis_pengujian)) {
                let obj = {}
                const s = parseInt(skip)
                const l = parseInt(limit)
                if (status) {
                    obj.status = status
                } if (id_user) {
                    obj.id_user = new mongoose.Types.ObjectId(id_user)
                } if (no_invoice) {
                    obj.no_invoice = no_invoice
                } if (from && to) {
                    obj.date = { $lt: to, $gt: from }
                } if (year) {
                    obj.year = year
                } if (month) {
                    obj.month = month
                }
                if (success) {
                    obj.success = success=="true"?true:false;
                }
                if(jenis_pengujian){
                    obj.jenis_pengujian = jenis_pengujian
                }

                const data = await Invoice.aggregate([
                    {$match: obj}
                    ,
                    {$lookup:{foreignField:'_id',localField:'id_user',from:'users',as:'id_user'}},
                    {$sort:{_id:-1}}
                ]).skip(s).limit(l)


              
                const length_data = await Invoice.aggregate([{$match:obj}])
              
                res.status(200).json({
                    success: true,
                    length_total: length_data.length,
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
                },
                {$sort:{_id:-1}}
            ]).skip( parseInt(skip)).limit( parseInt(limit))
                const length_data = await Invoice.find()
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
                    
                },
                {$sort:{_id:-1}}])
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
    update_invoice: async (req, res) => {
        try {
            const { id } = req.params
            const {total_harga,s5_date,s6_date,s8_date,status} = req.body
         

            await Invoice.updateOne({ _id: id }, req.body)
            
            const data = await Invoice.findOne({ _id: id })
            console.log(req.body)
            if(data){
                if(total_harga){
                    await Order.updateOne({ no_invoice: data.no_invoice}, {total_harga: total_harga})
                   
                }
                if(status=='selesai'){
                    await Order.updateOne({ no_invoice: data.no_invoice}, {status_pengujian:'success'})
                   
                }
                if(s5_date){
                    await Order.updateOne({ no_invoice: data.no_invoice}, {operator_date: s5_date})
                   
                }
                if(s6_date){
                    await Order.updateOne({ no_invoice: data.no_invoice}, {pj_date: s6_date})
                    console.log(s6_date)
                   
                }
                if(s8_date){
                    await Order.updateOne({ no_invoice: data.no_invoice}, {admin_date: s8_date})
                   
                }
                res.status(200).json({
                    success: true,
                    message: "Update successfully!",
                    data
                })
            }
           
           


        
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    }, delete_invoice: async (req, res) => {
        try {
            const { id } = req.params
            await Invoice.deleteOne({ _id: id })
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

module.exports = invoice_controller