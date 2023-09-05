const btoa = require("btoa");
const atob = require("atob");
const jwt = require("jsonwebtoken");

const JWT_SECRET = require("../constant");
const httpStatus = require("../helpers/httpStatus.helper");

const encode = async (req, res) => {
  try {
    res.user.id = res.user.id;
    res.user.username = res.user.username;
    res.user.email = btoa(btoa(btoa(res.user.email)));

    const JWT_SECRETS = JWT_SECRET.JWT_SECRET;
    const token = jwt.sign(
      { user: res.user.email, id: res.user.id, username: res.user.username },
      JWT_SECRETS
    );

    return res.status(200).send({ status: "ok", token, data: res.user });
  } catch (error) {
    return httpStatus.sendError400(error.message, res);
  }
};

const decode = (req, res, next) => {
  try {
    const JWT_SECRETS = JWT_SECRET.JWT_SECRET;

    if (req.headers.authorization === void 0) {
      return httpStatus.sendError401(
        { message: "Authorization header missing!" },
        res
      );
    } else {
      const accessToken = req.headers.authorization.split(" ");
      if (accessToken[0] !== "Bearer") {
        httpStatus.sendError401({ message: "Unauthorized" }, res);
        return false;
      }

      jwt.verify(accessToken[1], JWT_SECRETS, (err, decoded) => {
        if (err) {
          return httpStatus.sendError401({ message: "Unauthorized" }, res);
        } else {
          res.userEmail = atob(atob(atob(decoded.user)));
          res.userId = decoded.id;
          res.username = decoded.username;
          next();
        }
      });
    }
  } catch (error) {
    return httpStatus.sendError400(error.message, res);
  }
};

module.exports = {
  encode,
  decode,
};
