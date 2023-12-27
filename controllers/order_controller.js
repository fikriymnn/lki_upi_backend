const Order = require("../model/order_model")

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
        try{
            
        }catch(err){
            res.status(500).json({
                success: false,
                message: err.message
            })
        }

    },
    update_order: async(req,res)=>{
        try{
            const {id} = req.params
            const body = req.body
            await Order.updateOne({_id:id},body)
            const data = await Order.findOne({_id:id})
            res.status(200).json({
                success: true,
                message: "Update successfully!",
                data
            })

        }catch(err){
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },delete_order: async(req,res)=>{
        try{
            const {id} = req.params
            await Order.deleteOne({_id:id})
            res.status(200).json({
                success: true,
                message: "Delete successfully!",
            
            })

        }catch(err){
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    }
}

module.exports = order_controller