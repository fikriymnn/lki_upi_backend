const Content = require('../model/file/content')


const content_controller = {
add_content: async (req,res)=>{
    try {
        console.log(req.files)
        const {title,sub_title,deskripsi} = req.body
        const newContent = new Content({})
        return res.send('good')
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
},
get_content: async (req,res)=>{

},
update_content: async (req,res)=>{

},
delete_content: async (req,res)=>{

},
}

module.exports = content_cotroller