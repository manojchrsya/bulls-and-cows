const express = require('express');

const router = express.Router();
const Users = require('../controllers/Users');

const userInstance = new Users();
// Get all users
// you can filter the result by passing `q` paramenter in query string
// eg: localhost:3000/?q=manoj
router.get('/', async (req, res) => {
  const data = await userInstance.list(req.query);
  return res.render('index', { users: data });
});

// eslint-disable-next-line arrow-body-style
router.post('/', async (req, res) => {
  return userInstance.create(req.body)
    .then(user => res.send(user))
    .catch(error => res.status(422).json(error));
});

module.exports = router;
