/**
* Create an express Router
* @export postRouter (middelware)
**/

'use strict';

// Module dependencies.
const express = require('express');

//middelware
const {
    validateId,
    validateCommentId
} = require('./../contoller/common');
const {
    showAllPost,
    auth,
    createPost,
    getpost,
    updatePost,
    getLikes,
    getComment,
    like,
    removeLike,
    createComment,
    updateComment,
    deleteComment,
    getCommentLikes,
    likeComment
} = require('./../contoller/post');

const router = express.Router()

// create post and show all posts 
router
    .route("/")
    .get(showAllPost)
    .post(auth, createPost)

// update post and info of one post
router
    .route("/:id")
    .get(validateId, getpost)
    .put(auth, validateId, updatePost)

//get all like of post , like a post, remove like 
router
    .route("/:id/like")
    .get(validateId, getLikes)
    .post(auth, validateId, like)
    .delete(auth, validateId, removeLike)

// get all comment of one post, create comment of post
router
    .route("/:id/comment")
    .get(validateId, getComment)
    .post(auth, validateId, createComment)

// update and remove one comment
router
    .route("/:id/comment/:commentId")
    .put(validateId, auth, validateCommentId, updateComment)
    .delete(validateId, auth, validateCommentId, deleteComment)

// get likes of comment and like in comment
router
    .route("/:id/comment/:commentId/like")
    .get(validateId, auth, validateCommentId, getCommentLikes)
    .post(validateId, auth, validateCommentId, likeComment)

module.exports = router