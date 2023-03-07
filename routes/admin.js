
const { response } = require('express');
const express = require('express');
const adminServices = require('../Services/adminServices')
const userController = require('../Services/user')
const bcrypt=require('bcrypt')
const app=express()
const router = express.Router();
const multer=require('multer');
const multiUpload = require('../middleware/multer');
const adminController = require('../Controller/adminController');
const verifyAdminLogin = require('../middleware/adminLogin');
const admin=require('../model/adminModel')
const couponModel=require("../model/couponModel")


 
router.get('/login',adminController.getLogin);

router.post('/login',adminController.postLogin);
router.get('/',adminController.getHome);
 router.use(verifyAdminLogin)
router.get('/admin_logout',adminController.adminLogout); 

//-----------------Dashboard----------------
// router.get('/admin',adminController. getDashboard);


// ----------------------user details------------------------------

router.get('/user-details',adminController.userDetails);
router.get('/block-user/:id',adminController.detailsBlock); 
router.get('/unblock-user/:id',adminController.detailsUnblock);

  // --------------------------Categories------------------------

  router.get('/categories',adminController.categoryDetails);
  router.get('/add-category',adminController.categoryAdd);
  router.post('/add-category',adminController.categoryAddpost);
  router.get('/delete-category/:id',adminController.categoryDelete);
  router.get('/edit-category/:id',adminController.categoryEdit);
  router.post('/editcategory',adminController.postEdit);
  
  

  // ------------------------product-----------------------

  router.get('/add-product',adminController.productAdd);
  router.get('/product-details',adminController.productGet);
  router.post('/add-product',multiUpload,adminController.multiAdd);
  router.get('/delete-product/:id',adminController.productDelete);
  router.get('/edit-product/:id',adminController.productEdit); 
  router.post('/edit-product/:id',multiUpload,adminController.multiEdit);
  
      
//-----------------order---------------------
router.get('/admin-orders',adminController.getOrder);
router.get('/cancel-admin-order/:id',adminController.getadCancelorder);
router.get('/pendding-admin-order/:id',adminController.getPending);
router.get('/cancel-admin-order/:id',adminController.getAdcancel);
router.get('/ship-order/:id',adminController.getAdshipp);
router.get('/deliver-order/:id',adminController.getAddeliver);

  
//----------------coupon---------------------

router.get('/coupon-details',adminController.getCoupon);
router.get('/add-coupon',adminController.getAddcoupon);
router.post('/add-coupon',adminController.postAddcoupon);
router.get('/delete-coupon/:id',adminController.getDelete);
router.get('/edit-coupon/:id',adminController.getEditcoupon);
router.post('/edit-coupon/:id',adminController.postEditcoupon);

//----------------sales------------------------
router.get('/sales-report',adminController.getSales)


 module.exports=router;
