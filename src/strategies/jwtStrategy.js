const passport = require("passport")
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt
const Auth = require("../model/users")
//const Session = require("../models/sessions")

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

// Used by the authenticated requests to deserialize the user,
// i.e., to fetch user details from the JWT.
passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    // Check against the DB only if necessary.
    // This can be avoided if you don't want to fetch user details in each request.
    //User.populate('refreshToken');
    if(!jwt_payload) return done('No token')
    Auth.findOne({ _id: jwt_payload._id }).then(
      user => {
        if(user) return done(null, user)
        return done("User not found")
      }).catch(err => done(err))
  })
)
