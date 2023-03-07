const { ObjectId } = require('mongodb');
const mongoose=require('mongoose')
const orderSchema= new mongoose.Schema({
    userId:{
        type:ObjectId,
        required:true
    },
    address:{
        type:Object,
        required:true
    },
   
    orderStatus:{
        type:String,
        default:'pending'
    },
    cancel:{
        type:Boolean,
        default:false
    },
    returnStatus:{
        type:Boolean,
        default:false
    },
    
    paymentStatus:{
        type:Boolean,
        required:true,
        default:false
    },
    orderDate:{
        type:Date,
        required:true,
       
    },

    payment:{
        type:String,
        required:true
    },
    products:{
        type:Object,
        required:true
    },
    couponStatus:{
        type:Boolean,
        required:true,
        default:false
    },
    totalPrice:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    discountedPrice:{
        type:Number,
        required:true
    },

    
},{timestamps:true})
const orderModel= mongoose.model("order", orderSchema);

module.exports=orderModel