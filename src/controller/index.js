const user = require("./user.controller");
const room = require("./room.controller");
const message = require("./message.controller");
const notification = require("./notification.controller");

module.exports = {
  userCreate: user.register,
  userLogin: user.login,
  userIndex: user.getAllUsers,
  editProfile: user.editProfile,
  updatePassword: user.updatePassword,
  forgetPassword: user.forgetPassword,
  resetPassword: user.resetPassword,
  roomCreate: room.create,
  roomIndex: room.index,

  renameGroup: room.renameGroup,
  fetchGroupMember: room.fetchGroupMember,
  addGroupMember: room.addGroupMember,
  removeGroupMember: room.removeGroupMember,
  deleteGroup: room.deleteGroup,
  leaveGroup: room.leaveGroup,

  fetchMessage: message.fetch,
  

  notificationIndex: notification.index,
  readNotifications: notification.readNotifications,
};
