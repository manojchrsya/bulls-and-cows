const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;
// const SALT_WORK_FACTOR = 10;

const UsersSchema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String },
  email: { type: String, required: true },
  dob: { type: Date },
  password: { type: String, required: true, select: false },
});

UsersSchema.methods.generateHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

// checking if password is valid
// UsersSchema.methods.validPassword = password => bcrypt.compareSync(password, this.password);
UsersSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Users', UsersSchema);
