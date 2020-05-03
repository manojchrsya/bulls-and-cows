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
    // eslint-disable-next-line no-underscore-dangle
    const friends = await userInstance.loadDiscussions({ userId: req.user._id });
    res.render('home', { user: req.user, friends });
  }

  // eslint-disable-next-line class-methods-use-this
  async uploadProfile(req, res) {
    const options = {
      // eslint-disable-next-line no-underscore-dangle
      ownerId: req.user._id,
      ownerType: 'User',
    };
    const response = await userInstance.saveProfilePic(req.file, options);
    return res.send(response);
  }
}

module.exports = UserView;
