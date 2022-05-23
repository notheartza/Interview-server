const passport = require("passport")
const jwt = require("jsonwebtoken")
const dev = process.env.NODE_ENV !== "production"
const crypto = require("crypto")
const User = require("./model/users")


exports.COOKIE_OPTIONS = {
  secure: !dev,
  signed: true,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
  sameSite: "none",
}


exports.getToken = user =>
  jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: eval(process.env.SESSION_EXPIRY),
  })


exports.getRefreshToken = user =>
  jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
  })


exports.getPlayload = token => jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)


exports.verifylocal = async (req, res, next) => {
  var user = await User.findOne({ "username": req.body.username }).select("_id hash salt").exec()
  if (!user) return res.status(401).json({ status: 401, message: { error: "IncorrectUsernameError", message: "Password or username are incorrect" } })
  const key = user.hash.replace(user.salt, "")
  var get = crypto.pbkdf2Sync(req.body.password, user.salt, 25000, 512, 'sha256').toString('hex');
  if(!(key == get)) return res.status(401).json({ status: 401, message: { error: "IncorrectPasswordError", message: "Password or username are incorrect" } })
  else {
    req.user = await User.findById(user._id).exec()
    return next()
  }
}


exports.verifyUser = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return res.status(400).json({ status: 400, message: err })
    if (info) {
      return info.message == "jwt expired" ? res.status(403).json({ status: 403, message: "your token is expired please refresh your token or check your token." }) :
        res.status(401).json({ status: 401, message: info.toString() })
    }
    if (!user) return res.status(401).json({ status: 401, message: "Unauthorized" })
    req.user = user;
    return next();
  })(req, res, next);
}

exports.verifyPassword = (password, salt, hash) => {
  return new Promise((resolve, reject) => {
    const key = hash.toString().replace(salt, "")
    crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      resolve(key == derivedKey.toString('hex'))
    });
  })
}

exports.hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(32).toString("hex")
    crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      resolve({ "hash": salt + derivedKey.toString('hex'), "salt": salt })
    });
  })
}

exports.checkRepeatPassword = (password, newPassword, verifyPassword) => {
  return new Promise(async (resolve) => {
    for (const [index, item] of password.entries()) {
      var check = await verifyPassword(newPassword, item.salt, item.hash)
      if (check) return resolve(check);
      else if ((index + 1) == password.length) return resolve(false);
    }
  })
}
