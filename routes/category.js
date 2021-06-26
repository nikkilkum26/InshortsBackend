var express = require("express");
var router = express.Router();
const Category = require("../models/categories");
const { errorHandler } = require("../helper/dbErrorHandler");
const { requireSignin, isAuth } = require("../controller");
const User = require("../models/user");
var cors = require("cors");
//cors
router.use(
  cors({
    origin: "*",
  })
);

router.post(
  "/create/:userId",
  requireSignin,
  isAuth,
  function (req, res, next) {
    let category = new Category(req.body);
    category.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json({ data });
    });
  }
);
router.put(
  "/update/:categoryId/:userId",
  requireSignin,
  isAuth,
  function (req, res, next) {
    let category = req.category;
    category.name = req.body.name;
    category.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Category not found",
        });
      }
      res.json({ data });
    });
  }
);
router.delete(
  "/delete/:categoryId/:userId",
  requireSignin,
  isAuth,
  function (req, res, next) {
    let category = req.category;
    category.remove((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json({ message: "Successfully deleted" });
    });
  }
);
router.get("/", function (req, res, next) {
  Category.find().exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json(data);
  });
});
router.get("/:categoryId", (req, res, next) => {
  return res.json(req.category);
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
router.param("categoryId", (req, res, next, id) => {
  Category.findById(id).exec((err, category) => {
    if (err || !category) {
      return res.status(400).json({
        error: "CATEGORY Not found",
      });
    }
    req.category = category;
    next();
  });
});

module.exports = router;
