const dbConnect= require('../config/dbConnect')
const bcrypt = require('bcrypt')
const { resolve } = require('path')
const { Result } = require('express-validator')
const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const categoryModel = require('../model/categoryModel')
const { Promise } = require('mongoose')
const couponModel = require('../model/couponModel')
const { log } = require('console')
const orderModel = require('../model/orderModel')

module.exports={

    doLogin:(req,res)=>{
        if(req.session.admin){
    
        res.redirect('/home')
        }else
        res.render('login')
    },
    addProduct:(product,files)=>{
        
        return new Promise(async(resolve,reject)=>{
           let result=await productModel.create({...product,...files,productStatus:false})
            resolve(result)
        })
     
    },

    get_product:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await productModel.find().lean()
            resolve(products)
        })
    },

    getMenProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await productModel.find({Category:"men"}).lean()
            resolve(products)
        }) 
    },

    getWomenProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let result = await productModel.find({Category:"women"}).lean()
            resolve(result)
        })
    },

    deleteProduct:(productId)=>{
        return new Promise((resolve,reject)=>{
            productModel.deleteOne({_id:productId}).then((response)=>{
                resolve(response)
            })
        })
    },
   
    getProductDetails:(productId)=>{
        return new Promise((resolve,reject)=>{
            productModel.findOne({_id:productId}).then((product)=>{
                resolve(product)
            })
        })
    },

    updateProduct:(productId,ProDetails,files)=>{
        return new Promise((resolve,reject)=>{
            productModel.updateOne({_id:productId},{
               $set:{
                Name:ProDetails.Name,
                Category:ProDetails.Category,
                Price:ProDetails.price,
                Stock:ProDetails.Stock,
                Subcategory:ProDetails.Subcategory,
                Image:files.Image,
                Price:ProDetails.Price,
              
               } 
            }).then((response)=>{
                resolve()
            })
                
        })
    },
    
    //-----------------------user details--------------------
    getUser: () => {
        return new Promise(async (resolve, reject) => {
            let users = await userModel.find().sort({_id:1}).lean()
            resolve(users)
        })
    },
    
    blockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           await userModel.updateOne({_id:userId},
            {
                $set:{
                   Access:false 
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    unBlockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           await   userModel.updateOne({_id:userId},
            {
                $set:{
                    Access:true
                }
            }).then((response)=>{
                resolve()
            })
        })
    },

    //------------------------------category--------------------------
    getCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let categories = await categoryModel.find().sort({_id:-1}).lean()
            resolve(categories)
        })
    },
    addCategory:(categoryData)=>{
        console.log(categoryData);
        return new Promise(async(resolve,reject)=>{
            // console.log(categoryData);
            let response={}
            let category = await categoryModel.findOne({category:categoryData.category})
            if(category){
                // console.log("category already exist")
                response.status=true
                resolve(response)
            }else{
            await categoryModel.create(categoryData).then((data)=>{
                categoryData._id=data.insertedId
                resolve(categoryData)
            })
          }
        })
    },
    getCoupons:()=>{
        return new Promise(async(resolve,reject)=>{
            let coupons= await couponModel.find().sort({_id:-1}).lean()
            resolve(coupons)
        })
    },
    addCoupon:(couponData)=>{
        return new Promise(async(resolve,reject)=>{
          await couponModel.create(couponData).then((data)=>{
                //console.log(couponData);
                couponData._id = data.insertedId
                
                resolve(couponData)
            })
        })
    },
    deleteCoupon:(coupId)=>{
        return new Promise((resolve,reject)=>{
        
           couponModel.deleteOne({_id:coupId}).then((response)=>{
                resolve(response)
            })
        })
    },

    getCouponDetails:(coupId)=>{
        return new Promise((resolve,reject)=>{
          couponModel .findOne({_id:coupId}).then((coupon)=>{
                resolve(coupon)
            })
        })
    },
    editCouponDetails:(coupId,coupDetails)=>{
        return new Promise((resolve,reject)=>{
            
           couponModel.updateOne({_id:coupId},{
                $set:{
                    name:coupDetails.name,
                    code:coupDetails.code,
                    expiry:coupDetails.Date,
                    minAmount:coupDetails.minAmount,
                    cashback:coupDetails.cashback
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },

    deleteCategory:(catId)=>{
        // console.log("id"+catId);
        return new Promise((resolve,reject)=>{
            categoryModel.deleteOne({_id:catId}).then((response)=>{
                // console.log(response);
                resolve(response)
            })
        })
    },

    


    getCategoryDetails:(catId)=>{
        return new Promise(async(resolve,reject)=>{
           await categoryModel.findOne({_id:catId}).then((category)=>{
                resolve(category)
            })
        })
    },

    updateCategory:(_id,catDetails)=>{
        // console.log("gffsggg",_id);
        //console.log(_id, catDetails)
        return new Promise(async(resolve,reject)=>{
            try{

                await categoryModel.updateOne({_id},{
                    $set:{
                        category:catDetails,
                    }
                }).then((response)=>{
                    // console.log(response);
                    resolve()
                })
            }catch(err){
                console.log(err)
            }
        })
    },

    //-----------------------Order------------------------------

    getAdminOrders:()=>{
        return new Promise(async(resolve,reject)=>{
         let orders = await orderModel.find().lean()
          //console.log(orders);
            resolve(orders)
        })
      
    },
    getOrderDetails:(orderId)=>{
        return new Promise( (resolve,reject)=>{
            orderModel.findOne({_id:orderId}).then((order)=>{
                resolve(order)
            })
        })
    },
    canceladOrder:(orderId)=>{
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
    penddingAdminOrder:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
        
         await orderModel.updateOne({_id:orderId},{
                $set:{
                    orderStatus:'pending'
            
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    cancelAdminOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
           orderModel.updateOne({_id:orderId},{
                $set:{
                    orderStatus:"Cancelled"
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    shipOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
          orderModel.updateOne({_id:orderId},{
                $set:{
                    orderStatus:"Shipped",
                    
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    deliverOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
            orderModel.updateOne({_id:orderId},{
                $set:{
                    orderStatus:"Delivered"
                
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    getSalesDetails:async()=>{
        return new Promise(async(resolve,reject)=>{
          let products =await orderModel.find().lean()
          
            resolve(products)
        })
    },    

}







