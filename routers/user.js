/**
* Create an express Router
* @export userRouter (middelware)
**/

'use strict';

// Module dependencies.
const express = require('express');
const { validateId } = require('./../contoller/common');
const {
    showAllUser,
    validUser,
    addUser,
    getuser,
    userLogin,
    validLoginDetails,
    refreshToken
} = require('./../contoller/user')

const router = express.Router()

// create user and show all users
router
    .route("/")
    .get(showAllUser)
    .post(validUser, addUser)

// show user by id
router
    .route("/:id")
    .get(validateId, getuser)

// login
router
    .route("/login")
    .post(validLoginDetails, userLogin)

// accessToekn genrate using refreshToken 
router
    .route("/refreshtoken")
    .post(refreshToken)

module.exports = router