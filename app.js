const express = require("express");
const path = require("path");
const session = require("express-session");
const usersRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const hbs = require("hbs");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");

dbConnect();
const app = express();

app.set("views", [
  path.join(__dirname, "views/admin"),
  path.join(__dirname, "views/user"),
]);

app.set("view engine", "hbs");

hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "key",
    cookie: { maxAge: 600000 },
    resave: true,
    saveUninitialized: false,
  })
);

app.use("/admin", adminRouter);
app.use("/", usersRouter);

app.all("*", (req, res) => {
  res.render("error") 
});

app.listen(process.env.port || 7000);
