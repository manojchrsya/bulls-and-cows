const express = require('express');

const Users = require('../views/Users');

class routes {
  // eslint-disable-next-line no-unused-vars
  constructor(passport) {
    this.passport = passport;
    this.router = express.Router();
  }

  getUserInstance() {
    if (this.userInstance) return this.userInstance;
    return new Users();
  }

  loadRoutes() {
    this.router.get('/', this.isLoggedIn, this.getUserInstance().dashboard);

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

module.exports = routes;
