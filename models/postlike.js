const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    auther: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
})

module.exports = likeSchema