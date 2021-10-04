const mongoose = require("mongoose")
const Schema = mongoose.Schema


const Session = new Schema({
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'authentication',
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiredAt: {
      type : Date, 
      default: new Date().setDate(new Date().getDate() + 7),
      expires: 0
    },
  }, {strict: false, versionKey: false, collection: "session", timestamps: true})

module.exports = mongoose.model("session", Session)