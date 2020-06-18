const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const usersRoutes = require('./routes/users');
const bodyParser = require('body-parser');
const indexRoutes = require('./routes/index');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');



//Passport Config
require('./config/passport')(passport);

// DB config
const db = require('./config/keys').mongoURI;

//Connect to Mongo
mongoose.connect(db,{useNewUrlParser:true, useUnifiedTopology:true})
    .then(()=> console.log('Mongo DB Connected!'))
    .catch(err => console.log(err));


const app = express();

//static path
app.use(express.static('./public/images/'));

//EJS
app.use(expressLayouts);
app.set('views','./views');
app.set('view engine', 'ejs');

//Bodyparser
app.use(bodyParser.urlencoded({extended:true}));   

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized:true
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global Variables for colors in error msg during flash.
app.use((req, res, next)=> {
    res.locals.success_msg = req.flash('success_msg');  // setting global variables using locals.
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//Routes
app.use(indexRoutes);
app.use('/users',usersRoutes);

app.listen(5000, () => console.log("Server started on port 3000!"));
