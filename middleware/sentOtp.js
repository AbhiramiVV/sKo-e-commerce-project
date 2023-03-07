const nodemailer = require("nodemailer");
module.exports={
 
  sentOTP:(email, otp)=> {
      return new Promise((resolve, reject)=>{
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    var mailOptions = {
        from:process.env.EMAIL,
        to: email,
        subject: "sKo Email verification",
        html: `
                  <h1>Verify Your Email For sKo/h1>
                    <h3>use this code <h2>${otp}</h2> to verify your email</h3>
                   
                 `
    };
    transporter.sendMail(mailOptions,(err,res)=>{
        if(err){
            console.log(err);
        }
        else {
    
        }
    });
      })
      
  }
}

 

//  let Otp=Math.floor(Math.random()*1000000)
//  sentOTP("j9446244318@gmail.com",Otp).then(()=>{
//   console.log("email sent successfully");
//  }).catch(err=>{
//   console.log(err);
//  })