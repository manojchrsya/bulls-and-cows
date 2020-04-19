const User = require('../controllers/Users');

const userInstance = new User();

class UserView {
  // eslint-disable-next-line class-methods-use-this
  login(req, res) {
    return res.render('login', { messages: req.flash('errors') });
  }

  // eslint-disable-next-line class-methods-use-this
  signup(req, res) {
    return res.render('signup', { messages: req.flash('errors') });
  }

  // eslint-disable-next-line class-methods-use-this
  logout(req, res) {
    req.logout();
    res.redirect('/login');
  }

  // eslint-disable-next-line class-methods-use-this
  async dashboard(req, res) {
    const friends = await userInstance.list();
    res.render('home', { user: req.user, friends });
  }
}

module.exports = UserView;
