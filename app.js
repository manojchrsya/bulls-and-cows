
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const compression = require('compression');
const passport = require('passport');
const bluebird = require('bluebird');
const lodash = require('lodash');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const io = require('socket.io');

const Socket = require('./server/lib/socket');

global.Promise = bluebird;
global._ = lodash;
mongoose.Promise = global.Promise;

require('dotenv').config();
const config = require('./config');

// connection to database
const mongodbUri = config.MONGO_HOST;
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
const Routes = require('./server/routes');
const Passport = require('./server/lib/passport');
// eslint-disable-next-line no-new
new Passport(passport);

app.use(express.static('assets'));
app.use(compression());

// set up our express application
// app.use(express.logger('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating
app.set('views', `${__dirname}/public`);
// required for passport
app.use(session({
  secret: 'thisismysnapappproject',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: conn }),
  cookie: { maxAge: 24 * 60 * 60 * 365 },
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use((req, res, next) => {
  next();
});
app.use(new Routes(passport).loadRoutes());

// finally, let's start our server...
const server = app.listen(process.env.PORT || 3000, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${server.address().port}`);
});

const ioconn = io(server);
// eslint-disable-next-line no-new
new Socket(ioconn);
// initializing the socker connection
