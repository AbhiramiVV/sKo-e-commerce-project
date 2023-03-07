const express = require("express");
const userServices = require("../Services/user");
const { sample } = require('../Services/user');
const router = express.Router();
const { check, validationResult, Result } = require("express-validator");
const adminServices = require("../Services/adminServices");
const userController = require("../Controller/userController");
const verifyLogin = require("../middleware/userLogin");
const fast2sms = require('fast-two-sms');
const { userHome, userLog } = require("../Controller/userController");



//Get home
let user;
router.get("/",userController.userHome);

router.get("/login",userController.userLog); 
 
router.post('/login',userController.signin);

 

 
router.get('/signup', userController.userSignup);
router.post('/signup',check('Name').notEmpty().withMessage("please Enter a Name"),check('Email')
.matches(/^\w+([\._]?\w+)?@\w+(\.\w{2,3})(\.\w{2})?$/)
    .withMessage("Must be a valid Email id"),check('Password').matches(/[\w\d!@#$%^&*?]{6,}/)
    .withMessage("Password must contain atleast 6 characters"),userController.userSignuppost);


  router.get('/otp',userController.otpVarification);
  router.post('/otp', userController.otpVarificationpost);
 
  router.get('/forgot',userController.forgotGet);
  router.post('/forotp',userController.forgotPost)
  router.get('/forotp',userController.getForotp);
  router.post('/getotp',userController.postForotp); 
  router.get('/reset',userController.getReset);
router.post('/reset',userController.postReset);
/* GET home page. */
router.post('/', userController.userRoot);
// search

router.get('/search-product',userController.getSearchProduct);
//GET Men's page 

router.get('/men',userController.menPage); 
router.get('/menbrand/:_id',userController.getBrandmen);
router.get('/lowTohighmen',userController.lowTohighmen);
router.get('/highTolowmen',userController.highTolowmen);



//GET Women's page

router.get('/women',userController.womenPage);
router.get('/brand/:_id',userController.getBrand);
router.get('/lowTohigh',userController.lowTohigh);
router.get('/highTolow',userController.highTolow);

//Get about page

router.get('/about',userController.aboutPage);



//product view
router.get('/product-view',userController.viewProduct);

 router.use(verifyLogin)

//--------------USER PROFILE----------------

router.get('/user-profile',userController.profileUser);
router.get('/addAddress',userController.getAddress);
router.post('/addAddress',userController.postAddress);
router.get('/edit_Address/:id',userController.getEdit); 
router.post('/update_Address/:id',userController.updateAdress);
router.get('/delete_user_address/:id',userController.deleteAddress);
router.get('/edit-user-profile/:id',userController.getEdituser);
router.post('/edit-user-profile/:id',userController.postEdituser);


//CART

router.get('/add-to-cart/:id',userController.cartAdd); 
router.get('/cart',userController.getCart);
router.get('/quantityInc/:id',userController.addQuantity)
router.get('/quantityDec/:id',userController.minQuantity)
router.get('/removeProd/:id',userController.getDeleteCart)

//Wishlist

router.get('/wishlist',userController.getWishlist);
router.get('/add-to-wishlist/:id',userController.wishlistAdd);
router.get('/removeWish/:id',userController.getDeleteWishlist)

//checkout
router.get('/checkout', userController.getCheckout);
router.post('/checkout',userController.postCheckout);

router.post('/verifyPayment',userController.getVerifyPayment)
router.get('/orderSuccess',userController.orderSuccess)

router.post('/coupon-check',userController.applyCoupon)


router.get('/orders', userController.getOrder);
router.get('/view-order-products/:id',userController.getVieworder);
router.get('/cancelorder/:id',userController.getCancelorder);
router.get('/returnorder/:id',userController.getReturnorder);



router.get('/logout',userController.userLogout);
 
module.exports = router;
