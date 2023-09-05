const mongoose = require("mongoose");
const room = mongoose.model("rooms");
const message = mongoose.model("messages");
const room_user = mongoose.model("room_users");
const notifications = mongoose.model("notifications");
const { isAdmin } = require("../middleware/custom.validator");
const httpStatus = require("../helpers/httpStatus.helper");

/**
 * @swagger
 * components:
 *   schemas:
 *     rooms:
 *       type: object
 *       required:
 *         - name
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *         name:
 *           type: string
 *         fromId:
 *           type: string
 *         toId:
 *           type: string
 *         created:
 *           type: date
 *         __v:
 *           type: number
 *       example:
 *         _id: 6348fc291c539376e495b448
 *         type: group
 *         name: Alok's room
 *         fromId: 6348fc291c539376e495b448
 *         toId: 6348fc291c539376e495b448
 *         created: 2022-10-17T09:28:55.970+00:00
 *         __v: 0
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     room_users:
 *       type: object
 *       required:
 *         - roomId
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *         isRead:
 *           type: boolean
 *         roomId:
 *           type: string
 *         userId:
 *           type: string
 *         created:
 *           type: date
 *         __v:
 *           type: number
 *       example:
 *         _id: 6348fc291c539376e495b448
 *         isRead: false
 *         roomId: 6348fc291c539376e495b498
 *         userId: 6348fc291c539376e495b446
 *         created: 2022-10-17T09:28:55.970+00:00
 *         __v: 0
 */

