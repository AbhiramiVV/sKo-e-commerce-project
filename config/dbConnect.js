 const mongoose = require('mongoose');

const dbConnect=()=>{
    mongoose.set('strictQuery', true);
    mongoose.connect('mongodb://127.0.0.1:27017/mysko')
    .then(() => console.log('Connected!')).catch(err=>{
        console.log("error : ", err)
    }) }


module.exports= dbConnect;