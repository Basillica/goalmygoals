const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const expHandleBars = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')


// load config
dotenv.config({ path: './config/config.env' })

// Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

// Body parser
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

// Method override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body){
    // lookin urlencode POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))


// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Handlebars helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require("./helpers/hbs");

// HandleBars
app.engine(
  ".hbs",
  expHandleBars({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select,
    },
    defaultLayout: "main",
    extname: ".hbs",
  })
);

app.set('view engine', '.hbs')

// Sessions
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }) // goals sessions in database
}))


// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global variables
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})


// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use("/goals", require("./routes/goals"));

const PORT = process.env.PORT || 3000

app.listen(PORT, 
    console.log(` Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    )