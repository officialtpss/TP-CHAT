"use strict";

/**
 * messages Schema
 */
module.exports = (mongoose) => {
  const Schema = mongoose.Schema,
    messageSchema = new Schema({
      roomId: {
        type: Schema.ObjectId,
        ref: "rooms",
        required: "roomId cannot be blank",
      },
      toId: {
        type: String,
        ref: "users",
        required: "toId cannot be blank",
      },
      fromId: {
        type: String,
        ref: "users",
        required: "fromId cannot be blank",
      },
      message: {
        type: String,
        trim: true,
        required: "message cannot be blank",
      },
      messageType: {
        type: String,
        trim: true,
        enum: [
          "image/png",
          "image/jpg",
          "image/jpeg",
          "video/*",
          "text/plain",
          "application/pdf",
        ],
        default: "text/plain",
      },
      read: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        trim: true,
        enum: ["personal", "group"],
        default: "personal",
      },
      status: {
        type: String,
        trim: true,
        enum: ["none", "edit", "delete"],
        default: "none",
      },
      created: {
        type: Date,
        default: Date.now,
      },
    });
  mongoose.model("messages", messageSchema);
};
