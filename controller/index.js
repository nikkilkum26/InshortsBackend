const expressJwt = require("express-jwt");
exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: "Access Denied",
    });
  }
  next();
};
exports.requireSignin = expressJwt({
  secret: "ksdjfhkwehkj34o8ruo349tj34fji43yt98ur3k43nfkj32eiuhco2e",
  // algorithms:["HS256"],
  userProperty: "auth",
});
