const ejs = require('ejs');
const ChatMessage = require('../controllers/ChatMessage');


class Socket {
  constructor(ioconn) {
    this.users = {};
    this.chatMessage = new ChatMessage();
    ioconn.on('connection', (socket) => {
      this.addUser(socket);
      this.newMessage(socket);
      this.onTyping(socket);
      this.stopTyping(socket);
      this.onDisconnect(socket);
      this.loadMessages(socket);
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
      if (this.users[data.receiverId]) {
        const [receiverMessage, senderMessage] = await Promise.all([
          ejs.renderFile('./public/partials/main-section/sections/right-message.ejs', { data }),
          ejs.renderFile('./public/partials/main-section/sections/left-message.ejs', { data }),
        ]);
        socket.emit('new message', {
          message: senderMessage, senderId: data.receiverId,
        });
        socket.to(this.users[data.receiverId]).emit('new message', {
          message: receiverMessage, senderId: data.senderId,
        });
        await this.chatMessage.create(data);
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
    socket.on('load mesasges', (data) => {
      // eslint-disable-next-line no-console
      console.log(data);
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
