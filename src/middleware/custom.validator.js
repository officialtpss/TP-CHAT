const mongoose = require("mongoose");
const room = mongoose.model("rooms");
const isAdmin = async (roomId, fromId) => {
  const admin = await room
    .findOne(
      { _id: roomId, fromId: fromId },
      { created: 0, toId: 0, __v: 0, type: 0 }
    )
    .populate("fromId", "username")
    .exec();

  return (admin !== null) ? true: false;
};
module.exports = {
  isAdmin,
};
