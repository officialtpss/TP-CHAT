/**
 * Module dependencies.
 */
const mongoose = require("mongoose");
const users = mongoose.model("users");
const message = mongoose.model("messages");
const notifications = mongoose.model("notifications");
const room_user = mongoose.model("room_users");
const bcrypt = require("bcrypt");
const httpStatus = require("../helpers/httpStatus.helper");
const { sendEmail, sendTokenToMail } = require("../email/emailService");
const { JWT_SECRET } = require("../constant");
const jwt = require("jsonwebtoken");

/**
 * @swagger
 * components:
 *   schemas:
 *     Users:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         status:
 *           type: string
 *         created:
 *           type: date
 *         __v:
 *           type: number
 *       example:
 *         _id: '633579ca4211588739bd6746'
 *         status: 'online'
 *         email: 'abc@test.com'
 *         username:  Abc3018
 *         password: Password@12345
 *         created: 2022-10-17T09:28:55.970+00:00
 *         __v: 0
 */

/**
 * @swagger
 * /create/users:
 *   post:
 *     description: user registration
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Body
 *         description:  The request body contains an room detail
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - username
 *             - email
 *             - password
 *           properties:
 *            username:
 *              type: string
 *              example: 'ishaan'
 *            email:
 *              type: string
 *              example: 'ishaan@test.com'
 *            password:
 *              type: string
 *              example: Password!23
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description:  Internal Server Error
 *
 */

const register = async (req, res, next) => {
  try {
    const { email, username, password, app } = req.body;

    const usernameCheck = await users.findOne({ username });
    if (usernameCheck) {
      return httpStatus.sendError409("Username already used", res);
    }
    const emailCheck = await users.findOne({ email });

    if (emailCheck) {
      return httpStatus.sendError409("Email already used", res);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await users.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    res.user = user;
    const mailContent = { email: user.email, name: user.username, app: app };
    sendEmail(mailContent);
    next();
  } catch (err) {
    httpStatus.sendError400(err.message, res);
  }
};
/**
 * @swagger
 * /login/users:
 *   put:
 *     description: user registration
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Body
 *         description:  The request body contains an user detail
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - username
 *             - password
 *           properties:
 *            username:
 *              type: string
 *              example: 'ishaan'
 *            password:
 *              type: string
 *              example: Password!23
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description:  Internal Server Error
 *
 */

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const checkUser = await users.findOne({ email });
    if (!checkUser) {
      return httpStatus.sendError404("Invalid Email Address", res);
    } else {
      const checkPassword = bcrypt.compareSync(password, checkUser.password);
      if (checkPassword === false) {
        return httpStatus.sendError404(
          "Incorrect Password! Please try again.",
          res
        );
      }
      res.user = checkUser;
      next();
    }
  } catch (err) {
    httpStatus.sendError400(err.message, res);
  }
};

/**
 * @swagger
 * /all/users:
 *   get:
 *     description: List all users
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: Bearer token
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description:  Internal Server Error
 *
 */
