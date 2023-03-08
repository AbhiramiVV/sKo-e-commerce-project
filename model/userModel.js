const mongoose=require('mongoose')

let userSchema= new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true,
        unique:true
    },
    Password:{
        type:String,
        required:true,
    },
    Number:{
        type:String,
        required:true,
    },
    Adress:{
        type:Array,
        required:true,
    },
    
    cart:{
        type:Array,
        required:true
    },
    wishlist:{
        type:Array,
        required:true
    },
    Access:{
        type:Boolean,
        required:true
    },
    Wallet:{
        type:Number,
        required:true
    }


}

)
    
let userModel=new mongoose.model('userss',userSchema)
module.exports=userModel
