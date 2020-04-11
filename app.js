
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const compression = require('compression');
const io = require('socket.io');

mongoose.Promise = global.Promise;
require('dotenv').config();

const config = require('./config');

// connection to database
const mongodbUri = `mongodb://${config.MONGO_HOST}`;
const mongooseOptions = { useNewUrlParser: true, useUnifiedTopology: true };
if (config.MONGO_USER && config.MONGO_PASSWORD) {
  mongooseOptions.auth = {};
  mongooseOptions.auth.user = config.MONGO_USER;
  mongooseOptions.auth.password = config.MONGO_PASSWORD;
}
mongoose.connect(mongodbUri, mongooseOptions);
const conn = mongoose.connection;
// eslint-disable-next-line no-console
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => {
  // eslint-disable-next-line no-console
  console.log('connected to database.');
});

// Create global app object
const app = express();
const users = require('./server/routes/users');

app.use(express.static('assets'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());
app.use(users);

app.set('views', `${__dirname}/public`);
app.set('view engine', 'ejs');

// / catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// finally, let's start our server...
const server = app.listen(process.env.PORT || 3000, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${server.address().port}`);
});

const ioconn = io(server);
let numUsers = 0;
// initializing the socker connection
ioconn.on('connection', (socket) => {
  let addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data,
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;
    // we store the username in the socket session for this client
    socket.username = username;
    // eslint-disable-next-line no-plusplus
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers,
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers,
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username,
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username,
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      // eslint-disable-next-line no-plusplus
      --numUsers;
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers,
      });
    }
  });
});
