const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;
const SALT_WORK_FACTOR = 10;

const UsersSchema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: String,
  dob: { type: Date },
  password: { type: String, required: true },
});

// encrypts the password before saving the user data
UsersSchema.pre('save', function (next) {
  const user = this;
  bcrypt.genSalt(SALT_WORK_FACTOR, (error, salt) => {
    if (error) return next(error);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model('Users', UsersSchema);
