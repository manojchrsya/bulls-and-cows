const ChatMessage = require('../models/ChatMessage');

class ChatMessageController {
  // eslint-disable-next-line class-methods-use-this
  async create(options = {}) {
    const data = {
      senderId: options.senderId,
      receiverId: options.receiverId,
      message: options.message,
    };
    console.log(data);
    return new ChatMessage(data).save();
  }
}

module.exports = ChatMessageController;
