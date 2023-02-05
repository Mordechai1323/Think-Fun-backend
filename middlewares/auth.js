const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = (req, res, next) => {
  let token = req.header("x-api-key");
  if (!token) {
    return res
      .status(401)
      .json({ err: "you must send token to this endpoint" });
  }
  try {
    let decodeToken = jwt.verify(token, process.env.TOKEN_SECRET);
    req.tokenData = decodeToken;
    next();
  } catch (err) {
    return res.status(401).json({ err: "Token invalid or expired" });
  }
};

exports.authAdmin = (req, res, next) => {
  let token = req.header("x-api-key");
  if (!token) {
    return res
      .status(401)
      .json({ err: "you must send token to this endpoint" });
  }
  try {
    let decodeToken = jwt.verify(token, process.env.TOKEN_SECRET);
    if (decodeToken.role != "admin") {
      return res.status(401).json({ err: "You must send token of admin to this endpoint" });
    }
    req.tokenData = decodeToken;
    next();
  } catch (err) {
    return res.status(401).json({ err: "Token invalid or expired" });
  }
};
