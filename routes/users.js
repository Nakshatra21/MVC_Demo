const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { forwardAuthenticated } = require('../config/auth');

const router = express.Router();

//Login Page
router.get('/login', forwardAuthenticated,(req, res, next) => res.render('login'));

//Register Page
router.get('/register', forwardAuthenticated, (req, res, next) => res.render('register'));

//Register Handle
router.post('/register', (req, res, next) => {
   const { name, email, password, password2}  = req.body;   
   // console.log(name, email, password, password2);
   let errors = [];

   // Check required fields.
    if(!name || !email || !password  || !password2) {
        errors.push({msg: 'Please fill in all fields'});
    }

    // Check passwords match
    if(password !== password2){
        errors.push({msg: 'Passwords do not match'});
    }

    // Check pass length
    if(password.length < 6){
        errors.push({msg : 'Password should be atleast 6 characters'});
    }

    if(errors.length > 0){
        res.render('register',{errors, name, email, password, password2});
    }else {
        //Validation passed.
        User.findOne({email : email})
        .then(user => {
            if(user){
                //user exists.
                errors.push({msg: 'Email already registered!'});
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            }
            
            else {

                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    bcrypt.genSalt(10,(err, salt) => bcrypt.hash(newUser.password, salt, (err, hash)=>{
                            if(err) throw err;

                            // Set password to hashed.
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect("/users/login");

                                })
                                .catch(err => console.log(err));
                    }));

                    // console.log(newUser);
                    // res.send('hello');
                }
        })
        .catch(err => console.log(err));
        // res.send('pass');
    }

});


// Login Handle

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });
  
  // Logout Handle

  router.get('/logout', (req, res,next) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
  
  module.exports = router;