require("dotenv").config()
const  express = require("express");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path")
const app = express();
const PORT = process.env.PORT || 3300;
const mongoose = require("mongoose")
const session = require("express-session")
const flash  = require("express-flash")
var MongoDbStore = require('connect-mongodb-session')(session);
const passport = require("passport");


// Database connection
mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true,  }).then(()=>{
console.log("database connected")
}).catch((err)=>{
    console.log("'error")
})




// session store..
let  mongoStore = new MongoDbStore({
    uri:'mongodb://localhost/pizza',
    // mongooseConnection: sessionDb,
    collection: 'sessions',
})

// sessions config....

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store:mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour
}))

// Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

//assets
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}));
app.use(express.json())


//global middleware..
app.use((req,res,next)=>{
    res.locals.session = req.session
    res.locals.user = req.user
next()
})


//set template engine
app.use(expressLayout)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')


require('./routes/web')(app)




app.listen(PORT,()=>console.log(`server running on ${PORT}`))