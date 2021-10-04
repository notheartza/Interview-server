const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User = require("../model/users")


passport.use( new LocalStrategy(User.authenticate()))

//called while after siging in / signing up to set user details in req.user
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())