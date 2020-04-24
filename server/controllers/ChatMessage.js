const ChatMessage = require('../models/ChatMessage');

class ChatMessageController {
  // eslint-disable-next-line class-methods-use-this
  async create(options = {}) {
    const data = {
      senderId: options.senderId,
      receiverId: options.receiverId,
      message: options.message,
    };
    return new ChatMessage(data).save();
  }

  // eslint-disable-next-line class-methods-use-this
  async getChatMessages(options = {}) {
    const query = {
      $or: [
        {
          senderId: options.senderId,
          receiverId: options.receiverId,
        },
        {
          senderId: options.receiverId,
          receiverId: options.senderId,
        },
      ],
    };
    return (await ChatMessage.find(query).sort({ createdOn: -1 }).limit(10)).reverse();
  }
}

module.exports = ChatMessageController;
