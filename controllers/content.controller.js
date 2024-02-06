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
    if(req.params.id){
        const data = await Content.findOne({_id:id})
        res.json({
            success:true,
            data
        })
    }else{
        const data = await Content.find()
        res.json({
            success: true,
            data:data
        })
    }

},
update_content: async (req,res)=>{
    try{
        const body = req.body
        const {id} = req.params
        await Content.updateOne({_id:id},body)
        
        return res.status(200).json({
           success: true,
           data: 'update successfully'
        })

     }catch(err){
        return res.status(500).json({
           success: false,
           message: err.message
        })
     }
},
delete_content: async (req,res)=>{
    try{
        const body = req.body
        const {id} = req.params
        await Content.delete({_id:id})
        
        return res.status(200).json({
           success: true,
           data: 'delete successfully'
        })

     }catch(err){
        return res.status(500).json({
           success: false,
           message: err.message
        })
     }
},
}

module.exports = content_controller