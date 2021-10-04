const passport = require("passport")
const jwt = require("jsonwebtoken")
const dev = process.env.NODE_ENV !== "production"
const crypto = require("crypto")

exports.COOKIE_OPTIONS = {
    //httpOnly: true,
    // Since localhost is not having https protocol,
    // secure cookies do not work correctly (in postman)
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


exports.verifylocal = (req, res, next) => {
    passport.authenticate("local", {session: false}, (err, user, info) => {
        if (err) {console.log("error=> ", err); return res.status(401).json({ status: 401, message: err })} 
    if (info) {console.log("error=> ", err); return res.status(400).json({ status: 400, message: info }) } 
    if (!user) return res.status(401).json({ status: 401, message: "Unauthorized" })
    req.user = user
    return next()
    })(req, res, next)
}


exports.verifyUser = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) return res.status(400).json({ status: 400, message: err })
      if (info){
        return info.message == "jwt expired" ? res.status(403).json({ status: 403, message: "your token is expired please refresh your token or check your token." }) :
        res.status(401).json({ status: 401, message: info.toString()})
      }
      if (!user) return res.status(401).json({ status: 401, message: "Unauthorized" })
      req.user = user;
      return next();
    })(req, res, next);
  }

 exports.verifyPassword = (password, salt, hash) => {
    return new Promise((resolve, reject) => {
      //console.log("salt=> ",salt)
        const key = hash.replace(salt, "")
        //console.log("key=> ",key)
        crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, derivedKey) => {
            if (err) reject(err);
            //console.log("result=> ",derivedKey.toString('hex'))
            resolve(key == derivedKey.toString('hex'))
        });
    })
}

exports.hashPassword = (password)=> {
  return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(32).toString("hex")
      crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, derivedKey) => {
          if (err) reject(err);
          resolve({"hash": salt + derivedKey.toString('hex'), "salt": salt})
      });
  })
}