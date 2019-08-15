const express = require('express')
const bodyParser = require('body-parser')
const lti = require('ims-lti')
const fs = require('fs')
const logger = require('morgan')
const canvas = require('./canvas-api')
const path = require('path')
const session = require('express-session')
const PORT = 3030

const ltiRoute = require('./routes/lti')

const app = express()

app.use(logger('dev'))
app.use(bodyParser.json()) // handle json data
app.use(bodyParser.urlencoded({ extended: true }))
app.enable('trust proxy') // this lets req.proto == 'https'
app.use(express.static(path.join(__dirname, '/client/build')))
app.use('/lti', ltiRoute)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.enable('trust proxy') // this lets req.proto == 'https'
app.use(session({
  secret: 'TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX',
  resave: true,
  saveUninitialized: true
}))
app.use(express.static(path.join(__dirname, '/client/build')))

// app.get('/', (req, res) => res.send('hello'))
app.use('/', indexRoute)
app.use('/lti', ltiRoute)

// app.get('/:assignmentId/:sessionId', (req, res) => {
//   console.log(req.sesson.cheapsession[req.params])
//   res.sendFile(`${__dirname}/client/build/index.html`)
// })

app.listen(PORT, function (err) {
  console.log(err || `ltitool on ${PORT}`)
})

// for debugging
global.canvas = canvas
