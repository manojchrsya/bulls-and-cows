const Contact = require('../models/Contacts');

class ContactController {
  // eslint-disable-next-line class-methods-use-this
  async addFriendByUserId(options = {}) {
    const query = {
      userId: options.userId,
      friendId: options.friendId,
    };
    return Contact.findOneOrCreate(query);
  }
}
module.exports = ContactController;
