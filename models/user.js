const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "name is required"]
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: [true, "email is unique"]
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
        refreshToken: String,
        createdAt: {
            type: Date,
            required: true,
            default: () => Date.now(),
            select: false
        },
        followers: [String],
        followeing: [String],
        posts: [String]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

userSchema.virtual("followerCount").get(function () {
    return this.followers.length
})

userSchema.virtual("followingCount").get(function () {
    return this.followeing.length
})

userSchema.virtual("postCounts").get(function () {
    return this.posts.length
})

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 10);
    next()
})

module.exports = mongoose.model("user", userSchema)