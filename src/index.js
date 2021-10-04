const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const passport = require("passport")

if (process.env.NODE_ENV !== "production") {
    // Load environment variables from .env file in non prod environments
    require("dotenv").config()
  }


require("./connectdb")
require("./authenticate")
require("./strategies/LocalStrategy")


const userRouter = require("./routes/usersRoutes");


const app = express()
app.use(bodyParser.json())

app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(cors({ origin: true, credentials: true }), )
app.use(passport.initialize());
app.use("/users", userRouter)






app.get("/", (req, res) => res.status(200).send("Request is Connected!"));


const server = app.listen(process.env.PORT, function () {
    const port = server.address()
    console.log("App started at :", port.port)
    //console.log("API version :", process.env.VERSION)
  })