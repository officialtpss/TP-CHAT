'use strict';

/**
 * notifications Schema
 */
module.exports = (mongoose) => {
    const Schema = mongoose.Schema,
        notificationSchema = new Schema({
            toId: {
                type: String,
                ref:  'users',
                required: 'toId cannot be blank',
            },
            message: {
                type: String,
                trim: true,
                required: 'notification cannot be blank',
            },
            type: {
                type: String,
                trim: true,
                enum: ['group-create', 'user-register', 'default'],
                default: 'default'
            },
            read: {
                type: Boolean,
                default: false
            },
            created: {
                type: Date,
                default: Date.now
            }
        });
    mongoose.model('notifications', notificationSchema);
};
