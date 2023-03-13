/*
 * SocialMedia API's using expressJs and mongoDB
 * Created by Jonsan Devganiya
 */

'use strict';

// Module dependencies.
const express = require('express');

const userRouter = require('./routers/user');
const postRouter = require('./routers/post');

// database connection...
require('./db/dbConnection');

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// routers
app.use("/user", userRouter);
app.use("/post", postRouter);

//for all other request
app.use((req, res) => res.sendStatus(404))

app.listen(process.env.PORT || 3000);