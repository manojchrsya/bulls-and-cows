const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChatMessageSchema = new Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: String },
}, {
  toObject: { virtuals: true },
  timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' },
});

ChatMessageSchema.virtual('user', {
  ref: 'Users',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true, // for many-to-1 relationships
});

ChatMessageSchema.virtual('receiver', {
  ref: 'Users',
  localField: 'receiverId',
  foreignField: '_id',
  justOne: true, // for many-to-1 relationships
});


module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
