const mongoose = require('mongoose');
const likeSchema = require('./postlike');

const commentSchema = new mongoose.Schema(
    {
        auther: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            required: true,
            default: () => Date.now(),
        },
        updatedAt: Date,
        likes: [likeSchema]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

commentSchema.virtual("likeCount").get(function () {
    return this.likes.length
})

module.exports = commentSchema