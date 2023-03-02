const verifyLogin = (req, res, next) => {
    if (req.session.User) {
      next();
    } else {
      res.redirect("/login");
    }
  }
  module.exports=verifyLogin