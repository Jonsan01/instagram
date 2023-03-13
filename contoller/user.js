/**
* Create an express Router
* @export userContollers (middelware)
**/

'use strict';

// Module dependencies.
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//database model.
const userModel = require('./../models/user');

// send all user list (url = "GET .../user")
module.exports.showAllUser = async function (req, res) {
    try {
        let query = userModel.find()

        //sorting
        query = (req.query.sort) ? query.sort(req.query.sort) : query.sort('-createdAt')

        //deselet password , __v and refreshToken
        query = query.select("-__v -password -refreshToken")

        //pagination
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const skip = (page - 1) * limit
        query = query.skip(skip).limit(limit)

        // get all users
        const users = await query;

        // check next page avalible or not
        const total = await userModel.countDocuments()
        const next = (total <= (skip + users.length)) ? false : true
        if (total <= skip) return res.status(501).json({ status: 'fail', error: "page not exist" })

        // sending final output
        res.status(201).json({ status: 'sucess', page, next, results: users.length, data: users })
    } catch (error) {
        res.status(501).json({ status: 'fail', error: "Server Error..." })
    }
}

// validating middelware for request body
module.exports.validUser = function (req, res, next) {

    //request body validation using "Joi validation"
    const { error, value } = Joi
        .object({
            name: Joi.string().required().min(2),
            email: Joi.string().required().email().lowercase().trim(),
            password: Joi.string().required().min(8).max(16)
        })
        .validate(req.body, { allowUnknown: false }) // allowUnknown for send error if send extra key-value

    //if not validate then send 
    if (error) return res.status(501).json({ status: 'fail', error: error.message })

    req.body = value; //set updated value in request body
    next() //calling next middelware
}

// add user in database url = (POST .../user)
module.exports.addUser = async function (req, res) {
    try {

        //check user alredy exist or not
        let user = await userModel.find().where("email").equals(req.body.email)
        if (user.length > 0) return res.status(501).json({ status: 'fail', error: "user alredy registed..." })

        // creating new user
        user = await userModel.create(req.body)

        //sending output
        res.send({
            status: 'sucess',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                followerCount: user.followerCount,
                followingCount: user.followingCount,
                postCount: user.postCounts
            }
        })
    } catch (error) {
        res.status(501).json({ status: 'fail', error: "Server Error..." })
    }
}

// get user by id url = (GET .../user/:id)
module.exports.getuser = async function (req, res) {
    try {

        //check user exist or not
        const user = await userModel.findById(req.id)
        if (!user) return res.status(501).json({ status: 'fail', error: "invalid id" })

        // sending output
        res.status(201).json(
            {
                status: 'sucess',
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    followerCount: user.followerCount,
                    followingCount: user.followingCount,
                    postCount: user.postCounts
                }
            })
    } catch (error) {
        res.status(501).json({ status: 'fail', error: "Server Error..." })
    }
}

//validating login body
module.exports.validLoginDetails = function (req, res, next) {

    //Validating request body using "Joi validation"
    const { error, value } = Joi.object({
        email: Joi.string().required().email().lowercase().trim(),
        password: Joi.string().required().min(8).max(16)
    }).validate(req.body, { allowUnknown: false })

    // if invalid then send error message
    if (error) return res.status(501).json({ status: 'fail', error: error.message })

    req.body = value; //set updated value into a request body

    next() //calling next middelware
}

// login middelware url = (POST .../user/login)
module.exports.userLogin = async function (req, res) {
    try {

        // get user by email
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) return res.status(501).json({ status: 'fail', error: "invalid email" })

        //password camparing
        const match = await bcrypt.compare(req.body.password, user.password)
        if (!match) return res.status(501).json({ status: 'fail', error: "wrong password" })

        // genrating accessToken and refreshToken
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_KEY, { algorithm: 'HS384', expiresIn: '5m' })
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_KEY, { algorithm: 'HS384' })

        //store refresh token in database
        user.refreshToken = refreshToken
        await user.save()

        //sending both accessToken  and refresh Token
        res.status(201).json({ status: 'sucess', data: { accessToken, refreshToken } })

    } catch (error) {
        res.status(501).json({ status: 'fail', error: error })
    }
}

// genrating accessToken using refreshToken url = (POST .../user/refreshtoken)
module.exports.refreshToken = async function (req, res) {
    try {

        // validationg accesstoken using "Joi validation"
        const { error, value } = Joi
            .object({ refreshToken: Joi.string().required() })
            .validate(req.body, { allowUnknown: false })

        //if error then send error
        if (error) return res.status(501).json({ status: 'fail', error: error.message })

        // get value form refreshToken
        const user = jwt.verify(value.refreshToken, process.env.JWT_KEY);

        //get user from database
        const dbUser = await userModel.findById(user.id);

        //check database token and this toekn is match or not
        if (req.body.accessToken == dbUser.accessToken) {

            //genrating new accesstokenand send into a user
            const accessToken = jwt.sign({ id: user.id }, process.env.JWT_KEY, { algorithm: 'HS384', expiresIn: '5m' })
            return res.status(201).json({ status: 'sucess', data: { accessToken } })
        }
        res.status(201).json({ status: 'fail', data: 'login again...' })
    } catch (error) {
        res.status(501).json({ status: 'fail', error: error.message })
    }
}
