const Contact = require('../models/Contacts');

class ContactController {
  // eslint-disable-next-line class-methods-use-this
  async addFriendByUserId(options = {}) {
    const data = {
      userId: options.userId,
      friendId: options.friendId,
    };
    const contactData = await Contact.findOne(data);
    if (!contactData) return new Contact(data).save();
    return contactData;
  }

  // eslint-disable-next-line class-methods-use-this
  async getContactsByUserId(options) {
    const data = {
      userId: options.userId,
    };
    return Contact.find(data).select('friendId');
  }

  // eslint-disable-next-line class-methods-use-this
  deleteFriendByUserId(options) {
    const data = {
      userId: options.userId,
      friendId: options.friendId,
    };
    return Contact.deleteOne(data);
  }
}
module.exports = ContactController;
