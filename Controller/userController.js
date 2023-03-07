const express = require("express");
const userServices = require("../Services/user");
const { sample } = require("../Services/user");
const router = express.Router();
const { check, validationResult, Result } = require("express-validator");
const adminServices = require("../Services/adminServices");
const { getProductDetails } = require("../Services/adminServices");
const userService = require("../Services/user");
const user = require("../Services/user");
const userModel = require("../model/userModel");
const { now } = require("mongoose");
const { resolve } = require("express-hbs/lib/resolver");
const productModel = require("../model/productModel");
const couponModel = require("../model/couponModel");
const orderModel = require("../model/orderModel");
const Razorpay = require('razorpay');
const session = require("express-session");
const helper = require("../middleware/sentOtp");

var instance = new Razorpay({
    key_id: 'rzp_test_miQEHrpQWMK0yw',
    key_secret: 'YRRxRJFwjOaTj6oizSFnR0XV'
})
module.exports = {
  userHome: (req, res) => {
    try {
      req.session.pageNum=parseInt(req.query.page??1) 
      req.session.perpage=4;
      userServices.getpdt(req.session.pageNum,req.session.perpage).then((products) => {
        if (req.session.user) {
          username = req.session.user;
          let pageCount=Math.ceil(products.docCount/req.session.perpage)
                        let pagination=[]
                        for(i=1;i<=pageCount;i++){
                            pagination.push(i)
                        }
          res.render("home", { products:products.result, username,pagination });
        } else {
          username = null;
          let pageCount=Math.ceil(products.docCount/req.session.perpage)
                        let pagination=[]
                        for(i=1;i<=pageCount;i++){
                            pagination.push(i)
                        }
          res.render("home", { products:products.result,pagination });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  
  userLog: (req, res) => {
    res.render("login");
  },
  signin: (req, res, next) => {
    try {
      userServices.doLogin(req.body).then((response) => {
        if (!response.status) {
          req.session.userLoginErr = "Invalid user name or password";
          res.redirect("/login");
        } else if (!response.user.Access) {
          req.session.accessErr =
            "You are currently blocked from accessing this website";
          res.redirect("/login");
        } else {
          req.session.User = response.email;
          req.session._id = response._id;
          req.session.user = response.user.Name;
          req.session.userLoggedIn = true;
          let username = req.session.user;
          let products = req.session.product;
          res.redirect("/");
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  
  profileUser: async (req, res) => {
    try {
      const user = await userServices.getUserProfile(req.session._id);
      const maxAddress = user.Adress.length >= 3;
      const edit = req.session.editAddress || null;
      const addAddress = req.session.addAddress || false;
      res.render("user-profile", { user, addAddress, maxAddress, edit });
      req.session.addAddress = false;
      req.session.editAddress = null;
    } catch (err) {
      console.error(err);
      res.status(500).send("An error occurred while fetching user profile.");
    }
  },
  
  getAddress: (req, res) => {
    req.session.addAddress = true;
    res.redirect("/user-profile");
  },
  postAddress: (req, res) => {
    return new Promise(async (resolve, reject) => {
      let userData = req.body;
      userData.address_id = Date.now();
      await userModel
        .updateOne(
          { _id: req.session._id },
          { $push: { Adress: userData } },
          { multi: true }
        )
        .then((result) => {
          res.redirect("/user-profile");
        });
    });
  },
  getEdit: (req, res) => {
    return new Promise(async (resolve, reject) => {
      let { Adress } = await userModel.findOne(
        { _id: req.session._id },
        { Adress: 1 }
      );
      let addressId = req.params.id;
      let data = await Adress.find((e) => e.address_id == addressId);
      req.session.editAddress = data;
      res.redirect("/addAddress");
    });
  },
  updateAdress: (req, res) => {
    return new Promise(async (resolve, reject) => {
      let userDetails = req.body;
      userDetails.address_id = Date.now();
      await userModel
        .updateOne(
          {
            _id: req.session._id,

            Adress: { $elemMatch: { address_id: parseInt(req.params.id) } },
          },
          { $set: { "Adress.$": userDetails } }
        )
        .then((result) => {
          console.log(result);
          res.redirect("/user-profile");
        });
    });
  },
  profileEditpost: async (req, res) => {
    let userId = req.params.id;
    let userDetails = req.body;
    userData.address_id = Date.now();
  },
  deleteAddress: (req, res) => {
    address_id = req.params.id;
    userService
      .deleteAdd(address_id, req.session._id)
      .then((response) => {
        res.redirect("/user-profile");
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getEdituser:async(req,res)=>{
    let user = await userServices.fetchUserDetails(req.params.id)
    res.render('edit-profile',{user})
   },
   postEdituser:(req,res)=>{
    let userId = req.params.id
    let userDetails = req.body
    userServices.updateUser(userId,userDetails).then((response)=>{
      res.redirect('/user-profile')
    })
  },


  userSignup: (req, res) => {
    res.render("signup", { userExist: req.session.userAlreadyExist });
    req.session.userAlreadyExist = false;
  },

  userSignuppost: (req, res) => {
    const errors = validationResult(req);
    let error1 = errors.errors.find((item) => item.param === "Name") || "";
    let error2 = errors.errors.find((item) => item.param === "Email") || "";
    let error3 = errors.errors.find((item) => item.param === "Password") || "";

    if (!errors.isEmpty()) {
      res.render("signup", {
        nameMsg: error1.msg,
        emailMsg: error2.msg,
        passwordMsg: error3.msg,
      });
    } else {
      userServices.doSignup(req.body).then((response) => {
        if (response.User) {
          req.session.userAlreadyExist = "User already exist";
          res.redirect("/signup");
        } else {
          req.session.user = response;
          req.session.userLoggedIn = true;
          let randomOTP = Math.floor(Math.random() * 10000);
          req.session.signupOTP=randomOTP;
          // userServices.obj.OTP = userServices.sendMessage(req.body.Number);
          helper.sentOTP(req.body.Email,randomOTP)
          res.redirect("/otp");
        }
      });
    }
  },

  otpVarification: (req, res) => {
    if (req.session.isVerified) {
      res.redirect("/");
    } else {
      req.session.isVerified = true;
      res.render("otp");
    }
  },

  otpVarificationpost: (req, res) => {
    if (req.body.otp == req.session.signupOTP) {
      res.redirect("/login");
    }
  },

  forgotGet: (req, res) => {
    res.render("forgot");
  },

  forgotPost: (req, res) => {
    let randomOTP = Math.floor(Math.random() * 10000);
    req.session.signupOTP=randomOTP;
    req.session.email=req.body.Email;
    helper.sentOTP(req.body.Email,randomOTP)
    res.render("forOTP");
  },

  getForotp: (req, res) => {
    if (req.session.isVerified) {
      res.redirect("/");
    } else {
      req.session.isVerified = true;
      res.render("home");
    }
  },

  postForotp: (req, res) => {
    if (req.body.otp ==req.session.signupOTP) {
      res.redirect("/reSet");
    }
  },
  postReset:(req,res)=>{
    if(req.body.Password==req.body.resetpassword){
      userService.resetpassword(req.session.email,req.body.Password).then(()=>{
        res.redirect('/login')
      })
    }

  },

  getReset:(req,res)=>{
    res.render('reSet')

  },

  userRoot: (req, res, next) => {
    let user = req.session.user;
    let product = req.session.body;

    let cartCount = null;
    let wishCount = null;
    if (req.session.user) {
      cartCount = userServices.getCartCount(req.session.userid);
      wishCount = userServices.getWishCount(req.session.userid);
    }
    res.redirect("/user/home", { product });
  },
  getSearchProduct:(req,res)=>{
    userService.searchProduct(req.query).then((products)=>{
      if(products.length==0){
        res.render("error")
      }else{
        req.session.searchStatus=true;
        req.session.searchData=products;
        res.render("home",{products})
      }
    }).catch((err)=>{
      console.log(err);
    })

  },
  menPage: async(req, res) => {
    let user = req.session.user;
    let brand=await productModel.
    aggregate([
      {
        $group:{_id:"$Name"}

      }
    ]);

    adminServices.getMenProduct().then((productss) => {
      let products;
      if(req.session.lowTohighmen){
        products=req.session.lowTohighmen
      }
      else if(req.session.brandProductmen){
        products=req.session.brandProductmen
      }
      else if(req.session.highTolowmen){
        products=req.session.highTolowmen
      }
      else{
        products=productss
      }
      res.render("men", { products, user,brand ,brandProductmen:req .session.brandProductmen,status:req.session.status,lowTohighmen:req.session.lowTohighmen,highTolowmen:req.session.highTolowmen});
    });
  },
  getBrandmen:(req,res)=>{
    req.session.highToLow=null;
    req.session.lowTohigh=null;
    return new Promise(async(resolve,reject)=>{
  let brandProductmen = await productModel.find({ Name: req.params._id }).lean()
   req.session.brandProductmen=brandProductmen

      res.redirect('/men')
    })
  },
  lowTohighmen:(req,res)=>{
    req.session.brandProduct=null
    req.session.highToLowwomen=null
    return new Promise(async(resolve,reject)=>{
      let lowTohighmen = await productModel.find({Category:"men"}).sort({Price:1}).lean()
      resolve(lowTohighmen)
      req.session.lowTohighmen=lowTohighmen
      req.session.lhstatusmen=true
      res.redirect('/men')
      req.session.lhstatusmen=null
  })
  },
  highTolowmen:(req,res)=>{
    req.session.brandProductmen=null
    req.session.lowTohighmen=null
    return new Promise(async(resolve,reject)=>{
      let highTolowmen = await productModel.find({Category:"men"}).sort({Price:-1}).lean()
      resolve(highTolowmen)
      req.session.highTolowmen =highTolowmen 
      req.session.hlstatus=true
      res.redirect('/men')
      req.session.hlstatus=null
  })
  },

  womenPage: async(req, res) => {
    let user = req.session.user;
    
    let brand=await productModel.
    aggregate([
      {
        $group:{_id:"$Name"}

      }
    ]);
    adminServices.getWomenProduct().then((product) => {
   let products;

if(req.session.lowTohigh){
  products=req.session.lowTohigh
}
else if(req.session.brandProduct){
  products=req.session.brandProduct
}
else if(req.session.highToLow){
  products=req.session.highToLow
}
else{
  products=product
}
      res.render("women", { products, user ,brand,brandProduct:req .session.brandProduct,status:req.session.status,lowTohigh:req.session.lowTohigh,lhstatus:req.session.lhstatus});
       

    });
    
  },
  lowTohigh:(req,res)=>{
    req.session.brandProduct=null
    req.session.highToLow=null
    return new Promise(async(resolve,reject)=>{
      let lowTohigh = await productModel.find({Category:"women"}).sort({Price:1}).lean()
      resolve(lowTohigh)
      req.session.lowTohigh=lowTohigh
req.session.lhstatus=true
      res.redirect('/women')
      req.session.lhstatus=null
  })


  },
  highTolow:(req,res)=>{
    req.session.brandProduct=null
    req.session.lowTohigh=null
    return new Promise(async(resolve,reject)=>{
      let highTolow = await productModel.find({Category:"women"}).sort({Price:-1}).lean()
      resolve(highTolow )
      req.session.highTolow =highTolow 
req.session.hlstatus=true
      res.redirect('/women')
      req.session.hlstatus=null
  })
  },
  getBrand:(req,res)=>{
    req.session.highToLow=null;
    req.session.lowTohigh=null;
    return new Promise(async(resolve,reject)=>{
  let brandProduct = await productModel.find({ Name: req.params._id }).lean();
   req.session.brandProduct=brandProduct

      res.redirect('/women')
    })
  },
  lowTohigh:(req,res)=>{
    req.session.brandProduct=null
    req.session.highToLow=null
    return new Promise(async(resolve,reject)=>{
      let lowTohigh = await productModel.find({Category:"women"}).sort({Price:1}).lean()
      resolve(lowTohigh)
      req.session.lowTohigh=lowTohigh
req.session.lhstatus=true
      res.redirect('/women')
      req.session.lhstatus=null
  })


  },
  highTolow:(req,res)=>{
    req.session.brandProduct=null
    req.session.lowTohigh=null
    return new Promise(async(resolve,reject)=>{
      let highTolow = await productModel.find({Category:"women"}).sort({Price:-1}).lean()
      console.log(highTolow );
      resolve(highTolow )
      req.session.highTolow =highTolow 
req.session.hlstatus=true
      res.redirect('/women')
      req.session.hlstatus=null
  })
  },
  aboutPage: (req, res) => {
    let username = req.session.user;
    res.render("about", { username })
  },

  viewProduct: (req, res) => {
    let productId = req.query.id;
    let user = req.session.user;
    getProductDetails(productId).then((product) => {
      res.render("product-overview", { user, product });
    });
  },

  cartAdd: (req, res) => {
    userService.addToCart(req.params.id, req.session._id).then((result) => {
      res.redirect("back");
    });
  },
  getCart: (req, res) => {
    userService.cartProductsDetails(req.session._id).then((result) => {
      let cItem = result;
      let cartQuantities = {};
      cItem.map((item) => {
        cartQuantities[item.id] = item.quantity;
        return item.quantity;
      });
  
      userService.productCart(result).then((result) => {
        req.session.cartCount = result.length;
        if (result.length === 0) { // if the cart is empty
          res.render("emptyCart", { // render a different view
            cartCount: req.session.cartCount,
          });
        } else { // if the cart is not empty
          result.map((item, index) => {
            result[index].cartQuantity = cartQuantities[item._id];
            item.Price = item.Price * result[index].cartQuantity;
          });
  
          const calcAmount = result.reduce((acc, item) => {
            return (acc += item.Price * item.cartQuantity);
          }, 0);
  
          const totalPrice = calcAmount;
          res.render("cart", {
            result,
            totalPrice,
            cartCount: req.session.cartCount,
          });
        }
      });
    });
  },
  

  addQuantity: (req, res) => {
    userService.checkQty(req.params.id).then((result) => {
      cItem = result;
      let cartItems = cItem.map((item) => {
        return item.quantity;
      });
      if (cartItems[0] > 9) {
        res.redirect("back");
      } else {
        userService.quantityInc(req.session._id, req.params.id).then(() => {
          res.redirect("back");
        });
      }
    });
  },
  minQuantity: (req, res) => {
    userServices.checkQty(req.params.id).then((result) => {
      cItem = result;
      let cartItems = cItem.map((item) => {
        return item.quantity;
      });
    

      if (cartItems[0] < 2) {
        userServices.removeCartItem(req.session._id, req.params.id).then(() => {
          res.redirect("back");
        });
      } else {
        userServices.quantityDec(req.session._id, req.params.id).then(() => {
          res.redirect("back");
        });
      }
    });
  },
  getDeleteCart: (req, res) => {
    userService
      .deleteCartProduct(req.session._id, req.params.id)
      .then(() => {
        res.redirect("/cart");
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getWishlist: (req, res) => {
    userService.wishlistProductsDetails(req.session._id).then((result) => {
      user.productWishlist(result).then((products) => {
        res.render("wishlist", { products, user: req.session.user });
      });
    });
  },
  wishlistAdd: (req, res) => {
    userService.addToWishlist(req.params.id, req.session._id).then(() => {
      res.redirect("back");
    });
  },
  getDeleteWishlist:(req,res)=>{
    userServices.deleteWishProduct(req.session._id,req.params.id).then(()=>{
      res.redirect("/wishlist");
    }).catch((err)=>{
      console.log(err);
    })
  },
  getCheckout: async (req, res) => {
    const _id = req.session._id;
    const user = await userModel.findById({ _id }).lean();
    const address = user.Adress;
    const { cart } = await userModel.findOne({ _id }, { cart: 1 });

    if (cart.length === 0) {
      return res.render("emptyCart", {
        user
      });
    }

    let cartQuantities = {};
    cart.map((item) => {
      cartQuantities[item.id] = item.quantity;
      return item.quantity;
    });
    
    const cartList = cart.map((item) => {
      return item.id;
    });
      
    const product = await productModel.find({ _id: { $in: cartList } }).lean();
    let products=product.map((item, index) => {
      return{...item,quantity:cartQuantities[item._id]}
    });
    
    let subTotal=0
    let totalprice = 0;
  
    products.forEach((item, index) => {
      subTotal = item.Price *item.quantity;
      item.subTotal = subTotal;
    });

    const shipping=50;
    let totalPrice = 0;
    let coupons = await couponModel.find().lean();
    product.forEach((item, index) => {
      totalPrice = totalPrice + item.Price * cart[index].quantity;
      item.quantity = cart[index].quantity;
    });
    totalPrice=totalPrice+shipping;
    let coupon = req.session.coupon;
    let discount={}
    if (coupon) {
      if(totalPrice > coupon.minAmount){
        discount.discountedPrice= totalPrice - coupon.cashback;
        discount.cashBack=coupon.cashback
      }
    }

    res.render("checkout2", {
      products,
      totalPrice,
      address,
      subTotal,
      cart,
      user,
      shipping,
      coupons,
      discount
    });
    
    discount=null
    req.session.coupon=null
  },


  applyCoupon: (req, res) => {
    console.log(req.body);
    return new Promise((resolve, reject) => {
      couponModel.findOne({ code: req.body.coupon }).then((coupon) => {
        req.session.coupon = coupon;
        res.redirect("/checkout");
      });
    });
  
  },

  postCheckout: async (req, res) => {
    req.session.body=req.body;
         const _id=req.session._id
       if(req.body.payment=='cod'){
        userService.placeOrder(_id,req.body.address,req.body.total,req.body.payment).then((result)=>{
         res.json({codSuccess:true})
            })
       }else{
        let orderId=Math.floor(Math.random()*1000000)+ Date.now() 
        let total=req.body.discountedPrice?req.body.discountedPrice:req.body.total
        total=parseInt(total)
        userService.generateRazorpay(orderId,total).then((result)=>{
            res.json(result)
            })
       }
  },

  getVerifyPayment:(req,res)=>{
    userService.verifyPayment(req.body).then(()=>{
      userService.placeOrder(req.session._id,req.session.body.address,req.session.body.total,req.session.body.payment).then((result)=>{
            res.json({success:true})
        })
    }).catch(err=>{
        console.log(err);
    })
},

  getOrder:async (req, res) => {
    
    let orders = await userServices.getUserOrders(req.session._id)
    res.render('orders', { user: req.session.user, orders })
  },
   getVieworder:async (req, res) => {
    let orderId=req.params.id;
    let user=req.session.user;
  await adminServices.getOrderDetails(orderId).then((order)=>{
      res.render('view-order-products', {order,user})
    
   
   })
   
  },
  getCancelorder:async(req,res)=>{
   //console.log(req.params.id);

  let orderId=req.params.id;
   await userServices.cancelOrder(orderId).then((result)=>{
   
    res.redirect('back')
  })
},
getReturnorder:async(req,res)=>{
  let orderId=req.params.id;
  await userServices.returnOrder(orderId).then((result)=>{
    res.redirect('back')
  })

},
orderSuccess:(req,res)=>{
  res.render("order-success");
},

  userLogout: (req, res, next) => {
    req.session.destroy();

    // req.session.userLoggedIn = false
    // req.session.isVerified = false
    res.redirect("/");
  },
};
