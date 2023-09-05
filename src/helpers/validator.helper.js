const Joi = require("joi");

const userRG = {
  username: Joi.string().trim().required(),
  email: Joi.string().trim().required(),
  password: Joi.string()
    .regex(RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*[$@$!#.]){8,20}/))
    .required()
    .trim()
    .min(8)
    .max(20),
  app:Joi.string().optional()
};

const userLogin = {
  email: Joi.string().required().trim(),
  password: Joi.string().required().trim(),
};

const resetPassword ={
  newPassword: Joi.string().required().trim(),
  confirmNewPassword: Joi.string().required().trim(),
}

module.exports = {
  userRG,
  userLogin,
  resetPassword
};
