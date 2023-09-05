"use strict";

/**
 * rooms Schema
 */
module.exports = (mongoose) => {
  const Schema = mongoose.Schema,
    groupSchema = new Schema({
      roomId: {
        type: Schema.ObjectId,
        ref: "rooms",
        required: "roomId cannot be blank",
      },
      userId: {
        type: Schema.ObjectId,
        ref: "users",
        required: "userId cannot be blank",
      },
      isRead: {
        type: Boolean,
        default: false,
      },
      created: {
        type: Date,
        default: Date.now,
      },
    });

  mongoose.model("room_users", groupSchema);
};
