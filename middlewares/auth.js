const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ err: "authentication missing" });
  const token = authHeader
  //const token = authHeader.split(" ")[1];
  try {
    let decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.tokenData = decodeToken;
    next();
  } catch (err) {
    return res.status(403).json({ err: "fail validating token" });
  }
};

exports.authAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ err: "authentication missing" });
  const token = authHeader
  //const token = authHeader.split(" ")[1];
  try {
    let decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decodeToken.role != "admin") {
      return res.status(401).json({ err: "authentication missing!!!!!!!!!" });
    }
    req.tokenData = decodeToken;
    next();
  } catch (err) {
    return res.status(403).json({ err: "fail validating token" });
  }
};

exports.authRefresh = (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.token) return res.status(401).json({ err: "no cookies" });
  const refreshToken = cookies.token;
  try {
    let decodeToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.tokenData = decodeToken;
    req.refreshToken = refreshToken;
    next();
  } catch (err) {
    return res.status(403).json({ err: "fail validating token" });
  }
};

exports.getTokenFromRequest = (req) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  return authHeader.split(" ")[1];
};
