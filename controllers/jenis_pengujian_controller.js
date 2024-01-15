const jenis_pengujian = require("../model/jenis_pengujian_model")
const Invoice = require("../model/invoice_model")
const month_bahasa = require("../utils/month_bahasa")

const jenis_pengujian_controller = {
    get_jenis_pengujian: async (req,res) => {
        try {
            const data = await jenis_pengujian.find()
                res.status(200).json({
                    success: true,
                    data
                })
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },

    add_jenis_pengujian: async (req, res) => {
        try {
            const body = req.body
            const new_jp = new jenis_pengujian(body)
            await new_jp.save()
            res.status(200).json({
                success: true,
                data: 'create jenis pengujian successfully!'
            })

        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }

    },
    update_jenis_pengujian: async (req, res) => {
        try {
            const { id } = req.params
            const body = req.body
            await jenis_pengujian.updateOne({ _id: id }, body)
            const data = await jenis_pengujian.findOne({ _id: id })
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
    }, delete_jenis_pengujian: async (req, res) => {
        try {
            const { id } = req.params
            await jenis_pengujian.deleteOne({ _id: id })
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

module.exports = jenis_pengujian_controller