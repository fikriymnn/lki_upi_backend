const Content = require('../model/file/content')


const content_controller = {
    add_content: async (req, res) => {
        try {
            if (req.files[0].fieldname == 'foto') {
                const { mimetype, originalname, buffer } = req.files[0]
                const mimetype2 = req.files[1].mimetype
                const originalname2 = req.files[1].originalname
                const buffer2 = req.files[1].buffer
                const { title, sub_title, deskripsi } = req.body
                const obj = {
                    contentType: mimetype,
                    originalName: originalname,
                    data: buffer
                }
                const obj2 = {
                    contentType: mimetype2,
                    originalName: originalname2,
                    data: buffer2
                }
                const newContent = new Content({
                    title, sub_title, deskripsi,
                    foto: obj,
                    contoh_hasil: obj2
                })
                console.log("success")
                await newContent.save()
                return res.send("success")
            } else {

                const { mimetype, originalname, buffer } = req.files[0]
                const mimetype2 = req.files[1].mimetype
                const originalname2 = req.files[1].originalname
                const buffer2 = req.files[1].buffer
                const { title, sub_title, deskripsi } = req.body
                const obj = {
                    contentType: mimetype,
                    originalName: originalname,
                    data: buffer
                }
                const obj2 = {
                    contentType: mimetype2,
                    originalName: originalname2,
                    data: buffer2
                }
                const newContent = new Content({
                    title, sub_title, deskripsi,
                    foto: obj2,
                    contoh_hasil: obj
                })
                await newContent.save()
                console.log("success")
                return res.send("success")
            }



        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },
    get_content: async (req, res) => {
        if (req.params.id) {
            const data = await Content.findOne({ _id: req.params.id })
            res.json({
                success: true,
                data
            })
        }else if(req.query.resize){
            const data = await Content.aggregate([
                {$project:{title:1,foto:1}}
            ])
            res.json({
                success: true,
                data
            })
        } else {
            const data = await Content.find()
            res.json({
                success: true,
                data: data
            })
        }

    },
    update_content: async (req, res) => {
        try {
            const body = req.body
            const { id } = req.params
            await Content.updateOne({ _id: id }, body)

            return res.status(200).json({
                success: true,
                data: 'update successfully'
            })
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },update_foto: async (req, res) => {
        try {
            const {originalname,mimetype,buffer} = req.file
            const obj = {
                originalName: originalname,
                contentType: mimetype,
                data:buffer
            }
            await Content.updateOne({ _id: id }, {foto:obj})

            return res.status(200).json({
                success: true,
                data: 'update successfully'
            })

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },update_contoh_hasil: async (req, res) => {
        try {
            const {originalname,mimetype,buffer} = req.file
            const obj = {
                originalName: originalname,
                contentType: mimetype,
                data:buffer
            }
            await Content.updateOne({ _id: id }, {contoh_hasil:obj})

            return res.status(200).json({
                success: true,
                data: 'update successfully'
            })

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },
    delete_content: async (req, res) => {
        try {
            const { id } = req.params
            await Content.deleteOne({ _id: id })

            return res.status(200).json({
                success: true,
                data: 'delete successfully'
            })

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },
}

module.exports = content_controller