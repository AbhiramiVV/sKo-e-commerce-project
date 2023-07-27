const mongoose=require('mongoose')
let categorySchema= new mongoose.Schema({

    category:{
        type:String,
        required:true,
    
    }



}

)
    
let categoryModel=new mongoose.model('categ',categorySchema)
module.exports=categoryModel