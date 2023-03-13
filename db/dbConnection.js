const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_LINK, { dbName: process.env.DB_NAME })
    .then(() => { console.log("Connected...."); })
    .catch(e => { console.log(e); })