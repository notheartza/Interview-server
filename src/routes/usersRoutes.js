const User = require("../model/users")
const Session = require("../model/sessions")
var ObjectId = require('mongoose').Types.ObjectId;
var crypto = require('crypto');

const router = require("express").Router()

const { getToken, COOKIE_OPTIONS, getRefreshToken, getPlayload, verifylocal, verifyUser } = require("../authenticate")

router.post("/signup", (req, res) => {
    if (!req.body) return res.status(400).json({ status: 400, message: "The username and password is required", })
    User.register(
      new User({ username: req.body.username }), req.body.password,
      async (err, getAuth) => {
        if (err) return res.status(400).json({ status: 400, message: err, })
        var session = new Session;
        getAuth.email = req.body.email
        getAuth.firstName = req.body.firstName
        getAuth.lastName = req.body.lastName
        const token = getToken({ _id: getAuth._id })
        const refreshToken = getRefreshToken({ _id: getAuth._id })
        session.ownerId = getAuth._id
        session.refreshToken = refreshToken
        session.save((err, get) => { if (err) return res.status(400).json({ status: 400, message: err, }) })
        //getAuth.refreshToken.push({ refreshToken })
        getAuth.save(async (err, user) => {
          if (err) return res.status(400).json({ status: 400, message: err, })
          res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
          var get = await User.findById(getAuth._id).exec()
          return res.status(200).json({ status: 200, message: { token: token, status: "logged in", currentUser: get } })
        })
      }
    )
  });


  router.post("/login", verifylocal, (req, res) => {
    User.findById(req.user._id).then(auth => {
      //auth.refreshToken.push({ refreshToken })
      const token = getToken({ _id: req.user._id })
      const refreshToken = getRefreshToken({ _id: req.user._id })
      var session = new Session;
      session.ownerId = req.user._id
      session.refreshToken = refreshToken
      session.save(async (err, user) => {
        if (err) return res.status(400).json({ status: 400, message: err })
        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        var get = await User.findById(req.user._id).exec()
        return res.status(200).json({
          status: 200, message: {
            token: token,
            currentUser: get
          }
        })
      })
    })
  });

  router.post("/resetpassword", verifyUser, async (req, res) => {
      var user = await User.findById(req.user._id).select("hash salt").exec()
      //crypto.pbkdf2.
      return res.status(200).json({
        status: 200, message: {
          //token: token,
          currentUser: user
        }
      })
  })


module.exports = router