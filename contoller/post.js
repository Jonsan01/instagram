/**
* Create an express Router
* @export postController (middelware)
**/

'use strict';

// Module dependencies.
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const postModel = require('./../models/post');
const userModel = require('./../models/user');
const likeSchema = require('./../models/postlike');
const commentSchema = require('./../models/postcomment');

// send all post list (url = "GET .../post")
module.exports.showAllPost = async function (req, res) {
    try {
        let query = postModel.find()

        //sorting
        query = (req.query.sort) ? query.sort(req.query.sort) : query.sort('-createdAt')

        //deselet password , __v and refreshToken
        query = query.select("-__v")

        //pagination
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const skip = (page - 1) * limit
        query = query.skip(skip).limit(limit)

        // get all users
        const users = await query;

        // check next page avalible or not
        const total = await postModel.countDocuments()
        const next = (total <= (skip + users.length)) ? false : true
        if (total <= skip) return res.status(501).json({ status: 'fail', error: "page not exist" })

        // sending final output
        res.status(201).json({ status: 'sucess', page, next, results: users.length, data: users })

    } catch (error) {
        res.status(501).json({ status: 'fail', error: error.message })
    }
}

// autherntication verify token and header token
module.exports.auth = async function (req, res, next) {

    // get a token from header
    const tokenHeader = req.header("Authorization");
    const accessToken = tokenHeader && tokenHeader.split(" ").at(1)
    if (!accessToken) return res.sendStatus(403);

    try {

        // verify token
        const user = jwt.verify(accessToken, process.env.JWT_KEY);

        req.user = user;
        next() // call a next middelware

    } catch (error) {
        res.status(501).json({ status: 'fail', error: error.message })
    }
}

// creating a new post url = (POST .../post)
module.exports.createPost = async function (req, res) {

    //validation media and caption using joi validation
    const { error, value } = Joi.object({
        media: Joi.array().required().items(Joi.string()).max(10),
        capation: Joi.string().required().trim().max(100)
    }).validate(req.body, { allowUnknown: false })

    // if error in validation then send error 
    if (error) return res.status(501).json({ status: 'fail', error: error.message })

    try {

        // creating post in database
        const post = await postModel.create({ auther: req.user.id, ...value })

        //add post in user
        const user = await userModel.findById(req.user.id)
        user.posts = [...user.posts, post.id]
        await user.save()

        //sending final post 
        res.status(201).json({ status: 'sucess', data: post })

    } catch (error) {
        res.status(501).json({ status: 'fail', error: error.message })
    }
}

//
module.exports.getpost = async function (req, res) {
    try {
        const post = await postModel.findById(req.id)
        if (!post) return res.status(501).json({ status: 'fail', error: "invalid id" })
        res.status(201).json(
            {
                status: 'sucess',
                data: {
                    id: post.id,
                    auther: post.auther,
                    media: post.media,
                    capation: post.capation,
                    likes: post.likes,
                    comments: post.comments,
                    likeCount: post.likeCount,
                    commentCount: post.commentCount
                }
            })
    } catch (error) {
        res.status(501).json({ status: 'fail', error: "Server Error..." })
    }
}

module.exports.updatePost = async function (req, res) {
    const { error, value } = Joi.object({
        media: Joi.array().items(Joi.string()).max(10),
        capation: Joi.string().trim().max(100)
    }).validate(req.body, { allowUnknown: false })

    if (error) return res.status(501).json({ status: 'fail', error: error.message })

    try {
        const post = await postModel.findById(req.id)
        if (!post) return res.status(501).json({ status: 'fail', error: "invalid id" })
        if (post.auther != req.user.id) return res.sendStatus(403);
        await postModel.findByIdAndUpdate(req.id, { ...value, createdAt: Date.now() })
        res.status(201).json({
            status: 'sucess', date: {
                id: post.id,
                auther: post.auther,
                media: value.media || post.media,
                capation: value.capation || post.capation,
                likes: post.likes,
                comments: post.comments,
                likeCount: post.likeCount,
                commentCount: post.commentCount
            }
        })
    } catch (error) {
        res.status(501).json({ status: 'fail', error: "Server Error..." })
    }
}

module.exports.like = async function (req, res) {
    try {
        const post = await postModel.findById(req.id);
        if (!post) return res.status(501).json({ status: 'fail', error: "post not found" });
        const checkLike = post.likes.find(e => e.auther == req.user.id)
        if (checkLike) return res.status(501).json({ status: 'fail', error: 'alredy liked' })
        const like = new mongoose.Document({
            auther: req.user.id
        }, likeSchema)
        post.likes = [...post.likes, like]
        await post.save()
        res.status(201).json({ status: 'sucess' })
    } catch (error) {
        res.status(501).json({ status: 'fail', error: "Server Error..." })
    }
}

