const mongoose=require('mongoose')
let adminSchema= new mongoose.Schema({

    email:{
        type:String,
        required:true,
        
    },
    password:{
        type:String,
        required:true
    }


}

)
    
let adminModel=new mongoose.model('admins',adminSchema)
module.exports=adminModel
