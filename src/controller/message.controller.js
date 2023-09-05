const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const message = mongoose.model("messages");
const room_users = mongoose.model("room_users");

const { fetchRoom } = require("./room.controller");

const httpStatus = require("../helpers/httpStatus.helper");

/**
 * @swagger
 * components:
 *   schemas:
 *     Messages:
 *       type: object
 *       required:
 *         - toId
 *         - roomId
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *         messageType:
 *           type: string
 *         type:
 *           type: string
 *         roomId:
 *           type: string
 *         fromId:
 *           type: string
 *         toId:
 *           type: string
 *         message:
 *           type: string
 *         created:
 *           type: date
 *         __v:
 *           type: number
 *       example:
 *         _id: 634d191fc504a19f658fef19
 *         messageType: text/plain
 *         type: group
 *         read: true
 *         roomId: 6348fc291c539376e495b446
 *         fromId: 63357a634211588739bd6780
 *         message: 'hello'
 *         created: 2022-10-17T09:28:55.970+00:00
 *         toId: 633579f64211588739bd6732
 *         __v: 0
 */

const saveMessage = async (data, io, type) => {
  const { file } = data;

  if (file) {
    const uploadPath = path.join(
      __dirname,
      "./../../public/images/",
      data.message
    );
    const baseUrl = path.join("/public/images/", data.message);

    fs.writeFile(uploadPath, file, (err) => {
      console.log("File Upload", err ? "Error" : "Success");
    });

    data = { ...data, message: baseUrl };
  }

  delete data.file;
  data.created = new Date();

  /**
   * In Case of group message
   */

  if (type === "group") {
    const userData = await room_users.find({ roomId: data.roomId });
    data.toId = userData[0].userId;
    data.type = "group";
  }

  const responseMessage = await message.create(data);
  const response = await message
    .findOne({ _id: responseMessage._id })
    .populate("fromId", "username")
    .exec();

  io.to(data.roomId).emit("msg-recieve", response);
  io.to(data.toId).emit("unread-count-listener", response);
};

/**
 * @swagger
 * /messages/:toId/fetch:
 *   get:
 *     description: View Messages
 *     tags:
 *       - Messages
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

const fetch = async (req, res) => {
  try {
    const type = req.query.type === "group" ? "group" : "personal";

    res.limitCount = req.query.limit ? req.query.limit : 1000;
    res.skipCount = req.query.skip ? req.query.skip : 0;
    let roomID;
    if (type !== "group") {
      let roomid = await fetchRoom(req.params.toId, res.userId, "personal");
      roomID = mongoose.Types.ObjectId(roomid);
    } else {
      roomID = mongoose.Types.ObjectId(req.params.toId);
    }

    const totalCount = await message.countDocuments({ roomId: roomID });
    const results = await message
      .find({ roomId: roomID })
      .limit(parseInt(res.limitCount))
      .skip(parseInt(res.skipCount))
      .sort({ created: 1 })
      .populate("fromId", "username")
      .exec();

    await room_users.updateMany(
      { roomId: roomID, userId: res.userId },
      { $set: { isRead: true } }
    );
    httpStatus.sendResp200({ totalCount, records: results }, res);

    await message.updateMany(
      { roomId: roomID, toId: res.userId },
      { $set: { read: true } }
    );
  } catch (err) {
    return httpStatus.sendError400(err.message, res);
  }
};

const deleteMessage = async (data, io) => {
  const { messageId, toId, fromId, type } = data;
  let roomId;
  if (type !== "group") {
    let roomid = await fetchRoom(toId, fromId, "personal");

    roomId = mongoose.Types.ObjectId(roomid);
  }
  const status = { status: "delete" };

  const response = await message
    .findOneAndUpdate({ _id: mongoose.Types.ObjectId(messageId) }, status, {
      new: true,
    })
    .populate("fromId", "username")
    .exec();

  io.to(roomId.toString()).emit(
    "delete-message-listener",
    response,
    function (err) {
      console.log(err ? err.message : "success");
    }
  );
};

module.exports = {
  fetch,
  saveMessage,
  deleteMessage,
};
