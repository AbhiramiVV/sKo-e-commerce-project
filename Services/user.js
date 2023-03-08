
const dbConnect = require('../config/dbConnect')
const bcrypt = require('bcrypt');
const userModel = require('../model/userModel')
const productModel = require('../model/productModel')
const orderModel =  require('../model/orderModel')
const fast2sms = require('fast-two-sms');
const { resolve } = require('express-hbs/lib/resolver');
const { response } = require('express');
const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: 'rzp_test_miQEHrpQWMK0yw',
  key_secret:'YRRxRJFwjOaTj6oizSFnR0XV',
});

module.exports={
    doSignup: (userData) => {
        return new Promise(async (resolve, _reject) => {
          let response = {};
          let user = await userModel.findOne({ Email: userData.Email }).lean();
          if (user) {
            // console.log("user already exist");
            response.User = true;
            resolve(response);
          } else {
            userData.Password = await bcrypt.hash(userData.Password, 10);
             await userModel.create(
                (userData = {
                  Name: userData.Name,
                  Email: userData.Email,
                  Password: userData.Password,
                  Number: userData.Number,
                  Wallet:0,
                  Address:[],
                  cart:[]  ,
                  wishlist:[],
                  Access: true,
                })
              )
              .then((data) => {
                userData._id = data.insertedId;
                resolve(userData);
              });
          }
        })
      },
      doLogin: (userData) => {
        return new Promise(async (resolve, _reject) => {
          let loginStatus = false;
          let response = {};
          let user = await userModel.findOne({ Email: userData.Email });
          let products= await productModel.find().lean()
          if (user) {
            bcrypt.compare(userData.Password, user.Password).then((status) => {
              if (status) {
                response.email=user.Email;
                response._id = user._id;
                response.user = user;
                response.status = true;
                resolve(response);
              } else {
                 console.log("login failed");
                resolve({ status: false });
              }
            });
          } else {
          
            console.log("failed");
            resolve({ status: false });
          }
        })
      },
    
      getUser: () => {
        return new Promise(async (resolve, _reject) => {
          let users = await userModel.find().sort({ _id: -1 }).lean();
          resolve(users);
        });
      },
    
      obj: {
        OTP: 1,
      },
    
    
      getpdt:(pageNum,perpage)=>{
        return new Promise(async (resolve, _reject) => {
              let result = await productModel.find().countDocuments().then(documentCount=>{
                docCount=documentCount
                return productModel.find({productStatus:false}).skip((pageNum-1)*perpage).limit(perpage).lean()
              })
             
              resolve({result,docCount})
            });
          
      },
      sendMessage:(Number) => {
        let randomOTP = Math.floor(Math.random() * 10000);
       //console.log(randomOTP);
        const options = {
          authorization:
            "5DtgLcYUqJ8xM3CjQuTXeB9wniHadK7Fm0l1hprWysNI4oE2SAl5qy1LGpcXIQ7NPjsJhaOnD3fgRtTx",
          message: `Your OTP for sKo login is ${randomOTP}`,
          numbers: [Number],
        };
        //console.log(options);
        fast2sms
          .sendMessage(options)
          .then((_response) => {
             console.log("OTP send successfully");
          })
          .catch((_err) => {
            //console.log("error");
          });
        return randomOTP;
      },
      resetpassword:(Email,Pass)=>{
        
       return new Promise(async(resolve, reject) => {
        Password= await bcrypt.hash(Pass, 10);
        console.log(Pass);
       let result= await userModel.find({Email:Email})
       console.log(result);
        await userModel.updateOne({Email:Email},{$set:{Password:Password}}).then(result=>{
          console.log(result);
          resolve()
        })
        });
        

      },
      searchProduct:({Name})=>{
        return new Promise(async(resolve,reject)=>{
          try{
            let result=await productModel.find({Name:new RegExp(Name,'i')}).lean()
            if(result){
              resolve(result)
            }else{
              reject()
            } 
          }catch (err){
            reject(err)
        }
    })
    },

      
    
      getUserProfile:(userId) => {
        console.log(userId);
        return new Promise(async (resolve, _reject) => {
        await userModel.findOne({_id:userId}).then((user)=>{
          resolve(user);
         });     
            
        });
      },
      deleteAdd:(ad_id,userId)=>{
        return new Promise(async(resolve,reject)=>{
          console.log(address_id);
          console.log(userId);
        let result = await userModel.updateOne({_id:userId},{$pull:{Adress:{address_id:parseInt(ad_id)}}}).then((response)=>{
          console.log(response);
          resolve(response)
        })
        
      
      })
      },
      fetchUserDetails:(userId) => {
        return new Promise((resolve, reject) => {
          
            userModel.findOne({ _id:userId })
            .then((user) => {
              resolve(user);
            });
        });
      },
      updateUser: (userId, userDetails) => {
        // console.log(userId);
        return new Promise((resolve, reject) => {
        
           userModel .updateOne(
              { _id: userId},
              {
                $set: {
                  Name: userDetails.Name,
                  Email: userDetails.Email,
                  Number: userDetails.Number,
                },
                
              }
            )
            .then((response) => {
              // console.log(response);
              resolve();
            });
        });
      },
      getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await orderModel.find({ userId: userId }).sort({_id:-1}).lean()
            resolve(orders)
        })
    },
    cancelOrder:(orderId)=>{
      return new Promise(async(resolve,reject)=>{
          
       await orderModel.updateOne({_id:orderId},{
              $set:{
                orderStatus:'cancelled',cancel:true
              }
          }).then((response)=>{
              resolve(response)
          })
      })
  },
  returnOrder:(orderId,price,id)=>{
   console.log(typeof price);
    return new Promise(async(resolve,reject)=>{
      await orderModel.updateOne({_id:orderId},{$set:{
        orderStatus:'Return',returnStatus:true }})
        await userModel.updateOne({_id:id},{$inc:{
          "Wallet":parseInt(price)
        }}).then((result)=>{
          console.log(result);
          resolve()
        })
        // await userModel.updateOne({_id:data.userId},{$inc:{"wallet":data.price}})
    })
  

  },
      addToCart: (productId, userId) => {
        // let prodObj = {item: objectId(productId),quantity: 1,};
        return new Promise(async (resolve, _reject) => {
        let userCart = await userModel.findByIdAndUpdate({ _id: userId },
          {$addToSet:{cart:{id:productId,
            quantity:1}}
          });
      
        if(userCart){
          userModel.updateOne({user:userId},
          {
            
            
                $push:{products:productId}
            
            
          }
          ).then((response)=>{
            resolve(response)
          })
        }
        else{
          let cartObj={
            user:userId,
            products:[Object(productId)]
          }
          userModel.insertOne(cartObj).then((_response)=>{
            resolve()
          })
        }
      })

        
      },
    
      
      getCartProducts: (Id) => {
        return new Promise(async (resolve, _reject) => {
            userModel.findOne({_id:Id}).then((data)=>{
                resolve(data)
            })
        })
    
      },


    cartProductsDetails:(id)=>{
     // console.log(id);
        return new Promise(async(resolve, _reject) => {
            let {cart}= await userModel.findOne({_id:id},{cart:1}).lean()
              resolve(cart)
            
      })
    },
    productCart:(cart)=>{
      
      const cartItems=cart.map(item=>{
        return item.id
      })
      
        return new Promise(async(resolve, _reject) => {
            let product= await productModel.find({_id:{$in:cartItems}}).lean()
              resolve(product)
            

        })

    },
    quantityInc: async (userid, id) => {
      try {
        const user = await userModel.findById(userid);
        const cartItem = user.cart.find(item => item.id === id);
    
        const product = await productModel.findById(id);
        if (cartItem.quantity < product.Stock) {
          await userModel.updateOne(
            { _id: userid, cart: { $elemMatch: { id: id } } },
            { $inc: { "cart.$.quantity": 1 } }
          );
          return true;
        } else {
          return false;
        }
      } catch (error) {
        throw new Error("Error increasing quantity: " + error.message);
      }
    },
    
    // quantityInc:(userid,id)=>{
    //  // console.log('pro'+id);
    //  // console.log('user'+userid);
    //   return new Promise(async(resolve, reject) => {
    //     // let quantity=2;
    //     await userModel.updateOne({_id:userid,cart:{$elemMatch:{id:id}} },{
    //       $inc:{
    //           "cart.$.quantity":1
    //       }
    //   }).then((result)=>{
    //     console.log(result);
    //       resolve(result)
    //     })
    //   });
    // },
    checkQty:(_id)=>{
      //console.log(_id);
      return new Promise(async(resolve, reject) => {
        let {cart}= await userModel.findOne({"cart.id":_id},{_id:0,cart:{$elemMatch:{_id:_id}} })
      
        resolve(cart)
      });
    },
  
    quantityDec: (_userid, id) => {
      return new Promise(async (resolve, reject) => {
        const cartItem = await userModel.findOne({
          _id: _userid,
          cart: { $elemMatch: { id: id } },
        });
    
        if (cartItem.cart[0].quantity <= 1) {
          // If the quantity is 1 or less, remove the product from the cart
          await userModel
            .updateOne({ _id: _userid }, { $pull: { cart: { id: id } } })
            .then((result) => {
              resolve(result);
            });
        } else {
          // If the quantity is greater than 1, decrement the quantity by 1
          await userModel
            .updateOne(
              { _id: _userid, cart: { $elemMatch: { id: id } } },
              {
                $inc: {
                  "cart.$.quantity": -1,
                },
              }
            )
            .then((result) => {
              resolve(result);
            });
        }
      });
    },
    
    deleteCartProduct:(_userid,id)=>{
      return new Promise(async(resolve, reject) => {
    
     let result=  await userModel.updateOne({_id:_userid},{$pull:{cart:{id:id}}})
          resolve(result)
      });
    },
    deleteWishProduct:(_userid,id)=>{
      return new Promise(async(resolve,reject)=>{
        let result = await userModel.updateOne({_id:_userid},{$pull:{wishlist:{id:id}}})
         resolve(result)
      });

    },

      getCartCount: (userid) => {
        return new Promise(async (resolve, _reject) => {
          let count = 0;
          let cart = await userModel.findOne({ cart: (userid) });
          console.log(cart);
          if (cart) {
            count = cart.products.length;
          }
          resolve(count);
        })
      },
      wishlistProductsDetails:(id)=>{
        console.log(id);
          return new Promise(async(resolve, _reject) => {
              let {wishlist}= await userModel.findOne({_id:id},{wishlist:1}).lean()
  
              const wishlistItems=wishlist.map(item=>{
                return item.id
              })
              
                resolve(wishlistItems)
              
        })
      },
      productWishlist:(prodID)=>{
        console.log(prodID);
        return new Promise(async(resolve, _reject) => {
            let product= await productModel.find({_id:{$in:prodID}}).lean()
              resolve(product)
            

        })
      },
     
      addToWishlist: (productId, userId) => {
        // let prodObj = {item: objectId(productId),quantity: 1,};
        return new Promise(async (resolve, _reject) => {
        let userwishlist = await userModel.findByIdAndUpdate({ _id: userId },
          {$push:{wishlist:{id:productId}}
          });
     
        if(userwishlist){
          userModel.updateOne({user:userId},
          {
            
            
                $push:{products:productId}
            
            
          }
          ).then((response)=>{
            resolve(response)
          })
        }
        else{
          let wishlistObj={
            user:userId,
            products:[Object(productId)]
          }
          userModel.insertOne(wishlistObj).then((_response)=>{
            resolve()
          })
        }
      })

        
      },
      placeOrder:(_id,address,totalPrice,payment)=>{
       return new Promise(async(resolve,reject)=>{
        const user=await userModel.findById({_id}).lean();
        const cart = user.cart
  
          const cartList=cart.map(item=>{
              return item.id
          })
  
          const {Adress}= await userModel.findOne({_id:_id},{Adress:1})
          let found=Adress.find(e=>e.address_id=address)
          const product=await productModel.find({_id:{$in:cartList}}).lean();
    
      let i=0
       let ID =product[0]._id
for(i=0;i<product.length;i++){
   await orderModel.create({                                                                      
             address:found,
             products:product[i],
             orderDate:new Date(),
             userId:_id,
             quantity:cart[i].quantity,
             totalPrice:parseInt(totalPrice),
             discountedPrice:0,
             payment:payment,
  }).then(result=>{
    // console.log(result);
    resolve(result)
  })
  await productModel.updateOne({_id:ID},{$inc:{"saleCount":cart[i].quantity}}) 
}
  await userModel.findByIdAndUpdate({_id},{
      $set:{cart:[]}
  })
       })
         
        // });
      },
      generateRazorpay:(orderID,totalPrice)=>{
        return new Promise((resolve, reject) => {
          const options={
            amount: totalPrice*100,
            currency: "INR",
            receipt: orderID 
          };
  
         instance.orders.create(options,(err,order)=>{
          resolve(order)
         });
        
        });
       },
       verifyPayment:(details)=>{
        return new Promise((resolve, reject) => {
          let crypto = require('crypto')
          let hamc =crypto.createHmac('sha256','YRRxRJFwjOaTj6oizSFnR0XV')
          hamc.update(details.payment.razorpay_order_id+'|'+details.payment.razorpay_payment_id)
          hamc=hamc.digest('hex')
          if(hamc==details.payment.razorpay_signature){
            resolve()
          }else{
            reject()
          }
        });
       },
    
      //   getWishCount: (userId) => {
      //   return new Promise(async (resolve, reject) => {
      //     let count = 0;
      //     let wishlist = await userModel.findOne({ wishlist: (userId) });
      //     if (wishlist) {
      //       count = wishlist.products.length;
      //     }
      //     resolve(count);
      //   });
      // },

      

      
      
      }
    