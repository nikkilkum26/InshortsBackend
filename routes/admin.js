var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const User = require("../models/user");
var cors = require("cors");
const { rawListeners } = require("../models/user");
// const { userSignupValidator } = require("../validator");
//cors
router.use(
  cors({
    origin: "*",
  })
);
const isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: "Access Denied",
    });
  }
  next();
};

const requireSignin = expressJwt({
  secret: "ksdjfhkwehkj34o8ruo349tj34fji43yt98ur3k43nfkj32eiuhco2e",
  // algorithms:["HS256"],
  userProperty: "auth",
});

router.post("/register", function (req, res, next) {
  console.log(req.body);
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err,
      });
    }
    res.json({
      user,
    });
  });
});

router.post("/signin", function (req, res, next) {
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        err: "User doesnot exist",
      });
    }
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email or Password is Wrong",
      });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.cookie("t", token, { expire: new Date() + 10000 });
    const { _id, name, email } = user;
    return res.json({ token, user: { _id, name, email } });
  });
});

router.get("/signout", function (req, res, next) {
  res.clearCookie("t");
  res.json({ message: "Signout success" });
});
router.get("/home/:userId", requireSignin, isAuth, function (req, res, next) {
  res.json({ message: "hi success " + req.profile.name });
});
router.param("userId", (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User Not found",
      });
    }
    req.profile = user;
    next();
  });
});

module.exports = router;
