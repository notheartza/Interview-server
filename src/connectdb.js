const mongoose = require('mongoose')

const url = `${process.env.MONGO_DB_CONNECTION_STRING}/${ process.env.DATABASE}`

const connect = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

connect
  .then(db => {
    //console.log(url)
    //console.log(`connected to ${process.env.MONGO_DB_CONNECTION_STRING}/${ process.env.DATABASE}`)
  })
  .catch(err => {
    //console.log(url)
    console.log(err)
  })
