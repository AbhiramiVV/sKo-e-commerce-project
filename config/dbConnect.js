 const mongoose = require('mongoose');

const dbConnect=()=>{
    mongoose.set('strictQuery', true);
    mongoose.connect(process.env.MONGOOSE_CONNECT)
    .then(() => console.log('Connected!')).catch(err=>{
        console.log("error : ", err)
    }) }


module.exports= dbConnect;