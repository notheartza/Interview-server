const mongoose = require("mongoose")
const Schema = mongoose.Schema
const passportLocalMongoose = require("passport-local-mongoose")

const Users = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
    },
    firstName: String,
    lastName: String,
    //img: String,
}, { strict: false, versionKey: false, timestamps: true, collection: "users" })

Users.plugin(passportLocalMongoose)

module.exports = mongoose.model("Users", Users)