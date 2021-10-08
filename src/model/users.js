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
    },
    firstName: String,
    lastName: String,
    oldPassword: {
        type: [Object],
        select: false
    },
    img: {
        data: Buffer,
        contentType: String
    },

}, { strict: false, versionKey: false, timestamps: true, collection: "users" })

Users.plugin(passportLocalMongoose)

module.exports = mongoose.model("Users", Users)