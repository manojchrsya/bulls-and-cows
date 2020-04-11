const User = require('../models/Users');

class UserController {
  // eslint-disable-next-line class-methods-use-this
  async create(options) {
    return new User(options).save();
  }

  // eslint-disable-next-line class-methods-use-this
  list(options = {}) {
    const query = {};
    if (options.q) {
      const regex = new RegExp(options.q);
      query.name = { $regex: regex, $options: 'i' };
    }
    return User.find(query).select({
      name: 1, email: 1, dob: 1, mobile: 1,
    });
  }
}

module.exports = UserController;
