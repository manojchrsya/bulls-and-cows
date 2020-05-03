const ejs = require('ejs');
const moment = require('moment');

const ChatMessage = require('../controllers/ChatMessage');
const User = require('../controllers/Users');
const Contact = require('../controllers/Contact');


class Socket {
  constructor(ioconn) {
    this.users = {};
    this.chatMessage = new ChatMessage();
    this.userInstance = new User();
    this.contactInstance = new Contact();
    ioconn.on('connection', (socket) => {
      this.addUser(socket);
      this.newMessage(socket);
      this.searchFriend(socket);
      this.addFriend(socket);
      this.onTyping(socket);
      this.stopTyping(socket);
      this.onDisconnect(socket);
      this.loadMessages(socket);
      this.loadContact(socket);
      this.removeContact(socket);
      this.saveProfileData(socket);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  addUser(socket) {
    socket.on('add user', async (data) => {
      this.users[data.userId] = socket.id;
      socket.userId = data.userId;
    });
  }

  newMessage(socket) {
    socket.on('new message', async (data) => {
      if (data.senderId && data.receiverId) {
        data.timeAgo = moment().fromNow().toString();
        // adding user details in data object
        data.user = await this.userInstance.getUserDetailById(data.senderId);
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
        const [sender, receiver] = await Promise.all([
          this.userInstance.getUserDetailById(data.senderId),
          this.userInstance.getUserDetailById(data.receiverId),
        ]);
        await Promise.mapSeries(chatMessages, async (chat) => {
          let currentChat;
          chat.timeAgo = moment(chat.createdOn).fromNow().toString();
          if (chat.senderId === data.senderId) {
            chat.user = sender;
            currentChat = await ejs.renderFile('./public/partials/main-section/sections/left-message.ejs', chat);
          } else {
            chat.user = receiver;
            currentChat = await ejs.renderFile('./public/partials/main-section/sections/right-message.ejs', chat);
          }
          messages.push(currentChat);
        });
        receiver.lastSeen = receiver.lastSeen ? moment(receiver.lastSeen).calendar() : '-';
        const profile = await ejs.renderFile('./public/partials/main-section/sections/right-profile.ejs', { user: receiver });
        socket.emit('new message', {
          message: messages.join(''),
          senderId: data.receiverId,
          profile,
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
  searchFriend(socket) {
    socket.on('search friend', async (data) => {
      if (data.userId) {
        const friendList = await this.userInstance.searchFriends(data);
        const friends = await ejs.renderFile('./public/partials/sidebar/sections/contact.ejs', { friends: friendList, source: 'friend' });
        socket.emit('search friend', { friends });
      }
    });
  }

  loadContact(socket) {
    socket.on('load contact', async (data) => {
      if (data.userId) {
        const contactList = await this.userInstance.loadContact(data);
        const contacts = await ejs.renderFile('./public/partials/sidebar/sections/contact.ejs', { friends: contactList, source: 'contact' });
        socket.emit('load contact', { contacts });
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  addFriend(socket) {
    socket.on('add friend', async (data) => {
      if (data.userId && data.friendId) {
        const [userContact] = await Promise.all([
          this.contactInstance.addFriendByUserId(data),
          this.contactInstance.addFriendByUserId({ userId: data.friendId, friendId: data.userId }),
        ]);
        socket.emit('add friend', userContact);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  removeContact(socket) {
    socket.on('remove contact', async (data) => {
      if (data.userId && data.friendId) {
        await this.contactInstance.deleteFriendByUserId(data);
        socket.emit('remove contact', data);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnect(socket) {
    socket.on('disconnect', async () => {
      if (socket.userId) {
        await this.userInstance.saveProfile({ id: socket.userId, lastSeen: moment().toDate() });
      }
      socket.emit('disconnected');
    });
  }
}

module.exports = Socket;
