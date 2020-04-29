const express = require('express');

const Users = require('../views/Users');
const Uploads = require('../lib/uploads');

class Routes extends Uploads {
  // eslint-disable-next-line constructor-super
  constructor(passport) {
    super();
    this.passport = passport;
    this.router = express.Router();
  }

  getUserInstance() {
    if (this.userInstance) return this.userInstance;
    return new Users();
  }

  loadRoutes() {
    this.router.get('/', this.isLoggedIn, this.getUserInstance().dashboard);

    this.router.post('/profile/upload',
      this.isLoggedIn,
      this.upload.single('profile'),
      this.getUserInstance().uploadProfile);

    this.router.get('/login', this.getUserInstance().login);
    this.router.post('/login', this.passport.authenticate('local-login', {
      successRedirect: '/', // redirect to the secure profile section
      failureRedirect: '/login', // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    }));
    this.router.get('/signup', this.getUserInstance().signup);
    this.router.post('/signup', this.passport.authenticate('local-signup', {
      successRedirect: '/', // redirect to the secure profile section
      failureRedirect: '/signup', // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    }));
    this.router.get('/logout', this.getUserInstance().logout);
    return this.router;
  }

  // eslint-disable-next-line class-methods-use-this
  isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (!req.isAuthenticated()) return res.redirect('/login');
    // if they aren't redirect them to the home page
    return next();
  }
}

module.exports = Routes;
