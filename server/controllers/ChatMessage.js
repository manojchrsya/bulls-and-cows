const _ = require('lodash');
const moment = require('moment');
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
    return (await ChatMessage.find(query)
      .sort({ createdOn: -1 })
      .limit(10)).reverse();
  }

  // eslint-disable-next-line class-methods-use-this
  async getLastChatMessage(options = {}) {
    const { friendIds = [], userId } = options;
    const chatQuery = [];
    friendIds.forEach((friendId) => {
      chatQuery.push({ senderId: userId.toString(), receiverId: friendId });
      chatQuery.push({ senderId: friendId, receiverId: userId.toString() });
    });
    let results = await ChatMessage.aggregate([
      { $sort: { createdOn: 1 } },
      {
        $match: {
          $and: [{
            $or: chatQuery,
          }],
        },
      },
      {
        $group: {
          _id: { senderId: '$senderId', receiverId: '$receiverId' },
          senderId: { $last: '$senderId' },
          receiverId: { $last: '$receiverId' },
          message: { $last: '$message' },
          createdOn: { $last: '$createdOn' },
        },
      },
    ]);
    results = _.sortBy(results, 'createdOn').reverse();
    const data = results.map((result) => {
      const index = _.findIndex(results, { senderId: result.receiverId, receiverId: result.senderId });
      if (index !== -1) results.splice(index, 1);
      result.createdOn = moment(result.createdOn).format('LT');
      return _.omit(result, '_id');
    });
    return _.compact(data);
  }
}

module.exports = ChatMessageController;
