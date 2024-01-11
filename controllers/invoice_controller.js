const Invoice = require("../model/invoice_model")
const month_bahasa = require("../utils/month_bahasa")

const invoice_controller = {
    get_invoice: async (req,res) => {
        try {
            const { id } = req.params
            let { skip, limit, status,id_user,from,to,no_invoice,month,year } = req.query
            skip = parseInt(skip)
            limit = parseInt(limit)

            if (id) {
                const data = await Invoice.findOne({ _id: id }).populate("id_user")
                res.status(200).json({
                    success: true,
                    data
                })

            }else if (skip && limit && (status || no_invoice || id_user||from||to||month||year)) {
                let obj = {}
                if (status) {
                    obj.status = status
                }if (id_user) {
                    obj.id_user = id_user
                }if(no_invoice){
                    obj.no_invoice = no_invoice
                }if(from&&to){
                    obj.date = {$lt:to,$gt:from}
                }if (year) {
                    obj.year = year
                }if (month) {
                    obj.month = month
                }
                console.log('skip')

                const data = await Invoice.find(obj).skip(skip).limit(limit)
                console.log('skip')
                const length_data = await Invoice.find(obj)
                res.status(200).json({
                    success: true,
                    length_total: length_data.length,
                    data
                })
            } else if (skip && limit) {
                console.log('skip')
                const data = await Invoice.aggregate([{$lookup: {
                    from: "users",
                    localField:"id_user",
                    foreignField:"_id",
                    as:"id_user"
                }}]).skip(skip.to).limit(limit)
                const length_data = await Invoice.find()
                res.status(200).json({
                    success: true,
                    length_total: length_data.length,
                    data
                })
            } else {
                const data = await Invoice.aggregate([ {
                    $lookup: {
                    from: "users",
                    localField:"id_user",
                    foreignField:"_id",
                    as:"id_user"
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
    update_invoice: async (req, res) => {
        try {
            const { id } = req.params
            const body = req.body
            await Invoice.updateOne({ _id: id }, body)
            const data = await Invoice.findOne({ _id: id })
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