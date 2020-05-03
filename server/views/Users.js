const _ = require('lodash');

const User = require('../controllers/Users');
const ChatMessage = require('../controllers/ChatMessage');

const userInstance = new User();
const chatMessageInstance = new ChatMessage();

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
    const friends = await userInstance.loadContact({ userId: req.user._id });
    // eslint-disable-next-line no-underscore-dangle
    const friendIds = friends.map(friend => friend._id.toString());
    // eslint-disable-next-line no-underscore-dangle
    const chatMessages = await chatMessageInstance.getLastChatMessage({ friendIds, userId: req.user._id });
    friends.map((friend) => {
      // eslint-disable-next-line no-underscore-dangle
      const friendId = friend._id.toString();
      const chatMessage = _.find(chatMessages,
        message => message.senderId === friendId || message.receiverId === friendId);
      if (chatMessage) friend.chat = chatMessage;
      return friend;
    });
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
