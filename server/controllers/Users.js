const _ = require('lodash');
const User = require('../models/Users');
const FileResource = require('./FileResource');

class UserController extends FileResource {
  // eslint-disable-next-line class-methods-use-this
  async list(options = {}) {
    const query = {};
    if (options.q) {
      const regex = new RegExp(options.q);
      query.name = { $regex: regex, $options: 'i' };
    }
    return User.find(query).select({
      name: 1, email: 1, dob: 1, mobile: 1,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async getFriendsByUserId(user) {
    const query = {};
    // eslint-disable-next-line no-underscore-dangle
    if (user._id) {
      // eslint-disable-next-line no-underscore-dangle
      query._id = { $nin: [user._id] };
    }
    return User.find(query).select({
      name: 1, email: 1, dob: 1, mobile: 1,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async saveProfile(options = {}) {
    const fields = ['id', 'name', 'mobile', 'bio', 'social.twitter', 'social.facebook',
      'social.instagram', 'social.github', 'social.slack'];
    const profileData = _.pickBy(_.pick(options, fields), _.identity);
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
}

module.exports = UserController;
