const { fetchRoom, joinRoom } = require("./room.controller");
const { userUpdateStatus, sortUser } = require("./user.controller");
const { saveMessage, deleteMessage } = require("./message.controller");
const { groupNotification } = require("./notification.controller");

module.exports.start = (io) => {
  const activeUsers = new Set();

  io.on("connection", (socket) => {

    socket.on("connects", (data) => {
      socket.userId = data;
      socket.join(data);
      activeUsers.add(data);
      io.emit("updateUserStatus", [...activeUsers]);
      userUpdateStatus(socket.userId, "online");
    });

    socket.on("logout", (userId) => {
      activeUsers.delete(userId);
      io.emit("updateUserStatus", [...activeUsers]);
      userUpdateStatus(socket.userId, "offline");
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        activeUsers.delete(socket.userId);
        io.emit("updateUserStatus", [...activeUsers]);
        userUpdateStatus(socket.userId, "offline");
      }
    });

    socket.on("user-disconnect", () => {
      if (socket.roomId) {
        socket.leave(socket.roomId);
      }
    });

    socket.on("user-connect", async (data) => {
      if (data && data.roomId) {
        socket.roomId = data.roomId;
        socket.join(data.roomId);
      } else if (data && data.fromId && data.toId) {
        let roomId = await fetchRoom(data.toId, data.fromId, "personal");
        roomId = roomId.toString();
        if (roomId == 0) {
          const response = await joinRoom(data);
          roomId = response._id.toString();
        }
        socket.roomId = roomId;
        socket.join(roomId);
      }
    });
   
    socket.on("sent-message", async (data) => {
      if (
        data &&
        data.roomId &&
        data.fromId &&
        data.message &&
        data.message.trim().length > 0
      ) {
        saveMessage(data, io, "group");
        groupNotification(data.roomId, data.fromId, io);
      } else if (
        data &&
        data.toId &&
        data.fromId &&
        data.message &&
        data.message.trim().length > 0
      ) {
        const roomId = await fetchRoom(data.toId, data.fromId, "personal");
        if (roomId !== 0) {
          data.roomId = roomId.toString();
          saveMessage(data, io, "personal");
        }
      }
    });

    socket.on("notification", async (data) => {
      if (data && data.users) {
        data.users.map((user) => {
          io.to(user.value.toString()).emit(
            "notification-msg",
            `${data.admin} has added you in ${data.name} group`
          );
        });
      }
    });

    socket.on("message-delete", async (data) => {
      if (data && data.messageId && data.fromId && data.toId) {
        data.type = "personal";
        deleteMessage(data, io);
      }
    });
  });
};
