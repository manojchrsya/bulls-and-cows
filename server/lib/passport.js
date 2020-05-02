// load all the things we need
const LocalStrategy = require('passport-local').Strategy;
// load up the user model
const User = require('../models/Users');

class Passport {
  constructor(passport) {
    this.passport = passport;
    this.serialize();
    this.deserialize();
    this.setLoginStrategy();
    this.setSignUpStrategy();
  }

  serialize() {
    // used to serialize the user for the session
    this.passport.serializeUser((user, done) => done(null, user));
  }

  deserialize() {
    // used to deserialize the user
    this.passport.deserializeUser((id, done) => {
      User.findById(id, (err, user) => done(err, user)).populate('profilePic', ['name', 'url']);
    });
  }

  setLoginStrategy() {
    this.passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    }, (req, email, password, done) => {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ email }, (err, user) => {
        // if there are any errors, return the error before anything else
        if (err) return done(null, false, req.flash('errors', [err.message]));
        // if no user is found, return the message
        // req.flash is the way to set flashdata using connect-flash
        if (!user) return done(null, false, req.flash('errors', ['No user found.']));
        // if the user is found but the password is wrong
        if (!user.validPassword(password)) return done(null, false, req.flash('errors', ['Oops! Wrong password.']));
        // all is well, return successful user
        return done(null, user);
      }).select('_id name email +password');
    }));
  }

  setSignUpStrategy() {
    this.passport.use('local-signup', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true, // allows us to pass back the entire request to the callback
    }, (req, email, password, done) => {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ email }, (err, user) => {
        // if there are any errors, return the error
        if (err) return done(null, false, req.flash('errors', [err.message]));
        // check to see if theres already a user with that email
        if (user) {
          return done(null, false, req.flash('errors', ['That email is already taken.']));
        }
        // if there is no user with that email
        // create the user
        const newUser = new User();
        newUser.name = req.body.name;
        // set the user's local credentials
        newUser.email = email;
        newUser.password = newUser.generateHash(password); // use the generateHash function in our user model
        // save the user
        newUser.save((error) => {
          if (error) return done(null, false, req.flash('errors', [error.message]));
          return done(null, newUser);
        });
      });
    }));
  }
}

module.exports = Passport;
