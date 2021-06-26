var express = require("express");
var router = express.Router();
const User = require("../models/user");
const Articles = require("../models/articles");
const Category = require("../models/categories");
const { requireSignin, isAuth } = require("../controller");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { errorHandler } = require("../helper/dbErrorHandler");
var cors = require("cors");
//cors
router.use(
  cors({
    origin: "*",
  })
);
router.get("/", function (req, res, next) {
  Articles.find()
    .select("-image")
    .populate("category")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
});
router.get("/image/:articleId", (req, res, next) => {
  if (req.article.image.data) {
    res.set("Content-Type", req.article.image.contentType);
    return res.send(req.article.image.data);
  }
});
router.get("/category/:categoryId", function (req, res, next) {
  Articles.find({ _id: { $ne: req.product }, category: req.category })
    // .select("-image")
    .populate("category")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
});

router.post(
  "/create/:userId",
  requireSignin,
  isAuth,
  function (req, res, next) {
    let form = new formidable.IncomingForm();
    form.keepxtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "Image could not be uploaded",
        });
      }
      let articles = new Articles(fields);
      if (files.image) {
        if (files.image.size > 1000000) {
          return res.status(400).json({
            error: "Max limit of image is less than 1mb",
          });
        }
        articles.image.data = fs.readFileSync(files.image.path);
        articles.image.contentType = files.image.type;
      }
      const { title, description, postedBy, category, source, image } = fields;

      articles.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }
        res.json(result);
      });
    });
  }
);

router.get("/:articleId", (req, res, next) => {
  //   req.article.image = undefined;
  return res.json(req.article);
});
router.delete(
  "/:articleId/:userId",
  requireSignin,
  isAuth,
  (req, res, next) => {
    let article = req.article;
    article.remove((err, deleteProduct) => {
      if (err) {
        return res.status(400).json({
          error: "Delete unsuccessful",
        });
      }
      return res.json({ message: "Article successfully deleted!" });
    });
  }
);
router.put("/:articleId/:userId", requireSignin, isAuth, (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepxtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
    let articles = req.article;
    articles = _.extend(articles, fields);
    if (files.image) {
      if (files.image.size > 1000000) {
        return res.status(400).json({
          error: "Max limit of image is less than 1mb",
        });
      }
      articles.image.data = fs.readFileSync(files.image.path);
      articles.image.contentType = files.image.type;
    }
    const { title, description, postedBy, category, source, image } = fields;

    articles.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(result);
    });
  });
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

router.param("articleId", (req, res, next, id) => {
  Articles.findById(id).exec((err, article) => {
    if (err || !article) {
      return res.status(400).json({
        error: "Article Not found",
      });
    }
    req.article = article;
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
