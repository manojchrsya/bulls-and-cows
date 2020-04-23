const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChatMessageSchema = new Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: String },
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });


module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
