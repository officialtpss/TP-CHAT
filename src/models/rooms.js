"use strict";

/**
 * rooms Schema
 */
module.exports = (mongoose) => {
  const Schema = mongoose.Schema,
    roomSchema = new Schema({
      name: {
        type: String,
        required: "name cannot be blank",
      },
      fromId: {
        type: Schema.ObjectId,
        ref: "users",
      },
      toId:{
         type: Schema.ObjectId,
         ref: "users",
      },
      type: {
        type: String,
        trim: true,
        enum: ["personal", "group"],
        default: "personal",
      },
      created: {
        type: Date,
        default: Date.now,
      },
    });

  mongoose.model("rooms", roomSchema);
};