module.exports.removeLike = async function (req, res) {
    try {

        const post = await postModel.findById(req.id);
        if (!post) return res.status(501).json({ status: 'fail', error: "post not found" });

        const checkLike = post.likes.findIndex(e => e.auther == req.user.id)
        if (checkLike == -1) return res.status(404).json({ status: 'fail', error: 'like not found' })

        post.likes.splice(checkLike, 1)
        await post.save()

        res.status(201).json({ status: 'sucess' })

    } catch (error) {
        res.status(501).json({ status: 'fail', error: error })
    }
}

module.exports.getLikes = async function (req, res) {
    try {

        const post = await postModel.findById(req.id);
        if (!post) return res.status(501).json({ status: 'fail', error: "post not found" });

        res.status(501).json({ status: 'sucess', data: post.likes })
    } catch (error) {
        res.status(501).json({ status: 'fail', error: "Server Error..." })
    }
}

module.exports.getComment = async function (req, res) {
    try {

        const post = await postModel.findById(req.id);
        if (!post) return res.status(501).json({ status: 'fail', error: "post not found" });

        res.status(501).json({ status: 'sucess', data: post.comments })
    } catch (error) {
        res.status(501).json({ status: 'fail', error: "Server Error..." })
    }
}

module.exports.createComment = async function (req, res) {
    try {

        const post = await postModel.findById(req.id);
        if (!post) return res.status(501).json({ status: 'fail', error: "post not found" });

        const { error, value } = Joi.object({
            message: Joi.string().required().trim().max(50)
        }).validate(req.body, { allowUnknown: false })

        if (error) return res.status(501).json({ status: 'fail', error: error.message })

        const comment = new mongoose.Document({ auther: req.user.id, ...value }, commentSchema)
        post.comments.push(comment)

        await post.save()

        res.status(201).json({ status: 'sucess' })

    } catch (error) {
        res.status(501).json({ status: 'fail', error: "Server Error..." })
    }
}
module.exports.updateComment = async function (req, res) {
    try {

        const post = await postModel.findById(req.id);
        if (!post) return res.status(501).json({ status: 'fail', error: "post not found" });

        const { error, value } = Joi.object({
            message: Joi.string().required().trim().max(50)
        }).validate(req.body, { allowUnknown: false })

        if (error) return res.status(501).json({ status: 'fail', error: error.message })

        const commentIndex = post.comments.findIndex(e => e.id == req.commentId)
        if (commentIndex == -1) return res.status(404).json({ status: 'fail', error: 'comment not found' })

        if (post.auther == req.user.id || post.comments[commentIndex] == req.user.id) {
            post.comments[commentIndex].message = value.message
            post.comments[commentIndex].updatedAt = Date.now()

            await post.save()
            return res.status(201).json({ status: 'sucess' })
        }
        res.sendStatus(403)
    } catch (error) {
        res.status(501).json({ status: 'fail', error: error })
    }
}
module.exports.deleteComment = async function (req, res) {
    try {

        const post = await postModel.findById(req.id);
        if (!post) return res.status(501).json({ status: 'fail', error: "post not found" });

        const commentIndex = post.comments.findIndex(e => e.id == req.commentId)
        if (commentIndex == -1) return res.status(404).json({ status: 'fail', error: 'comment not found' })

        if (post.auther == req.user.id || post.comments[commentIndex] == req.user.id) {

            post.comments.splice(commentIndex, 1)

            await post.save()
            return res.status(201).json({ status: 'sucess' })
        }
        res.sendStatus(403)
    } catch (error) {
        res.status(501).json({ status: 'fail', error: error })
    }
}

module.exports.getCommentLikes = async function (req, res) {
    try {
        const post = await postModel.findById(req.id);
        if (!post) return res.status(501).json({ status: 'fail', error: "post not found" });

        const commentIndex = post.comments.findIndex(e => e.id == req.commentId)
        if (commentIndex == -1) return res.status(404).json({ status: 'fail', error: 'comment not found' })

        res.status(201).json({ status: 'sucess', date: post.comments[commentIndex].likes })
    } catch (error) {
        res.status(501).json({ status: 'fail', error: error })
    }
}
module.exports.likeComment = async function (req, res) {
    try {
        const post = await postModel.findById(req.id);
        if (!post) return res.status(501).json({ status: 'fail', error: "post not found" });

        const commentIndex = post.comments.findIndex(e => e.id == req.commentId)
        if (commentIndex == -1) return res.status(404).json({ status: 'fail', error: 'comment not found' })

        const like = new mongoose.Document({ auther: req.user.id }, likeSchema)

        const checkLike = post.comments[commentIndex].likes.find(e => e.auther == req.user.id);
        if (checkLike) return res.status(501).json({ status: 'fail', error: 'alredy liked' })

        post.comments[commentIndex].likes = [...post.comments[commentIndex].likes, like]
        await post.save()

        res.status(201).json({ status: 'sucess' })
    } catch (error) {
        res.status(501).json({ status: 'fail', error: error })
    }
}