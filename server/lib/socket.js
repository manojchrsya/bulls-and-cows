const ejs = require('ejs');
const moment = require('moment');

const ChatMessage = require('../controllers/ChatMessage');
const User = require('../controllers/Users');


class Socket {
  constructor(ioconn) {
    this.users = {};
    this.chatMessage = new ChatMessage();
    this.userInstance = new User();
    ioconn.on('connection', (socket) => {
      this.addUser(socket);
      this.newMessage(socket);
      this.onTyping(socket);
      this.stopTyping(socket);
      this.onDisconnect(socket);
      this.loadMessages(socket);
      this.saveProfileData(socket);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  addUser(socket) {
    socket.on('add user', async (data) => {
      this.users[data.userId] = socket.id;
    });
  }

  newMessage(socket) {
    socket.on('new message', async (data) => {
      if (data.senderId && data.receiverId) {
        data.timeAgo = moment().fromNow().toString();
        const [receiverMessage, senderMessage] = await Promise.all([
          ejs.renderFile('./public/partials/main-section/sections/right-message.ejs', data),
          ejs.renderFile('./public/partials/main-section/sections/left-message.ejs', data),
        ]);
        socket.emit('new message', {
          message: senderMessage, senderId: data.receiverId,
        });
        await this.chatMessage.create(data);
        if (this.users[data.receiverId]) {
          socket.to(this.users[data.receiverId]).emit('new message', {
            message: receiverMessage, senderId: data.senderId,
          });
        }
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  onTyping(socket) {
    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
      socket.broadcast.emit('typing', {
        username: socket.username,
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  stopTyping(socket) {
    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', {
        username: socket.username,
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  loadMessages(socket) {
    socket.on('load mesasges', async (data) => {
      // eslint-disable-next-line no-console
      if (data.senderId && data.receiverId) {
        const chatMessages = await this.chatMessage.getChatMessages(data);
        const messages = [];
        await Promise.mapSeries(chatMessages, async (chat) => {
          let currentChat;
          chat.timeAgo = moment(chat.createdOn).fromNow().toString();
          if (chat.senderId === data.senderId) {
            currentChat = await ejs.renderFile('./public/partials/main-section/sections/left-message.ejs', chat);
          } else {
            currentChat = await ejs.renderFile('./public/partials/main-section/sections/right-message.ejs', chat);
          }
          messages.push(currentChat);
        });
        socket.emit('new message', {
          message: messages.join(''), senderId: data.receiverId,
        });
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  saveProfileData(socket) {
    socket.on('save profile', async (data) => {
      if (data.id) {
        await this.userInstance.saveProfile(data);
        socket.emit('save profile', {
          message: 'profile updated successfully',
        });
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnect(socket) {
    socket.on('disconnect', () => {
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
      });
    });
  }
}

module.exports = Socket;
