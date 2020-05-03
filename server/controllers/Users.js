const _ = require('lodash');
const moment = require('moment');

const User = require('../models/Users');
const FileResource = require('./FileResource');
const Contact = require('./Contact');

const contactInstance = new Contact();

class UserController extends FileResource {
  // eslint-disable-next-line class-methods-use-this
  async list(options = {}) {
    const query = {};
    if (options.q) {
      const regex = new RegExp(options.q);
      query.name = { $regex: regex, $options: 'i' };
    }
    return User.find(query);
  }

  // eslint-disable-next-line class-methods-use-this
  async getFriendsByUserId(user, options = {}) {
    const query = {};
    // eslint-disable-next-line no-underscore-dangle
    if (user._id) {
      // eslint-disable-next-line no-underscore-dangle
      query._id = { $nin: [user._id] };
    }
    if (options.source === 'contacts' && options.userIds) {
      // eslint-disable-next-line no-underscore-dangle
      query._id = { $in: options.userIds };
    }
    // do not show results for user who are already existing
    if (options.contactIds && options.contactIds.length > 0) {
      // eslint-disable-next-line no-underscore-dangle
      query._id = { $nin: options.contactIds };
    }
    // filter result by user name
    if (options.q) {
      const regex = new RegExp(options.q);
      query.name = { $regex: regex, $options: 'i' };
    }
    return User.find(query).limit(10).populate('profilePic', ['name', 'url']).lean();
  }

  // eslint-disable-next-line class-methods-use-this
  async saveProfile(options = {}) {
    const fields = ['id', 'name', 'mobile', 'bio', 'lastSeen', 'social.twitter', 'social.facebook',
      'social.instagram', 'social.github', 'social.slack'];
    const profileData = _.pickBy(_.pick(options, fields), _.identity);
    profileData.bio = _.trim(profileData.bio);
    return User.findOneAndUpdate({ _id: options.id }, profileData, { upsert: true });
  }

  async saveProfilePic(data, options) {
    const fileData = {
      name: data.filename,
      originalName: data.originalname,
      mime: data.mimetype,
      path: data.path,
      url: `${config.HOST}/${data.path.replace('assets/', '')}`,
      ownerId: options.ownerId,
      ownerType: options.ownerType,
    };
    return this.saveFileDetails(fileData);
  }

  // eslint-disable-next-line class-methods-use-this
  async getUserDetailById(userId) {
    const query = {};
    // eslint-disable-next-line no-underscore-dangle
    query._id = userId;
    return User.findOne(query).populate('profilePic', ['name', 'url']).lean();
  }

  async searchFriends(options = {}) {
    options.q = options.q || '';
    // remove special charater
    options.q = options.q.replace(/[^A-Z0-9]/ig, '');
    if (options.q === '') return [];
    const contacts = await contactInstance.getContactsByUserId({ userId: options.userId });
    options.contactIds = _.map(contacts, 'friendId');
    options.contactIds.push(options.userId);
    const friendList = await this.getFriendsByUserId({ _id: options.userId }, options);
    friendList.map((friend) => {
      friend.lastSeen = friend.lastSeen ? `last seen ${moment(friend.lastSeen).fromNow().toString()}` : '-';
      return friend;
    });
    return friendList;
  }

  // eslint-disable-next-line class-methods-use-this
  async loadContact(options = {}) {
    const contacts = await contactInstance.getContactsByUserId({ userId: options.userId });
    options.userIds = _.map(contacts, 'friendId');
    options.source = 'contacts';
    const contactList = await this.getFriendsByUserId({ _id: options.userId }, options);
    contactList.map((contact) => {
      contact.lastSeen = contact.lastSeen ? `last seen ${moment(contact.lastSeen).fromNow().toString()}` : '-';
      return contact;
    });
    return contactList;
  }
}

module.exports = UserController;
