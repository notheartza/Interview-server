const User = require("../model/users")
const Session = require("../model/sessions")
var ObjectId = require('mongoose').Types.ObjectId;

const router = require("express").Router()

const { getToken, COOKIE_OPTIONS, getRefreshToken, getPlayload, verifylocal, verifyUser, verifyPassword, hashPassword, checkRepeatPassword } = require("../authenticate");
const fileUpload = require("express-fileupload");

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
        getAuth.save(async (err, user) => {
          if (err) return res.status(400).json({ status: 400, message: err, })
          res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
          var get = await User.findById(getAuth._id).exec()
          return res.status(200).json({ status: 200, message: { token: token, currentUser: get } })
        })
      }
    )
  });


  router.post("/login", verifylocal, (req, res) => {
    User.findById(req.user._id).then(auth => {
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
    if(!req.body) return res.status(400).json({ status: 400, message: "please insert your password" }) 
    if(req.body.oldPassword == req.body.newPassword) return res.status(400).json({ status: 400, message: "your old password same new password." }) 
      var user = await User.findById(req.user._id).select("hash salt oldPassword").exec()
      var checkPassword = await verifyPassword(req.body.oldPassword, user.salt, user.hash)
      if(!checkPassword) return res.status(400).json({ status: 400, message: "your old password is incorrect."}) 
      var old = user.oldPassword.sort((a,b)=> b.createAt - a.createAt);
      const check = (old.length)? await checkRepeatPassword(old, req.body.newPassword, verifyPassword): false
      if(check) return res.status(400).json({ status: 400, message: "your password is same your old password."}) 
      user.oldPassword = user.oldPassword.sort((a,b)=> a.createAt - b.createAt);
      if(user.oldPassword.length>=5) user.oldPassword.shift()
        user.oldPassword.push({"hash": user.hash, "salt": user.salt, "createAt": Date.now()})
       var newPassword = await hashPassword(req.body.newPassword)
        user.salt = newPassword.salt
        user.hash = newPassword.hash
        user.save((err, user) => {
        if (err) return res.status(400).json({ status: 400, message: err, })
        Session.deleteMany({"ownerId": req.user._id}).exec()
        return res.status(200).json({ status: 200, message: "secess" })
      })
  })


  router.get("/refreshToken", async (req, res) => {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies
    if (!refreshToken) return res.status(401).json({ status: 401, message: "Unauthorized" })
    const payload = getPlayload(refreshToken)
    const userId = payload._id
    var user = await Session.findOne({ ownerId: new ObjectId(userId), refreshToken: `${refreshToken}` })
    if (!user) return res.status(401).json({ status: 401, message: "your refresh token is expired already please try to login again." })
    const token = getToken({ _id: userId })
    const newRefreshToken = getRefreshToken({ _id: userId })
    user.refreshToken = newRefreshToken
    user.expiresAt = new Date().setDate(new Date().getDate() + 7)
    user.save((err, get) => {
      if (err) return res.status(400).json({ status: 400, message: err })
      res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
      return res.status(200).json({ status: 200, message: token })
    })
  });

  router.get("/getuser", verifyUser, (req, res) => {
    if (!req.user) return res.status(401).json({ status: 401, message: req.authInfo });
    return res.status(200).json({ status: 200, message: req.user });
  });


  router.get("/logout", verifyUser, (req, res) => {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies
    Session.findOneAndRemove({ ownerId: req.user._id, refreshToken: refreshToken }, (err) => {
      if (err) return res.status(401).json({ status: 401, message: err })
      res.clearCookie("refreshToken", COOKIE_OPTIONS)
      return res.status(200).json({ status: 200, message: "success" })
    })
  });

 

  router.post("/uploadProfile/:userId", fileUpload, (req, res) => {
    if (!req.files) return res.status(400).json({ status: 401, message:'No files were uploaded.'});
    console.log(req.files)
    
   
  })
  

module.exports = router