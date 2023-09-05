"use strict";

const jwt = require("../middleware/jwt.validator");
const controller = require("../controller");

module.exports = (app, io) => {
  const socket = require("../controller/socket");
  socket.start(io);

  app.route("/messages/:toId/fetch").get(jwt.decode, controller.fetchMessage);
  app
    .route("/group/member/:roomId")
    .get(jwt.decode, controller.fetchGroupMember)
    .put(jwt.decode, controller.removeGroupMember)
    .post(jwt.decode, controller.addGroupMember);

  app.route("/group/:roomId").delete(jwt.decode, controller.deleteGroup);
  app.route("/group/leave/:roomId").put(jwt.decode, controller.leaveGroup);
  app.route("/rename/group/:roomId").put(jwt.decode, controller.renameGroup);

  app
    .route("/notifications/list")
    .get(jwt.decode, controller.notificationIndex);
  app
    .route("/notifications/read")
    .post(jwt.decode, controller.readNotifications);
};
