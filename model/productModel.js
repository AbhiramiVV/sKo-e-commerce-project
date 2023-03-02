const mongoose=require('mongoose')
let productSchema= new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Category:{
        type:String,
        required:true,
    },
    Subcategory:{
        type:String,
        required:true
    },
  
    Price:{
        type:String,
        required:true
    },
    Stock:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Image:{
        type:Object,
        required:true
    },
    subImage:{
        type:Array,
        required:true
    },
    productStatus:{
        type:Boolean,
        required:true
    },
    saleCount:{
        type:Number,
        required:true,
        default:0
    }



}

)
    
let productModel=new mongoose.model('product',productSchema)
module.exports=productModel