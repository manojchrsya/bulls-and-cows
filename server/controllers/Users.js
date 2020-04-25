const _ = require('lodash');
const User = require('../models/Users');

class UserController {
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
}

module.exports = UserController;
