const { response } = require("express");
const express = require("express");
const adminServices = require("../Services/adminServices");
const userServices = require("../");
const userController = require("../Services/user");
const bcrypt = require("bcrypt");
const app = express();
const router = express.Router();
const admin = require("../model/adminModel");
const multer = require("multer");
const multiUpload = require("../middleware/multer");
const adminModel = require("../model/adminModel");
const orderModel= require("../model/orderModel")
const categoryModel = require("../model/categoryModel");
const user = require("../Services/user");
const { count } = require("../model/couponModel");

module.exports = {
  getHome:async(req, res) => {
    if (req.session.admin) {
      const totalAmount = await adminServices.getTotalPrice();
      const orderCount = await orderModel.find().lean().countDocuments();
      //  let totalSales = await adminServices.getTotalSales();
      const orders = await orderModel.find().lean()
        const deliveredOrder = await orderModel.find({ status: "Delivered" }).lean()
        let totalRevenue = 0;
        let Orders = deliveredOrder.filter(item => {
            totalRevenue = totalRevenue + item.totalPrice;
        })
      res.render("admin-home",{totalAmount,totalRevenue,orderCount});
    } else {
      res.redirect("/admin/login");
    }
  },

  getLogin: (req, res) => {
    res.render("admin-login");
  },

  postLogin: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const admin = await adminModel.findOne({ email });

      if (admin) {
        if (password == admin.password) {
          req.session.admin = true;
          res.redirect("/admin");
        } else {
          const err = new Error("Incorrect Password");
          err.statusCode = 401;
          throw err;
        }
      } else {
        const err = new Error("Please Enter all fields");
        err.statusCode = 400;
        throw err;
      }
    } catch (error) {
      next(error);
    }
  },

  // getDashboard: async (req, res, next) => {
  //   try {
  //     res.render("admin/admin-dashboard");
  //   } catch (error) {
  //     next(error);
  //   }
  // },
 
  // getDashboard: async (req, res) => {
  //   console.log('hloo');
  //   let totalAmount = await adminServices.getTotalPrice();
  //   let totalSales = await adminServices.getTotalSales();
    
  //   res.render("admin-home", {
  //     totalAmount,
  //     totalSales,
      
  //   });
  // },

  userDetails: async (req, res, next) => {
    try {
      const users = await adminServices.getUser();
      res.render("user-details", { users });
    } catch (error) {
      next(error);
    }
  },

  detailsBlock: async (req, res, next) => {
    try {
      let userId = req.params.id;
      await adminServices.blockUser(userId);
      res.redirect("/admin/user-details");
    } catch (error) {
      next(error);
    }
  },

  detailsUnblock: async (req, res, next) => {
    try {
      let userId = req.params.id;
      await adminServices.unBlockUser(userId);
      res.redirect("/admin/user-details");
    } catch (error) {
      next(error);
    }
  },

  categoryDetails: async (req, res, next) => {
    try {
      const categories = await adminServices.getCategory();
      res.render("categories", { categories });
    } catch (error) {
      next(error);
    }
  },

  categoryAdd: async (req, res, next) => {
    try {
      res.render("add-category", { categoryErr: req.session.categoryExist });
      req.session.categoryExist = false;
    } catch (error) {
      next(error);
    }
  },
  categoryAddpost: async (req, res, next) => {
    try {
      console.log(req.body);
      const response = await adminServices.addCategory(req.body);
      if (response.status) {
        req.session.categoryExist = "Category already exist";
        res.redirect("/admin/add-category");
      } else {
        res.redirect("/admin/categories");
      }
    } catch (error) {
      next(error);
    }
  },
  categoryDelete: async (req, res, next) => {
    try {
      let catId = req.params.id;
      const response = await adminServices.deleteCategory(catId);
      res.redirect("/admin/categories");
    } catch (error) {
      next(error);
    }
  },
  categoryEdit: async (req, res, next) => {
    try {
      const category = await adminServices.getCategoryDetails(req.params.id);
      res.render("edit-category", { category });
    } catch (error) {
      next(error);
    }
  },

  postEdit: async (req, res, next) => {
    try {
      let { _id, category, description } = req.body;
      await adminServices.updateCategory(_id, category, description);
      res.redirect("/admin/categories");
    } catch (error) {
      next(error);
    }
  },

  productAdd: async (req, res, next) => {
    try {
      const categories = await adminServices.getCategory();
      res.render("add-product", { categories });
    } catch (error) {
      next(error);
    }
  },

  productGet: async (req, res) => {
    try {
      const products = await adminServices.get_product();
      res.render("product-details", { products });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  multiAdd: async (req, res) => {
    try {
      await adminServices.addProduct(req.body, req.files);
      res.redirect("/admin/product-details");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  productDelete: async (req, res) => {
    try {
      let productId = req.params.id;
      await adminServices.deleteProduct(productId);
      res.redirect("/admin/product-details");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  productEdit: async (req, res) => {
    try {
      let product = await adminServices.getProductDetails(req.params.id);
      res.render("edit-product", { product });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  multiEdit: async (req, res) => {
    try {
      await adminServices.updateProduct(req.params.id, req.body, req.files);
      res.redirect("/admin/product-details");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  getOrder: (req, res) => {
    adminServices.getAdminOrders().then((orders) => {
      //console.log(orders);
      res.render("addOrders", { orders });
    });
  },
  getadCancelorder: async (req, res) => {
    let orderId = req.params.id;
    await adminServices.canceladOrder(orderId).then((result) => {
      res.redirect("back");
    });
  },
  getPending: async (req, res) => {
    // console.log("getpxvace");
    let orderId = req.params.id;
    //console.log("order", orderId);
    await adminServices.penddingAdminOrder(orderId).then((response) => {
      res.redirect("back");
    });
  },
  getAdcancel: (req, res) => {
    let orderId = req.params.id;
    adminServices.cancelAdminOrder(orderId).then((response) => {
      res.redirect("back");
    });
  },
  getAdshipp: (req, res) => {
    let orderId = req.params.id;
    adminServices.shipOrder(orderId).then((response) => {
      res.redirect("back");
    });
  },
  getAddeliver: (req, res) => {
    let orderId = req.params.id;
    adminServices.deliverOrder(orderId).then((response) => {
      res.redirect("back");
    });
  },
  getCoupon: async (req, res) => {
    try {
      let coupons = await adminServices.getCoupons();
      res.render("coupon-details", { coupons });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  getAddcoupon: async (req, res) => {
    try {
      res.render("add-coupon");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  postAddcoupon: async (req, res) => {
    try {
      let details = req.body;
      let couponData = await adminServices.addCoupon(details);
      res.render("coupon-details", { couponData });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  getDelete: async (req, res) => {
    try {
      let coupId = req.params.id;
      await adminServices.deleteCoupon(coupId);
      res.redirect("/admin/coupon-details");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  getEditcoupon: async (req, res) => {
    try {
      let coupon = await adminServices.getCouponDetails(req.params.id);
      res.render("edit-coupon", { coupon });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  postEditcoupon: async (req, res) => {
    try {
      let coupId = req.params.id;
      let coupDetails = req.body;
      await adminServices.editCouponDetails(coupId, coupDetails);
      res.redirect("/admin/coupon-details");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  getSales: async (req, res) => {
    const productId = req.session._id;
    // let sales = await adminServices.getSalesCount();

    //console.log('ggggggg'+sales);
    await adminServices.getSalesDetails().then((products) => {
      let filter = products.filter(e=>e.orderStatus=="Delivered")
       
      res.render("sales-report", { filter });
    });
  },

  adminLogout: (req, res) => {
    req.session.adminLoggedIn = false;
    res.redirect("/admin/admin-login");
  },
};
