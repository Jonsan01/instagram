/*!
    Creting For Devloper use only...
*/

// Module dependencies.
const fs = require('fs');
const path = require('path');
const userModel = require('./models/user');
require('./db/dbConnection');

// function for download all user and store into a JSON file
async function downloadUser() {
    try {
        const users = await userModel.find()
        fs.writeFileSync(path.join(__dirname, "./db/user.json"), JSON.stringify(users))
        console.log("Done...");
        process.exit()
    } catch (error) {
        console.log(error);
    }
}

// function for upload all user form JSON file into a MongoDB
async function uploadUser() {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, "./db/user.json"), 'utf-8'))
        await userModel.insertMany(data)
        console.log("Done...");
        process.exit()
    } catch (error) {
        console.log(error);
    }
}

//clearing database for testing
async function removeUser() {
    try {
        await userModel.deleteMany()
        console.log("Done...");
        process.exit()
    } catch (error) {
        console.log(error);
    }
}

switch (process.argv.at(2)) {
    case ("--download"):
        switch (process.argv.at(3)) {
            case ("--user"):
                downloadUser()
                break;
            case ("--post"):
                downloadPost()
                break;
            default:
                console.log("Enter --post || --user");
                process.exit()
        }
        break;
    case ("--upload"):
        switch (process.argv.at(3)) {
            case ("--user"):
                uploadUser()
                break;
            case ("--post"):
                uploadPost()
                break;
            default:
                console.log("Enter --post || --user");
                process.exit()
        }
        break;
    case ("--remove"):
        switch (process.argv.at(3)) {
            case ("--user"):
                removeUser()
                break;
            case ("--post"):
                removePost()
                break;
            default:
                console.log("Enter --post || --user");
                process.exit()
        }
        break;
    default:
        console.log("Enter --donload || --upload || --remove");
        process.exit()
}