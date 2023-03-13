const mongoose = require('mongoose');
const likeSchema = require('./postlike');
const commentSchema = require('./postcomment');

const postSchema = new mongoose.Schema(
    {
        auther: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: () => Date.now(),
            required: true
        },
        updatedAt: Date,
        media: {
            type: [String],
            required: true
        },
        capation: {
            type: String,
            default: ""
        },
        likes: [likeSchema],
        comments: [commentSchema]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

postSchema.virtual("likeCount").get(function () {
    return this.likes.length
})

postSchema.virtual("commentCount").get(function () {
    return this.comments.length
})

module.exports = mongoose.model("post", postSchema)