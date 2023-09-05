const mongoose = require("mongoose");
const notifications = mongoose.model("notifications");
const room_user = mongoose.model("room_users");
const httpStatus = require("../helpers/httpStatus.helper");

/**
 * @swagger
 * components:
 *   schemas:
 *     Notifications:
 *       type: object
 *       required:
 *         - type
 *         - toId
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *         read:
 *           type: boolean
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
 *         type: 'group-create'
 *         read: true
 *         toId: 633579f64211588739bd6732
 *         message: 'user A  added you in test-one group.'
 *         created: 2022-10-17T09:28:55.970+00:00
 *         __v: 0
 */

/**
 * @swagger
 * /notifications/list:
 *   get:
 *     description: List Notifications
 *     tags:
 *       - Notifications
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
 *         description: Success
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 *
 */
const index = async (req, res) => {
  try {
    const response = await notifications
      .find({ toId: res.userId })
      .sort({ created: -1 });
    const count = await notifications.countDocuments({
      toId: res.userId,
      read: false,
    });
    return httpStatus.sendResp200({ response, count }, res);
  } catch (error) {
    return httpStatus.sendError400(error.message, res);
  }
};

/**
 * @swagger
 * /notifications/read:
 *   post:
 *     description: Read Notification
 *     tags:
 *       - Notifications
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
 *             - type
 *             - actionId
 *           properties:
 *            type:
 *              type: string
 *              example: 'one or group'
 *            actionId:
 *              type: string
 *              example: 'notification id or auth user id eg 631742cdd0dcab2291b62222'
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
const readNotifications = async (req, res) => {
  try {
    const { type, actionId } = req.body;

    const condition = {
      ...(type === "one" ? { action: "_id" } : { action: "toId" }),
      ...(type === "one" ? { actionId: actionId } : { actionId: res.userId }),
      ...(type === "one" ? { model: "updateOne" } : { model: "updateMany" }),
    };

    // const condition = {...(type === "one" ? { action: "_id",actionId: actionId, model: "updateOne" } : { action: "toId",actionId: res.userId, model: "updateMany" })};

    await notifications[condition.model](
      { [condition.action]: [condition.actionId] },
      { read: true }
    );

    return index(req, res);
  } catch (error) {
    return httpStatus.sendError400(error.message, res);
  }
};

const groupNotification = async (roomId, fromId, io) => {
  try {
    room_user
      .updateMany(
        { roomId: roomId, userId: { $ne: fromId } },
        { $set: { isRead: false } }
      )
      .then(() => {
        return room_user.find({
          roomId: mongoose.Types.ObjectId(roomId),
          userId: { $ne: mongoose.Types.ObjectId(fromId) },
          isRead: false,
        });
      })
      .then((groupMember) => {
        groupMember.map((val) => {
          io.to(val.userId.toString()).emit(
            "group-msg-listener",
            { roomId, fromId },
            function (err) {
              console.log(err ? err.message : "success");
            }
          );
        });
      })
      .catch((err) => {
        console.log("Error: " + err.message);
      });
  } catch (err) {
    console.log("error message", err.message);
  }
};

module.exports = {
  index,
  readNotifications,
  groupNotification,
};
