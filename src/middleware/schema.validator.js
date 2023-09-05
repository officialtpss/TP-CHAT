const Joi = require("joi");
const httpStatus = require("../helpers/httpStatus.helper");


const validator = function (schemaObject) {
  return function (req, res, next) {
    const schema = Joi.object(schemaObject);
    var payload = Object.assign(
      {},
      req.params || {},
      req.query || {},
      req.body || {}
    );

    const { error } = schema.validate(payload);

    if (error) {
      return httpStatus.sendError400(error.message, res);
    } else {
      next();
    }
  };
};

module.exports = validator;