const getAllUsers = async (req, res) => {
  const allUsers = await users.find(
    { _id: { $ne: res.userId } },
    { password: 0 }
  );
  const all = allUsers.map(async (user) => {
    return await message
      .countDocuments({
        read: false,
        toId: res.userId,
        fromId: user._id,
        type: "personal",
      })
      .then((count) => {
        user["_doc"]["unreadCount"] = count;
        return user;
      });
  });
  const userIds = mongoose.Types.ObjectId(res.userId);

  const result = await users.aggregate([
    {
      $lookup: {
        from: "messages",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$fromId", "$$userId"],
              },
            },
          },
          // { $project: { _id: 1 } },
        ],
        as: "allMessages",
      },
    },
    {
      $project: {
        users: 1,
        username: 1,
        status: 1,
        allMessages: 1,
      },
    },
    // {
    //   $match: {
    //     _id: { $ne: userIds },
    //   },
    // },
  ]);
  // console.log(result);
  // $expr: {
  //   $and: [
  //     {
  //       $eq: ["$fromId", "$$userId"],
  //     },
  //     {
  //       $eq: ["$toId", res.userId],
  //     },
  //     {
  //       $eq: ["$type", "personal"],
  //     },
  //     // {
  //     //   $eq: ["$read", false],
  //     // },
  //   ],
  // },
  const groupUnreadCount = await room_user
    .countDocuments({ userId: res.userId, isRead: false })
    .exec();
  const notificationCount = await notifications.countDocuments({
    toId: res.userId,
    read: false,
  });
  const sortList = await message
    .find({ toId: res.userId, type: "personal" }, { fromId: 1, _id: 0 })
    .sort({ created: 1 });
  const recievedMessageIds = sortList?.map((x) => x.fromId);
  const latestMsgId = recievedMessageIds[recievedMessageIds.length - 1];
  const unique = [...new Set(recievedMessageIds)];
  const restUser = unique.filter((x) => x !== latestMsgId);
  const uniqueArray = [latestMsgId, ...restUser];
  const sortedIds = await users.find({
    _id: { $in: uniqueArray },
  });
  let sortedId = sortedIds;
  const sortArray = (arr1, arr2) => {
    if (arr1.length > 0 && arr2.length > 0) {
      const arr3 = arr2.sort((a, b) => {
        const aValue = Object.values(a)[0]._id;
        const bValue = Object.values(b)[0]._id;
        return (
          arr1.indexOf(aValue.toString()) - arr1.indexOf(bValue.toString())
        );
      });
      return arr3;
    } else {
      return false;
    }
  };
  const arr4 = sortArray(uniqueArray, sortedId);
  return Promise.all(all)
    .then(async (result) => {
      let response;
      if (arr4.length > 0) {
        const userIdWithNoMessage = result?.filter(
          (x) => !uniqueArray.includes(x._id.toString())
        );
        response = [...arr4, ...userIdWithNoMessage];
      } else {
        response = result;
      }
      return httpStatus.sendResp200(
        { response, notificationCount, groupUnreadCount },
        res
      );
    })
    .catch((err) => httpStatus.sendError400(err.message, res));
};

const editProfile = async (req, res, next) => {
  try {
    const username = req.body.newname;

    await users.updateOne(
      { _id: res.userId },
      { $set: { username: username } }
    );

    const updatedUser = await users.findOne({ _id: res.userId });

    res.user = updatedUser;
    next();
  } catch (err) {
    return httpStatus.sendError400(err.message, res);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { oldpassword, password } = req.body;

    const checkUser = await users.findOne({ _id: res.userId });
    const checkPassword = bcrypt.compareSync(oldpassword, checkUser.password);

    if (checkPassword === true) {
      if (oldpassword !== password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await users.updateOne(
          { _id: res.userId },
          { $set: { password: hashedPassword } }
        );
        return httpStatus.sendResp200("Password Updated", res);
      } else {
        return httpStatus.sendError409("Both Password should not be same", res);
      }
    } else {
      return httpStatus.sendError404("Old Password is Incorrect", res);
    }
  } catch (err) {
    return httpStatus.sendError400(err.message, res);
  }
};

const userUpdateStatus = async (userId, status) => {
  try {
    const userExist = await users.findOne({
      _id: userId,
    });

    if (userExist) {
      await users.updateOne(
        { _id: userId },
        {
          $set: {
            status,
            created: new Date(),
          },
        }
      );
    }
  } catch (error) {
    return httpStatus.sendError400(error.message, res);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, app = "react" } = req.body;
    const oldUser = await users.findOne({ email: email });
    if (oldUser) {
      sendTokenToMail({
        name: oldUser.username,
        email: oldUser.email,
        _id: oldUser._id,
        password: oldUser.password,
        app: app,
      });
    } else {
      return httpStatus.sendError404(
        "This Email is not registered with us",
        res
      );
    }
    return httpStatus.sendResp200("Please check your mail. ", res);
  } catch (err) {
    return httpStatus.sendError400(err.message, res);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    const secret = JWT_SECRET;

    const verify = jwt.verify(token, secret);
    const oldUser = await users.findOne({ _id: verify.id });
    const checkPassword = bcrypt.compareSync(newPassword, verify.password);

    if (!oldUser) {
      return httpStatus.sendError404("User does not exist", res);
    } else if (checkPassword === true) {
      return httpStatus.sendError409(
        "Old Password and New Password should not be  same",
        res
      );
    } else if (newPassword !== confirmNewPassword) {
      return httpStatus.sendError404(
        "New Password should match with Confirm New Password",
        res
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await users.updateOne(
      { _id: verify.id },
      { $set: { password: hashedPassword } }
    );

    return httpStatus.sendResp200("Password reset successfully", res);
  } catch (err) {
    return httpStatus.sendError400(err.message, res);
  }
};
module.exports = {
  register,
  login,
  getAllUsers,
  userUpdateStatus,
  editProfile,
  updatePassword,
  forgetPassword,
  resetPassword,
};