/**
 * @swagger
 * /all/rooms:
 *   get:
 *     description: List all room
 *     tags:
 *       - Rooms
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

const index = async (req, res) => {
  const roomUsers = await room_user
    .find({ userId: res.userId })
    .populate("roomId")
    .exec();

  var promises = roomUsers.map((roomUser) => {
    const { roomId, isRead } = roomUser.toJSON();
    return { ...roomId, isRead };
  });

  return Promise.all(promises)
    .then((response) => httpStatus.sendResp200(response, res))
    .catch((err) => httpStatus.sendError400(err.message, res));
};

/**
 * @swagger
 * /create/room:
 *   post:
 *     description: create room
 *     tags:
 *       - Rooms
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: Bearer token
 *         in: header
 *         required: true
 *         type: string
 *       - name: Body
 *         description:  The request body contains an room detail
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - userId
 *           properties:
 *            name:
 *              type: string
 *              example: 'room-one'
 *            userId:
 *              type: string
 *              example: '631742cdd0dcab2291b62222'
 *            type:
 *              type: string
 *              example: personal
 *
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
const create = async (req, res) => {
  try {
    req.body.created = new Date();
    req.body.fromId = res.userId;
    req.body.type = "group";

    const user = req.body.users;
    req.body.toId = user[0].value;

    const newRoom = await room.create(req.body);

    const userIds = user.map((val) => val.value);
    const ids = [...userIds, res.userId];
    if (userIds.length >= 2) {
      const input = ids.map((val) => {
        return {
          roomId: newRoom._id,
          userId: val,
        };
      });

      room_user.insertMany(input);
    } else {
      const message = "Group must have at least 2 Members";
      return httpStatus.sendError400(message, res);
    }
    const notificationsData = userIds.map((userId) => {
      return {
        toId: userId,
        type: "group-create", 
        message: `${res.username} added you in ${newRoom.name} group.`,
      };
    });

    notifications.insertMany(notificationsData);

    return httpStatus.sendResp200(newRoom, res);
  } catch (err) {
    return httpStatus.sendError400(err.message, res);
  }
};
/**
 * @swagger
 * /group/member/:roomId:
 *   get:
 *     description: fetch member from the group
 *     tags:
 *       - Rooms
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
const fetchGroupMember = async (req, res) => {
  try {
    const groupMember = await room_user
      .find({ roomId: req.params.roomId })
      .populate("userId", "username")
      .exec();
    
    return httpStatus.sendResp200(groupMember, res);
  } catch (err) {
    return httpStatus.sendError400(err.message, res);
  }
};
/**
 * @swagger
 * /group/member/:roomId:
 *   post:
 *     description: Add member in the group
 *     tags:
 *       - Rooms
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: Bearer token
 *         in: header
 *         required: true
 *         type: string
 *       - name: Body
 *         description:  The request body contains an room detail
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - userId
 *           properties:
 *            userId:
 *              type: string
 *              example: 'user id eg 631742cdd0dcab2291b62222'
 *
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
const addGroupMember = async (req, res) => {
  try {
    const oldRoom = await room.findOne({ _id: req.params.roomId });

    if (oldRoom.fromId == res.userId) {
      const user = req.body.user;

      const userIds = user.map((val) => val.value);

      const input = userIds.map((val) => {
        return {
          roomId: req.params.roomId,
          userId: val,
        };
      });

      await room_user.insertMany(input);

      const notificationsData = userIds.map((userId) => {
        return {
          toId: userId,
          type: "group-create",
          message: `${res.username} added you in ${oldRoom.name} group.`,
        };
      });

      await notifications.insertMany(notificationsData);

      return httpStatus.sendResp200(notificationsData, res);
    } else {
      const message = "You are not allowed to add member in this group";
      return httpStatus.sendError400(message, res);
    }
  } catch (err) {
    return httpStatus.sendError400(err.message, res);
  }
};

/**
 * @swagger
 * /group/member/:roomId:
 *   put:
 *     description: remove member from the group
 *     tags:
 *       - Rooms
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: Bearer token
 *         in: header
 *         required: true
 *         type: string
 *       - name: Body
 *         description:  The request body contains an room detail
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - userId
 *           properties:
 *            userId:
 *              type: string
 *              example: 'user id eg 631742cdd0dcab2291b62222'
 *
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
const removeGroupMember = async (req, res) => {
  try {
    const oldRoom = await room.findOne({ _id: req.params.roomId });

    if (oldRoom.fromId == res.userId) {
      await room_user.deleteOne({
        userId: mongoose.Types.ObjectId(req.body.userId),
        roomId: mongoose.Types.ObjectId(req.params.roomId),
      });

      return httpStatus.sendResp200({message:'group member removed successfully'}, res);
    } else {
      const message = "You are not allowed to remove member from this group";
      return httpStatus.sendError400(message, res);
    }
  } catch (err) {
    return httpStatus.sendError400(err.message, res);
  }
};

/**
 * @swagger
 * /group/:roomId:
 *   delete:
 *     description: delete group
 *     tags:
 *       - Rooms
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
const deleteGroup = async (req, res) => {
  try {
    const oldRoom = await room.findOne({ _id: req.params.roomId });

    if (oldRoom.fromId == res.userId) {
      await room.deleteOne({ _id: req.params.roomId });
      await room_user.deleteMany({ roomId: req.params.roomId });
      await message.deleteMany({ roomId: req.params.roomId });
      return httpStatus.sendResp200("deleted", res);
    } else {
      const message = "You are not allowed to remove member from this group";
      return httpStatus.sendError400(message, res);
    }
  } catch (err) {
    return httpStatus.sendError400(err.message, res);
  }
};

/**
 * @swagger
 * /group/leave/:roomId:
 *   put:
 *     description: leave the group
 *     tags:
 *       - Rooms
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         description: Bearer token
 *         in: header
 *         required: true
 *         type: string
 *       - name: Body
 *         description:  The request body contains an userId
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - userId
 *           properties:
 *            userId:
 *              type: string
 *              example: 'user id eg 631742cdd0dcab2291b62222'
 *
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
const leaveGroup = async (req, res) => {
  try {
    const oldRoom = await room.findOne({ _id: req.params.roomId });
    if (oldRoom.fromId !== res.userId) {
      await room_user.deleteOne({
        userId: req.body.userId,
        roomId: req.params.roomId,
      });
      return httpStatus.sendResp200({message:"group left successfully"}, res);
    } else {
      const message = "Admin is not allowed to leave this group";
      return httpStatus.sendError401({ message: message }, res);
    }
  } catch (err) {
    httpStatus.sendError400(err.message, res);
  }
};

const renameGroup = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const { newname } = req.body;
    const admin = await isAdmin(roomId, res.userId);

    if (admin === true) {
    
      await room.updateOne({ _id: roomId, fromId: res.userId },{ $set: { name: newname } });
      return httpStatus.sendResp200("Group Name changed successfully", res);
    } else {
      const message = "You are not allowed to change the name of this group";
      return httpStatus.sendError401({ message: message }, res);
    }
  } catch (err) {
    httpStatus.sendError400(err.message, res);
  }
};
const joinRoom = async (data) => {
  try {
    data.name = "personal";
    data.created = new Date();
    return await room.create(data);
  } catch (err) {
    return httpStatus.sendError400(err.message, res);
  }
};

const fetchRoom = async (toId, fromId, type) => {
  const roomExist = await room
    .find()
    .or([
      { $and: [{ toId: toId }, { fromId: fromId }, { type: type }] },
      { $and: [{ toId: fromId }, { fromId: toId }, { type: type }] },
    ]);

  return roomExist[0] ? roomExist[0]._id : 0;
};

module.exports = {
  index,
  create,
  fetchGroupMember,
  addGroupMember,
  removeGroupMember,
  deleteGroup,
  leaveGroup,
  fetchRoom,
  joinRoom,
  renameGroup,
};
