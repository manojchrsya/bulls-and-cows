const mongoose = require('mongoose');

const { Schema } = mongoose;

const ContactSchema = new Schema({
  userId: { type: String },
  friendId: { type: String },
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

module.exports = mongoose.model('Contact', ContactSchema);
